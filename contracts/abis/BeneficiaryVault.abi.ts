import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const BeneficiaryVaultEvents = [];

export const BeneficiaryVaultAbi = [
    {
        name: 'createVault',
        inputs: [
            { name: 'dataHash', type: ABIDataTypes.UINT256 },
            { name: 'beneficiary', type: ABIDataTypes.ADDRESS },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'unlockByBeneficiary',
        inputs: [],
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
        name: 'getBeneficiary',
        inputs: [],
        outputs: [{ name: 'beneficiary', type: ABIDataTypes.ADDRESS }],
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
    ...BeneficiaryVaultEvents,
    ...OP_NET_ABI,
];

export default BeneficiaryVaultAbi;
