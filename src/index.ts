import 'reflect-metadata';
import { container } from './ioc/ioc.config';
import { TYPES } from './ioc/types';
import { IManualSignProvider } from './ioc/interfaces';

// Composition root
export const internalManualSignProvider = container.get<IManualSignProvider>(TYPES.InternalManualProvider);

export * from './super.provider.internal';
