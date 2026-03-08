import {
  Address,
  Blockchain,
  BytesWriter,
  Calldata,
  OP_NET,
  StoredU256,
  StoredAddress,
  Revert,
  EMPTY_POINTER,
} from '@btc-vision/btc-runtime/runtime';
import { u256 } from '@btc-vision/as-bignum/assembly';

declare function method(...args: any[]): any;
declare function returns(...args: any[]): any;
declare const ABIDataTypes: any;

const VAULT_COUNT_POINTER: u16 = Blockchain.nextPointer;
const VAULTS_BASE_POINTER: u16 = Blockchain.nextPointer;

export class DeadManVault extends OP_NET {
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
    return <u16>(VAULTS_BASE_POINTER + index * 3);
  }

  private getBeneficiaryPointer(index: u16): u16 {
    return <u16>(VAULTS_BASE_POINTER + index * 3 + 1);
  }

  private getIntervalPointer(index: u16): u16 {
    return <u16>(VAULTS_BASE_POINTER + index * 3 + 2);
  }

  private getLastPingPointer(index: u16): u16 {
    return <u16>(VAULTS_BASE_POINTER + index * 3 + 3);
  }

  @method(
    'createVault',
    { name: 'dataHash', type: ABIDataTypes.UINT256 },
    { name: 'beneficiary', type: ABIDataTypes.ADDRESS },
    { name: 'deadManInterval', type: ABIDataTypes.UINT256 },
  )
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public createVault(calldata: Calldata): BytesWriter {
    const dataHashVal = calldata.readU256();
    const beneficiaryAddr = calldata.readAddress();
    const intervalVal = calldata.readU256();

    if (dataHashVal == u256.Zero) {
      throw new Revert('Invalid data hash');
    }
    if (beneficiaryAddr == Address.zero()) {
      throw new Revert('Invalid beneficiary address');
    }
    if (intervalVal == u256.Zero) {
      throw new Revert('Invalid dead man interval');
    }

    const index = <u16>this.vaultCount.value.toU64();
    const dataHashSlot = new StoredU256(this.getDataHashPointer(index), EMPTY_POINTER);
    const beneficiarySlot = new StoredAddress(this.getBeneficiaryPointer(index));
    const intervalSlot = new StoredU256(this.getIntervalPointer(index), EMPTY_POINTER);
    const lastPingSlot = new StoredU256(this.getLastPingPointer(index), EMPTY_POINTER);

    dataHashSlot.set(dataHashVal);
    beneficiarySlot.value = beneficiaryAddr;
    intervalSlot.set(intervalVal);
    lastPingSlot.set(u256.from(Blockchain.block.number));
    this.vaultCount.set(u256.add(this.vaultCount.value, u256.One));

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }

  @method('ping')
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public ping(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const lastPingSlot = new StoredU256(this.getLastPingPointer(lastIndex), EMPTY_POINTER);
    
    lastPingSlot.set(u256.from(Blockchain.block.number));

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }

  @method('unlockByDeadManSwitch')
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public unlockByDeadManSwitch(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const beneficiarySlot = new StoredAddress(this.getBeneficiaryPointer(lastIndex));
    const intervalSlot = new StoredU256(this.getIntervalPointer(lastIndex), EMPTY_POINTER);
    const lastPingSlot = new StoredU256(this.getLastPingPointer(lastIndex), EMPTY_POINTER);

    if (Blockchain.tx.sender != beneficiarySlot.value) {
      throw new Revert('Only beneficiary can trigger dead man switch');
    }

    const currentBlock = u256.from(Blockchain.block.number);
    const elapsed = u256.sub(currentBlock, lastPingSlot.value);

    if (u256.lt(elapsed, intervalSlot.value)) {
      throw new Revert('Dead man interval not reached');
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

  @method('getBeneficiary')
  @returns({ name: 'beneficiary', type: ABIDataTypes.ADDRESS })
  public getBeneficiary(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const beneficiarySlot = new StoredAddress(this.getBeneficiaryPointer(lastIndex));
    const bw = new BytesWriter(32);
    bw.writeAddress(beneficiarySlot.value);
    return bw;
  }

  @method('getDeadManInterval')
  @returns({ name: 'interval', type: ABIDataTypes.UINT256 })
  public getDeadManInterval(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const intervalSlot = new StoredU256(this.getIntervalPointer(lastIndex), EMPTY_POINTER);
    const bw = new BytesWriter(32);
    bw.writeU256(intervalSlot.value);
    return bw;
  }

  @method('getLastPing')
  @returns({ name: 'lastPing', type: ABIDataTypes.UINT256 })
  public getLastPing(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const lastPingSlot = new StoredU256(this.getLastPingPointer(lastIndex), EMPTY_POINTER);
    const bw = new BytesWriter(32);
    bw.writeU256(lastPingSlot.value);
    return bw;
  }

  @method('getIsActive')
  @returns({ name: 'isActive', type: ABIDataTypes.BOOL })
  public getIsActive(_calldata: Calldata): BytesWriter {
    const bw = new BytesWriter(1);
    bw.writeBoolean(!u256.eq(this.vaultCount.value, u256.Zero));
    return bw;
  }

  @method('getRemainingBlocks')
  @returns({ name: 'remaining', type: ABIDataTypes.UINT256 })
  public getRemainingBlocks(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const intervalSlot = new StoredU256(this.getIntervalPointer(lastIndex), EMPTY_POINTER);
    const lastPingSlot = new StoredU256(this.getLastPingPointer(lastIndex), EMPTY_POINTER);
    
    const currentBlock = u256.from(Blockchain.block.number);
    const elapsed = u256.sub(currentBlock, lastPingSlot.value);
    
    let remaining: u256;
    if (u256.ge(elapsed, intervalSlot.value)) {
      remaining = u256.Zero; // Dead man switch already triggered
    } else {
      remaining = u256.sub(intervalSlot.value, elapsed);
    }

    const bw = new BytesWriter(32);
    bw.writeU256(remaining);
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
