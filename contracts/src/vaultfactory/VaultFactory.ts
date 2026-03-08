import {
  Address,
  Blockchain,
  BytesWriter,
  Calldata,
  OP_NET,
  StoredU256,
  StoredAddress,
  SafeMath,
  Revert,
} from '@btc-vision/btc-runtime/runtime';
import {
  getNextStoredAddress,
  getNextStoredU256,
  getCurrentBlock,
} from '../utils';
import { u256 } from '@btc-vision/as-bignum/assembly';

export class VaultFactory extends OP_NET {
  private owner: StoredAddress;
  private totalVaultsDeployed: StoredU256;
  private registryVersion: StoredU256;
  private isInitialized: StoredU256;
  private feeBasisPoints: StoredU256;
  private collectedFees: StoredU256;
  private lastDeployedBlock: StoredU256;

  constructor() {
    super();
    this.owner = getNextStoredAddress();
    this.totalVaultsDeployed = getNextStoredU256();
    this.registryVersion = getNextStoredU256();
    this.isInitialized = getNextStoredU256();
    this.feeBasisPoints = getNextStoredU256();
    this.collectedFees = getNextStoredU256();
    this.lastDeployedBlock = getNextStoredU256();
  }

  public override onDeployment(_calldata: Calldata): void {
    super.onDeployment(_calldata);
    this.owner.value = Blockchain.tx.sender;
    this.totalVaultsDeployed.set(u256.Zero);
    this.registryVersion.set(u256.One);
    this.isInitialized.set(u256.One);
    this.feeBasisPoints.set(u256.fromU64(100));
    this.collectedFees.set(u256.Zero);
    this.lastDeployedBlock.set(getCurrentBlock());
  }

  @method('registerVaultDeployment')
  public registerVaultDeployment(calldata: Calldata): BytesWriter {
    const vaultAddress = calldata.readAddress();
    const vaultType = calldata.readU256();
    const deployer = calldata.readAddress();

    if (vaultType > u256.fromU64(4)) {
      throw new Revert('Invalid vault type');
    }

    const newTotal = SafeMath.add(this.totalVaultsDeployed.value, u256.One);
    this.totalVaultsDeployed.set(newTotal);
    this.lastDeployedBlock.set(getCurrentBlock());

    const bw = new BytesWriter(32);
    bw.writeU256(newTotal);
    return bw;
  }

  @method('getFactoryStats')
  public getFactoryStats(_calldata: Calldata): BytesWriter {
    const bw = new BytesWriter(128);
    bw.writeAddress(this.owner.value);
    bw.writeU256(this.totalVaultsDeployed.value);
    bw.writeU256(this.registryVersion.value);
    bw.writeU256(this.feeBasisPoints.value);
    bw.writeU256(this.collectedFees.value);
    bw.writeU256(this.lastDeployedBlock.value);
    return bw;
  }

  @method('updateFee')
  public updateFee(calldata: Calldata): BytesWriter {
    if (Blockchain.tx.sender != this.owner.value) {
      throw new Revert('Only owner can update fee');
    }

    const newFee = calldata.readU256();
    if (newFee > u256.fromU64(1000)) {
      throw new Revert('Fee cannot exceed 10%');
    }

    this.feeBasisPoints.set(newFee);

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }

  @method('getTotalVaults')
  public getTotalVaults(_calldata: Calldata): BytesWriter {
    const bw = new BytesWriter(32);
    bw.writeU256(this.totalVaultsDeployed.value);
    return bw;
  }

  @method('getRegistryVersion')
  public getRegistryVersion(_calldata: Calldata): BytesWriter {
    const bw = new BytesWriter(32);
    bw.writeU256(this.registryVersion.value);
    return bw;
  }

  @method('transferOwnership')
  public transferOwnership(calldata: Calldata): BytesWriter {
    if (Blockchain.tx.sender != this.owner.value) {
      throw new Revert('Only owner can transfer ownership');
    }

    const newOwner = calldata.readAddress();
    this.owner.value = newOwner;

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }
}
