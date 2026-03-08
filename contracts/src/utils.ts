import {
  Blockchain,
  EMPTY_POINTER,
  StoredAddress,
  StoredU256,
  StoredBoolean,
  Address,
  Revert,
  U256_BYTE_LENGTH,
} from '@btc-vision/btc-runtime/runtime';
import { u256 } from '@btc-vision/as-bignum/assembly';

export function getNextStoredU256(): StoredU256 {
  return new StoredU256(Blockchain.nextPointer, EMPTY_POINTER);
}

export function getNextStoredAddress(): StoredAddress {
  return new StoredAddress(Blockchain.nextPointer);
}

export function getNextStoredBoolean(): StoredBoolean {
  return new StoredBoolean(Blockchain.nextPointer);
}

export function requireOwner(owner: Address): void {
  if (Blockchain.tx.sender != owner) {
    throw new Revert('Only owner can call this function');
  }
}

export function requireActive(active: u256): void {
  if (active == u256.Zero) {
    throw new Revert('Vault is not active');
  }
}

export function requireNotUnlocked(isUnlocked: u256): void {
  if (isUnlocked != u256.Zero) {
    throw new Revert('Vault is already unlocked');
  }
}

export function requireNonZeroAddress(addr: Address): void {
  const emptyAddr = Address.fromString('');
  if (addr == emptyAddr) {
    throw new Revert('Address cannot be zero');
  }
}

export function requireNonZeroAmount(amount: u256): void {
  if (amount == u256.Zero) {
    throw new Revert('Amount must be greater than zero');
  }
}

export function getCurrentBlock(): u256 {
  return u256.from(Blockchain.block.number);
}

export function isBlockReached(unlockBlock: u256): boolean {
  return u256.from(Blockchain.block.number) >= unlockBlock;
}

export function u256ToKey(id: u256): Uint8Array {
  const key = new Uint8Array(U256_BYTE_LENGTH);
  const dataStart = key.dataStart;
  store<u64>(dataStart, id.lo1, 0);
  store<u64>(dataStart, id.lo2, 8);
  store<u64>(dataStart, id.hi1, 16);
  store<u64>(dataStart, id.hi2, 24);
  return key;
}
