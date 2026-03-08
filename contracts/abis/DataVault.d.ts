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
 * @description Represents the result of the unlockWithPassword function call.
 */
export type UnlockWithPassword = CallResult<
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
 * @description Represents the result of the getPasswordHash function call.
 */
export type GetPasswordHash = CallResult<
    {
        passwordHash: bigint;
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
// IDataVault
// ------------------------------------------------------------------
export interface IDataVault extends IOP_NETContract {
    createVault(dataHash: bigint, passwordHash: bigint): Promise<CreateVault>;
    unlockWithPassword(passwordHash: bigint): Promise<UnlockWithPassword>;
    getDataHash(): Promise<GetDataHash>;
    getPasswordHash(): Promise<GetPasswordHash>;
    getIsActive(): Promise<GetIsActive>;
    getVaultCount(): Promise<GetVaultCount>;
}
