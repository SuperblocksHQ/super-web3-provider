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

import { IHDWalletProvider, JSONRpcCallback, IHDWalletProviderOptions } from '../ioc/interfaces';
import { hdWalletProvider } from '..';
import { JSONRPCRequestPayload, JSONRPCErrorCallback } from 'ethereum-protocol';

/**
 * Simple Facade class in order to abstract the internal dependencies of the HDWalletProvider has
 * so we can inject them using DI.
 */
export class SuperHDWalletProviderFacade implements IHDWalletProvider {
    constructor(options: IHDWalletProviderOptions) {
        hdWalletProvider.init(options)
            .catch((error) => {
                console.log(error);
                process.exit(1);
        });
    }

    send(payload: JSONRPCRequestPayload): Promise<any> {
        return hdWalletProvider.send(payload);
    }
    sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback | JSONRpcCallback): void {
        return hdWalletProvider.sendAsync(payload, callback);
    }
}
