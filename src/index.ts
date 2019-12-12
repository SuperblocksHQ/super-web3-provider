import 'reflect-metadata';
import { container } from './ioc/ioc.config';
import { TYPES } from './ioc/types';
import { IManualSignProvider } from './ioc/interfaces';
import { ManualSignProviderFacade as ManualSignProvider } from './providers/super.provider.facade';

// Composition root
export const manualSignProvider = container.get<IManualSignProvider>(TYPES.ManualSigningProvider);

export {
    ManualSignProvider
};
