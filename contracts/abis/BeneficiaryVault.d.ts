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
 * @description Represents the result of the unlockByBeneficiary function call.
 */
export type UnlockByBeneficiary = CallResult<
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
// IBeneficiaryVault
// ------------------------------------------------------------------
export interface IBeneficiaryVault extends IOP_NETContract {
    createVault(dataHash: bigint, beneficiary: Address): Promise<CreateVault>;
    unlockByBeneficiary(): Promise<UnlockByBeneficiary>;
    getDataHash(): Promise<GetDataHash>;
    getBeneficiary(): Promise<GetBeneficiary>;
    getIsActive(): Promise<GetIsActive>;
    getVaultCount(): Promise<GetVaultCount>;
}
