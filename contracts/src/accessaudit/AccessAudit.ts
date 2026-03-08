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

// Event types
const EVENT_VAULT_CREATED: u64 = 0;
const EVENT_UNLOCK_SUCCESS: u64 = 1;
const EVENT_UNLOCK_FAILED: u64 = 2;
const EVENT_BENEFICIARY_CLAIM: u64 = 3;
const EVENT_DEAD_MAN_TRIGGERED: u64 = 4;
const EVENT_VAULT_UPDATED: u64 = 5;
const EVENT_PING: u64 = 6;

export class AccessAudit extends OP_NET {
  private owner: StoredAddress;
  private totalEvents: StoredU256;
  private vaultCreations: StoredU256;
  private unlockAttempts: StoredU256;
  private successfulUnlocks: StoredU256;
  private failedUnlocks: StoredU256;
  private beneficiaryClaims: StoredU256;
  private deadManTriggers: StoredU256;
  private lastEventBlock: StoredU256;
  private authorizedLogger: StoredAddress;

  constructor() {
    super();
    this.owner = getNextStoredAddress();
    this.totalEvents = getNextStoredU256();
    this.vaultCreations = getNextStoredU256();
    this.unlockAttempts = getNextStoredU256();
    this.successfulUnlocks = getNextStoredU256();
    this.failedUnlocks = getNextStoredU256();
    this.beneficiaryClaims = getNextStoredU256();
    this.deadManTriggers = getNextStoredU256();
    this.lastEventBlock = getNextStoredU256();
    this.authorizedLogger = getNextStoredAddress();
  }

  public override onDeployment(_calldata: Calldata): void {
    super.onDeployment(_calldata);
    this.owner.value = Blockchain.tx.sender;
    this.authorizedLogger.value = Blockchain.tx.sender;
    this.totalEvents.set(u256.Zero);
    this.vaultCreations.set(u256.Zero);
    this.unlockAttempts.set(u256.Zero);
    this.successfulUnlocks.set(u256.Zero);
    this.failedUnlocks.set(u256.Zero);
    this.beneficiaryClaims.set(u256.Zero);
    this.deadManTriggers.set(u256.Zero);
    this.lastEventBlock.set(getCurrentBlock());
  }

  @method('logEvent')
  public logEvent(calldata: Calldata): BytesWriter {
    const caller = Blockchain.tx.sender;
    if (caller != this.owner.value && caller != this.authorizedLogger.value) {
      throw new Revert('Not authorized to log events');
    }

    const eventType = calldata.readU256();
    const vaultAddress = calldata.readAddress();

    const newTotal = SafeMath.add(this.totalEvents.value, u256.One);
    this.totalEvents.set(newTotal);
    this.lastEventBlock.set(getCurrentBlock());

    const typeNum = eventType.lo1;

    if (typeNum == EVENT_VAULT_CREATED) {
      const newCreations = SafeMath.add(this.vaultCreations.value, u256.One);
      this.vaultCreations.set(newCreations);
    } else if (typeNum == EVENT_UNLOCK_SUCCESS) {
      const newAttempts = SafeMath.add(this.unlockAttempts.value, u256.One);
      this.unlockAttempts.set(newAttempts);
      const newSuccesses = SafeMath.add(this.successfulUnlocks.value, u256.One);
      this.successfulUnlocks.set(newSuccesses);
    } else if (typeNum == EVENT_UNLOCK_FAILED) {
      const newAttempts = SafeMath.add(this.unlockAttempts.value, u256.One);
      this.unlockAttempts.set(newAttempts);
      const newFails = SafeMath.add(this.failedUnlocks.value, u256.One);
      this.failedUnlocks.set(newFails);
    } else if (typeNum == EVENT_BENEFICIARY_CLAIM) {
      const newClaims = SafeMath.add(this.beneficiaryClaims.value, u256.One);
      this.beneficiaryClaims.set(newClaims);
    } else if (typeNum == EVENT_DEAD_MAN_TRIGGERED) {
      const newDMS = SafeMath.add(this.deadManTriggers.value, u256.One);
      this.deadManTriggers.set(newDMS);
    }

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }

  @method('getAuditStats')
  public getAuditStats(_calldata: Calldata): BytesWriter {
    const bw = new BytesWriter(256);
    bw.writeU256(this.totalEvents.value);
    bw.writeU256(this.vaultCreations.value);
    bw.writeU256(this.unlockAttempts.value);
    bw.writeU256(this.successfulUnlocks.value);
    bw.writeU256(this.failedUnlocks.value);
    bw.writeU256(this.beneficiaryClaims.value);
    bw.writeU256(this.deadManTriggers.value);
    bw.writeU256(this.lastEventBlock.value);
    return bw;
  }

  @method('setAuthorizedLogger')
  public setAuthorizedLogger(calldata: Calldata): BytesWriter {
    if (Blockchain.tx.sender != this.owner.value) {
      throw new Revert('Only owner can set authorized logger');
    }

    const loggerAddress = calldata.readAddress();
    this.authorizedLogger.value = loggerAddress;

    const bw = new BytesWriter(1);
    bw.writeBoolean(true);
    return bw;
  }

  @method('getTotalEvents')
  public getTotalEvents(_calldata: Calldata): BytesWriter {
    const bw = new BytesWriter(32);
    bw.writeU256(this.totalEvents.value);
    return bw;
  }
}
