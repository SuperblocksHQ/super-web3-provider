import 'reflect-metadata';
import { container } from './ioc/ioc.config';
import { TYPES } from './ioc/types';
import { IManualSignProvider, IHDWalletProvider } from './ioc/interfaces';
import { ManualSignProviderFacade as ManualSignProvider, SuperHDWalletProviderFacade as SuperHDWalletProvider } from './providers';

// Composition root
export const manualSignProvider = container.get<IManualSignProvider>(TYPES.ManualSigningProvider);
export const hdWalletProvider = container.get<IHDWalletProvider>(TYPES.HDWalletProvider);

export {
    ManualSignProvider,
    SuperHDWalletProvider
};
