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
 * @description Represents the result of the unlockAfterTime function call.
 */
export type UnlockAfterTime = CallResult<
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
 * @description Represents the result of the getUnlockBlock function call.
 */
export type GetUnlockBlock = CallResult<
    {
        unlockBlock: bigint;
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
// ITimeVault
// ------------------------------------------------------------------
export interface ITimeVault extends IOP_NETContract {
    createVault(dataHash: bigint, unlockBlock: bigint): Promise<CreateVault>;
    unlockAfterTime(): Promise<UnlockAfterTime>;
    getDataHash(): Promise<GetDataHash>;
    getUnlockBlock(): Promise<GetUnlockBlock>;
    getIsActive(): Promise<GetIsActive>;
    getVaultCount(): Promise<GetVaultCount>;
}
