import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the logEvent function call.
 */
export type LogEvent = CallResult<{}, OPNetEvent<never>[]>;

/**
 * @description Represents the result of the getAuditStats function call.
 */
export type GetAuditStats = CallResult<{}, OPNetEvent<never>[]>;

/**
 * @description Represents the result of the setAuthorizedLogger function call.
 */
export type SetAuthorizedLogger = CallResult<{}, OPNetEvent<never>[]>;

/**
 * @description Represents the result of the getTotalEvents function call.
 */
export type GetTotalEvents = CallResult<{}, OPNetEvent<never>[]>;

// ------------------------------------------------------------------
// IAccessAudit
// ------------------------------------------------------------------
export interface IAccessAudit extends IOP_NETContract {
    logEvent(): Promise<LogEvent>;
    getAuditStats(): Promise<GetAuditStats>;
    setAuthorizedLogger(): Promise<SetAuthorizedLogger>;
    getTotalEvents(): Promise<GetTotalEvents>;
}
