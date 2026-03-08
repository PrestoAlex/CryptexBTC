import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const DataVaultEvents = [];

export const DataVaultAbi = [
    {
        name: 'createVault',
        inputs: [
            { name: 'dataHash', type: ABIDataTypes.UINT256 },
            { name: 'passwordHash', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'unlockWithPassword',
        inputs: [{ name: 'passwordHash', type: ABIDataTypes.UINT256 }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getDataHash',
        inputs: [],
        outputs: [{ name: 'dataHash', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getPasswordHash',
        inputs: [],
        outputs: [{ name: 'passwordHash', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getIsActive',
        inputs: [],
        outputs: [{ name: 'isActive', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getVaultCount',
        inputs: [],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    ...DataVaultEvents,
    ...OP_NET_ABI,
];

export default DataVaultAbi;
