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

import { superblocksClient } from './superblocks.client';
import * as assert from 'assert';

describe('sendEthTransaction', function () {
    this.timeout(10000);

    it.skip('sends Ethereum Transaction', () => {
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
            } catch(e) {
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
            } catch(e) {
                throw e;
            }
        }, {
            name: 'Error',
            message: '[Superblocks client] cannot create send transaction to the web3 hub'
        });
    });
});
