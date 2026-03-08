import {
  Address,
  Blockchain,
  BytesWriter,
  Calldata,
  EMPTY_POINTER,
  OP_NET,
  Revert,
  StoredU256,
  StoredAddress,
} from '@btc-vision/btc-runtime/runtime';
import { u256 } from '@btc-vision/as-bignum/assembly';

declare function method(...args: any[]): any;
declare function returns(...args: any[]): any;
declare const ABIDataTypes: any;

const VAULT_COUNT_POINTER: u16 = Blockchain.nextPointer;
const VAULTS_BASE_POINTER: u16 = Blockchain.nextPointer;

export class BeneficiaryVault extends OP_NET {
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

  private getBeneficiaryPointer(index: u16): u16 {
    return <u16>(VAULTS_BASE_POINTER + index * 2 + 1);
  }

  @method(
    'createVault',
    { name: 'dataHash', type: ABIDataTypes.UINT256 },
    { name: 'beneficiary', type: ABIDataTypes.ADDRESS },
  )
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public createVault(calldata: Calldata): BytesWriter {
    const dataHashVal = calldata.readU256();
    const beneficiaryAddr = calldata.readAddress();

    if (u256.eq(dataHashVal, u256.Zero)) {
      throw new Revert('Invalid data hash');
    }
    if (beneficiaryAddr == Address.zero()) {
      throw new Revert('Invalid beneficiary address');
    }

    const index = <u16>this.vaultCount.value.toU64();
    const dataHashSlot = new StoredU256(this.getDataHashPointer(index), EMPTY_POINTER);
    const beneficiarySlot = new StoredAddress(this.getBeneficiaryPointer(index));

    dataHashSlot.set(dataHashVal);
    beneficiarySlot.value = beneficiaryAddr;
    this.vaultCount.set(u256.add(this.vaultCount.value, u256.One));

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }

  @method('unlockByBeneficiary')
  @returns({ name: 'success', type: ABIDataTypes.BOOL })
  public unlockByBeneficiary(_calldata: Calldata): BytesWriter {
    if (u256.eq(this.vaultCount.value, u256.Zero)) {
      throw new Revert('No vaults created');
    }

    const lastIndex = <u16>(this.vaultCount.value.toU64() - 1);
    const beneficiarySlot = new StoredAddress(this.getBeneficiaryPointer(lastIndex));

    if (Blockchain.tx.sender != beneficiarySlot.value) {
      throw new Revert('Only beneficiary can unlock');
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
