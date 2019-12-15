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

import { IManualSignProvider, JSONRpcCallback } from '../ioc/interfaces';
import { manualSignProvider } from '..';
import { JSONRPCRequestPayload, JSONRPCErrorCallback } from 'ethereum-protocol';

interface IProviderOptions {
    from: string;
    endpoint: string;
    networkId: string;
}

/**
 * Simple Facade class in order to abstract the internal dependencies the ManualSignProvider has
 * so we can inject them using DI.
 */
export class ManualSignProviderFacade implements IManualSignProvider {
    constructor(options: IProviderOptions) {
        manualSignProvider.init(options);
    }

    getAccounts(): Promise<string[]> {
        return manualSignProvider.getAccounts();
    }

    sendMessage(payload: JSONRPCRequestPayload, networkId: string): Promise<any> {
        return manualSignProvider.sendMessage(payload, networkId);
    }
    send(payload: JSONRPCRequestPayload): Promise<any> {
        return manualSignProvider.send(payload);
    }
    sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback | JSONRpcCallback): void {
        return manualSignProvider.sendAsync(payload, callback);
    }
}
