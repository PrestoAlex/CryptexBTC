// Contract addresses for the CryptexBTC protocol
export const CONTRACT_ADDRESSES = {
  // The main factory for creating new DataVaults
  vaultFactory: 'opt1sqq06zpphcge0xepm6jua7zlghf6r5g0k4cl0vg4e',

  // The contract that logs all access and audit events
  accessAudit: 'opt1sqq5d6k7sywghajwth0j74xgr64rkaf9cgqg7sx7a',

  // Template contract for new DataVault deployments
  dataVaultTemplate: 'opt1sqqcn9x4yzmck288uehtj0t7xj4wxv6hfycfyduly',
  timeVaultTemplate: 'opt1sqq9dac3l3288c26twj037d0q7hqzkkkuwsvrw6jh',
  beneficiaryVaultTemplate: 'opt1sqr3dgjt2nkprmv4fsjxd5v89795uzmnjmgc8f0t2',
  deadManVaultTemplate: 'opt1sqzrkuxgt604nmhs09cl9wyfhs2gu6ag4kcuqwhsr',
};

export const OP_NET_CONFIG = {
  rpcUrl: 'https://testnet.opnet.org',
  network: 'testnet',
};
