import { u256 } from '@btc-vision/as-bignum/assembly';
import {
  Blockchain,
  BytesWriter,
  Calldata,
  EMPTY_POINTER,
  OP_NET,
  Revert,
  StoredU256,
} from '@btc-vision/btc-runtime/runtime';

declare function method(...args: any[]): any;
declare function returns(...args: any[]): any;
declare const ABIDataTypes: any;

const VAULT_COUNT_POINTER: u16 = Blockchain.nextPointer;
const VAULTS_BASE_POINTER: u16 = Blockchain.nextPointer;

export class TimeVault extends OP_NET {
  private vaultCount: StoredU256;

  public constructor() {
    super();
    this.vaultCount = new StoredU256(VAULT_COUNT_POINTER, EMPTY_POINTER);
  }

  public override onDeployment(_calldata: Calldata): void {
    super.onDeployment(_calldata);
    this.vaultCount.set(u256.Zero);
  }

  private getDataHashPointer(index: u16): u16 {
    return <u16>(VAULTS_BASE_POINTER + index * 2);
  }

  private getUnlockBlockPointer(index: u16): u16 {
    return <u16>(VAULTS_BASE_POINTER + index * 2 + 1);
  }

  @method(
    'createVault',
    { name: 'dataHash', type: ABIDataTypes.UINT256 },
    { name: 'unlockBlock', type: ABIDataTypes.UINT256 },
  )
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public createVault(calldata: Calldata): BytesWriter {
    const dataHashVal = calldata.readU256();
    const unlockBlockVal = calldata.readU256();

    if (u256.eq(dataHashVal, u256.Zero)) {
      throw new Revert('Invalid data hash');
    }
    if (u256.le(unlockBlockVal, u256.from(Blockchain.block.number))) {
      throw new Revert('Unlock block must be in future');
    }

    const index = <u16>this.vaultCount.value.toU64();
    const dataHashSlot = new StoredU256(this.getDataHashPointer(index), EMPTY_POINTER);
    const unlockBlockSlot = new StoredU256(this.getUnlockBlockPointer(index), EMPTY_POINTER);

    dataHashSlot.set(dataHashVal);
    unlockBlockSlot.set(unlockBlockVal);
    this.vaultCount.set(u256.add(this.vaultCount.value, u256.One));

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }

  @method('unlockAfterTime')
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public unlockAfterTime(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const currentBlock = u256.from(Blockchain.block.number);
    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const unlockBlockSlot = new StoredU256(this.getUnlockBlockPointer(lastIndex), EMPTY_POINTER);

    if (u256.lt(currentBlock, unlockBlockSlot.value)) {
      throw new Revert('Unlock time not reached');
    }

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }

  @method('getDataHash')
  @returns({ name: 'dataHash', type: ABIDataTypes.UINT256 })
  public getDataHash(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const dataHashSlot = new StoredU256(this.getDataHashPointer(lastIndex), EMPTY_POINTER);
    const bw = new BytesWriter(32);
    bw.writeU256(dataHashSlot.value);
    return bw;
  }

  @method('getUnlockBlock')
  @returns({ name: 'unlockBlock', type: ABIDataTypes.UINT256 })
  public getUnlockBlock(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const unlockBlockSlot = new StoredU256(this.getUnlockBlockPointer(lastIndex), EMPTY_POINTER);
    const bw = new BytesWriter(32);
    bw.writeU256(unlockBlockSlot.value);
    return bw;
  }

  @method('getTimeRemaining')
  @returns({ name: 'remaining', type: ABIDataTypes.UINT256 })
  public getTimeRemaining(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const unlockBlockSlot = new StoredU256(this.getUnlockBlockPointer(lastIndex), EMPTY_POINTER);
    const currentBlock = u256.from(Blockchain.block.number);
    
    let remaining: u256;
    if (u256.lt(unlockBlockSlot.value, currentBlock)) {
      remaining = u256.Zero; // Already unlocked
    } else {
      remaining = u256.sub(unlockBlockSlot.value, currentBlock);
    }

    const bw = new BytesWriter(32);
    bw.writeU256(remaining);
    return bw;
  }

  @method('getIsActive')
  @returns({ name: 'isActive', type: ABIDataTypes.BOOL })
  public getIsActive(_calldata: Calldata): BytesWriter {
    const bw = new BytesWriter(1);
    bw.writeBoolean(!u256.eq(this.vaultCount.value, u256.Zero));
    return bw;
  }

  @method('getVaultCount')
  @returns({ name: 'count', type: ABIDataTypes.UINT256 })
  public getVaultCount(_calldata: Calldata): BytesWriter {
    const bw = new BytesWriter(32);
    bw.writeU256(this.vaultCount.value);
    return bw;
  }
}
