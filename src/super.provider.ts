// Copyright 2019 Superblocks AB
//
// This file is part of Superblocks Lab.
//
// Superblocks Lab is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation version 3 of the License.
//
// Superblocks Lab is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Superblocks. If not, see <http://www.gnu.org/licenses/>.

import { IManualSignProvider } from './ioc/interfaces';
import { IRpcPayload } from './superblocks/models';
import { internalManualSignProvider } from '.';

interface IProviderOptions {
    from: string;
    endpoint: string;
    networkId: string;
}

/**
 * Simple Facade class in order to abstract the internal dependencies the ManualSignProvider has
 * so we can inject them using DI.
 */
export class ManualSignProvider implements IManualSignProvider {
    constructor(options: IProviderOptions) {
        internalManualSignProvider.init(options);
    }

    sendMessage(payload: IRpcPayload, networkId: string): Promise<any> {
        return internalManualSignProvider.sendMessage(payload, networkId);
    }
    send(payload: IRpcPayload): Promise<any> {
        return internalManualSignProvider.send(payload);
    }
    sendAsync(payload: IRpcPayload, callback: (error: any, result: any) => void): void {
        return internalManualSignProvider.sendAsync(payload, callback);
    }
}
