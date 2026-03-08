import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the createVault function call.
 */
export type CreateVault = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the ping function call.
 */
export type Ping = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the unlockByDeadManSwitch function call.
 */
export type UnlockByDeadManSwitch = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getDataHash function call.
 */
export type GetDataHash = CallResult<
    {
        dataHash: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getBeneficiary function call.
 */
export type GetBeneficiary = CallResult<
    {
        beneficiary: Address;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getDeadManInterval function call.
 */
export type GetDeadManInterval = CallResult<
    {
        interval: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getLastPing function call.
 */
export type GetLastPing = CallResult<
    {
        lastPing: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getIsActive function call.
 */
export type GetIsActive = CallResult<
    {
        isActive: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getVaultCount function call.
 */
export type GetVaultCount = CallResult<
    {
        count: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IDeadManVault
// ------------------------------------------------------------------
export interface IDeadManVault extends IOP_NETContract {
    createVault(dataHash: bigint, beneficiary: Address, deadManInterval: bigint): Promise<CreateVault>;
    ping(): Promise<Ping>;
    unlockByDeadManSwitch(): Promise<UnlockByDeadManSwitch>;
    getDataHash(): Promise<GetDataHash>;
    getBeneficiary(): Promise<GetBeneficiary>;
    getDeadManInterval(): Promise<GetDeadManInterval>;
    getLastPing(): Promise<GetLastPing>;
    getIsActive(): Promise<GetIsActive>;
    getVaultCount(): Promise<GetVaultCount>;
}
