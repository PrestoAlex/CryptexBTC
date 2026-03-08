import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const AccessAuditEvents = [];

export const AccessAuditAbi = [
    {
        name: 'logEvent',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getAuditStats',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'setAuthorizedLogger',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getTotalEvents',
        inputs: [],
        outputs: [],
        type: BitcoinAbiTypes.Function,
    },
    ...AccessAuditEvents,
    ...OP_NET_ABI,
];

export default AccessAuditAbi;
