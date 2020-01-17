import 'reflect-metadata';
import { container } from './ioc/ioc.config';
import { TYPES } from './ioc/types';
import { IManualSignProvider } from './ioc/interfaces';
import { ManualSignProviderFacade as ManualSignProvider, SuperHDWalletProvider } from './providers';

// Composition root
export const manualSignProvider = container.get<IManualSignProvider>(TYPES.ManualSigningProvider);

export {
    ManualSignProvider,
    SuperHDWalletProvider
};
