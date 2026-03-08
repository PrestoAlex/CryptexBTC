import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const VaultFactoryEvents = [];

export const VaultFactoryAbi = [
    {
        name: 'registerVaultDeployment',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getFactoryStats',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'updateFee',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getTotalVaults',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getRegistryVersion',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'transferOwnership',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    ...VaultFactoryEvents,
    ...OP_NET_ABI,
];

export default VaultFactoryAbi;
