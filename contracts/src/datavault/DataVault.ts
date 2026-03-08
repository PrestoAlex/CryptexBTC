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

export class DataVault extends OP_NET {
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

  private getPasswordHashPointer(index: u16): u16 {
    return <u16>(VAULTS_BASE_POINTER + index * 2 + 1);
  }

  @method(
    'createVault',
    { name: 'dataHash', type: ABIDataTypes.UINT256 },
    { name: 'passwordHash', type: ABIDataTypes.UINT256 },
  )
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public createVault(calldata: Calldata): BytesWriter {
    const dataHashVal = calldata.readU256();
    const pwdHash = calldata.readU256();

    if (u256.eq(dataHashVal, u256.Zero)) {
      throw new Revert('Invalid data hash');
    }
    if (u256.eq(pwdHash, u256.Zero)) {
      throw new Revert('Invalid password hash');
    }

    const index = <u16>this.vaultCount.value.toU64();
    const dataHashSlot = new StoredU256(this.getDataHashPointer(index), EMPTY_POINTER);
    const passwordHashSlot = new StoredU256(this.getPasswordHashPointer(index), EMPTY_POINTER);

    dataHashSlot.set(dataHashVal);
    passwordHashSlot.set(pwdHash);
    this.vaultCount.set(u256.add(this.vaultCount.value, u256.One));

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }

  @method('unlockWithPassword', { name: 'passwordHash', type: ABIDataTypes.UINT256 })
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public unlockWithPassword(calldata: Calldata): BytesWriter {
    const providedHash = calldata.readU256();

    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const passwordHashSlot = new StoredU256(this.getPasswordHashPointer(lastIndex), EMPTY_POINTER);

    if (!u256.eq(providedHash, passwordHashSlot.value)) {
      throw new Revert('Invalid password');
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

  @method('getPasswordHash')
  @returns({ name: 'passwordHash', type: ABIDataTypes.UINT256 })
  public getPasswordHash(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const passwordHashSlot = new StoredU256(this.getPasswordHashPointer(lastIndex), EMPTY_POINTER);
    const bw = new BytesWriter(32);
    bw.writeU256(passwordHashSlot.value);
    return bw;
  }

  @method('changePassword')
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public changePassword(calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const oldPasswordHash = calldata.readU256();
    const newPasswordHash = calldata.readU256();

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const passwordHashSlot = new StoredU256(this.getPasswordHashPointer(lastIndex), EMPTY_POINTER);

    // Verify old password
    if (!u256.eq(passwordHashSlot.value, oldPasswordHash)) {
      throw new Revert('Invalid old password');
    }

    // Set new password
    passwordHashSlot.set(newPasswordHash);

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
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
