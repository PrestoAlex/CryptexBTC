import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the registerVaultDeployment function call.
 */
export type RegisterVaultDeployment = CallResult<{}, OPNetEvent<never>[]>;

/**
 * @description Represents the result of the getFactoryStats function call.
 */
export type GetFactoryStats = CallResult<{}, OPNetEvent<never>[]>;

/**
 * @description Represents the result of the updateFee function call.
 */
export type UpdateFee = CallResult<{}, OPNetEvent<never>[]>;

/**
 * @description Represents the result of the getTotalVaults function call.
 */
export type GetTotalVaults = CallResult<{}, OPNetEvent<never>[]>;

/**
 * @description Represents the result of the getRegistryVersion function call.
 */
export type GetRegistryVersion = CallResult<{}, OPNetEvent<never>[]>;

/**
 * @description Represents the result of the transferOwnership function call.
 */
export type TransferOwnership = CallResult<{}, OPNetEvent<never>[]>;

// ------------------------------------------------------------------
// IVaultFactory
// ------------------------------------------------------------------
export interface IVaultFactory extends IOP_NETContract {
    registerVaultDeployment(): Promise<RegisterVaultDeployment>;
    getFactoryStats(): Promise<GetFactoryStats>;
    updateFee(): Promise<UpdateFee>;
    getTotalVaults(): Promise<GetTotalVaults>;
    getRegistryVersion(): Promise<GetRegistryVersion>;
    transferOwnership(): Promise<TransferOwnership>;
}
