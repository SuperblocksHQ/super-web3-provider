// Copyright 2019 Superblocks AB
//
// This file is part of Superblocks.
//
// Superblocks is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation version 3 of the License.
//
// Superblocks is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Superblocks.  If not, see <http://www.gnu.org/licenses/>.

import 'reflect-metadata';
import * as sinon from 'ts-sinon';
import * as assert from 'assert';
import { SuperblocksClient } from './superblocks.client';
import { ISuperblocksClient, Fetch, ISuperblocksUtils } from '../ioc/interfaces';
import { Container, ContainerModule } from 'inversify';
import { TYPES } from '../ioc/types';

let superblocksClient: ISuperblocksClient;

describe('sendEthTransaction', () => {

    beforeEach(() => {
        const mockFetch = sinon.stubInterface<Fetch>(() => Promise.reject('request to http://localhost:2999/v1/transactions failed, reason: connect ECONNREFUSED 127.0.0.1:2999'));
        const mockUtils = sinon.stubInterface<ISuperblocksUtils>({ getApiBaseUrl: 'https://some-url'});

        const container = new Container();
        const thirdPartyDependencies = new ContainerModule((bind) => {
            bind<Fetch>(TYPES.Fetch).toConstantValue(mockFetch);
        });

        const applicationDependencies = new ContainerModule((bind) => {
            bind<ISuperblocksClient>(TYPES.SuperblocksClient).to(SuperblocksClient).inSingletonScope();
            bind<ISuperblocksUtils>(TYPES.SuperblocksUtils).toConstantValue(mockUtils);
        });

        container.load(thirdPartyDependencies, applicationDependencies);
        superblocksClient = container.get<ISuperblocksClient>(TYPES.SuperblocksClient);
    });

    it.skip('sends Ethereum Transaction', () => {
        // TODO
    });

    it('fails to send request to inaccessible API address', async () => {
        // Set debug mode so that the API endpoint is set to localhost
        process.env.DEBUG = '*';
        await assert.rejects( async () => {
            try {
                await superblocksClient.sendEthTransaction({
                    buildConfigId: '1',
                    ciJobId: '2',
                    projectId: '3',
                    networkId: '4',
                    from: '0x5678900000000000000000000000000000004321',
                    rpcPayload: {
                        jsonrpc: 'data',
                        id: 0,
                        method: 'eth_sendTransaction',
                        params: ['parameters']
                    },
                });
            } catch (e) {
                throw e;
            }
        }, {
            name: 'FetchError',
            message: 'request to http://localhost:2999/v1/transactions failed, reason: connect ECONNREFUSED 127.0.0.1:2999'
        });

        // Removes previously set environment variable
        delete process.env.DEBUG;
    });

    it('fails to send request to remote service due to invalid parameters', async () => {
        await assert.rejects( async () => {
            try {
                await superblocksClient.sendEthTransaction({
                    buildConfigId: '1',
                    ciJobId: '2',
                    projectId: '3',
                    networkId: '4',
                    from: '0x5678900000000000000000000000000000004321',
                    rpcPayload: {
                        jsonrpc: 'data',
                        id: 0,
                        method: 'eth_sendTransaction',
                        params: ['parameters']
                    },
                });
            } catch (e) {
                throw e;
            }
        }, {
            name: 'Error',
            message: '[Superblocks client] cannot create send transaction to the web3 hub'
        });
    });
});
