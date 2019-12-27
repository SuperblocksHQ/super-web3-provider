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
import * as assert from 'assert';
import fetchMock, { MockResponse } from 'fetch-mock';
import * as sinon from 'ts-sinon';
import { SinonSandbox } from 'sinon';
import { IRpcClient } from '../ioc/interfaces';
import { RpcClient } from './rpc.client';

describe('RpcClient:', () => {

    let sandbox: SinonSandbox;

    beforeEach(() => {
        // Remove console logs to make the test results cleaner
        sandbox = sinon.default.createSandbox();
        sandbox.stub(console, 'log');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('sendRpcJsonCall:', () => {
        let rpcClient: IRpcClient;

        it('sends JSON-RPC request', () => {
            const endpoint = 'https://some-url/transactions';
            const mockFetch = fetchMock.sandbox().post(endpoint, <MockResponse>{ status: 201, body: { result: 1 } });

            rpcClient = new RpcClient(mockFetch);

            assert.doesNotThrow(async () => {
                const response = await rpcClient.sendRpcJsonCall(endpoint, {
                    params: [],
                    method: 'eth_unknown',
                    id: 0,
                    jsonrpc: '2.0'
                });
                console.log(response);
                assert.deepStrictEqual(1, response);
            });
        });

        it('fails to send JSON-RPC request due to failure error', async () => {
            const endpoint = 'https://some-url/transactions';
            const mockFetch = fetchMock.sandbox().post(endpoint, <MockResponse>{
                throws: new Error('Error during fetch'),
                status: 400,
                body: {
                    message: 'This is an error'
                }
            });

            rpcClient = new RpcClient(mockFetch);

            assert.rejects(async () => {
                const response = await rpcClient.sendRpcJsonCall(endpoint, {
                    params: [],
                    method: 'eth_unknown',
                    id: 0,
                    jsonrpc: '2.0'
                });
            }, {
                name: 'Error',
                message: 'Error during fetch'
            });
        });
    });
});
