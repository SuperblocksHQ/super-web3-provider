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
import fetchMock, { MockResponse } from 'fetch-mock';
import { ISuperblocksClient, ISuperblocksUtils } from '../ioc/interfaces';
import { ITransactionModel } from './models';
import { SinonSandbox } from 'sinon';
import { SuperblocksClient } from './superblocks.client';

describe('SuperblocksClient: Test sendEthTransaction', () => {

    let superblocksClient: ISuperblocksClient;
    let sandbox: SinonSandbox;
    let mockUtils: ISuperblocksUtils;

    const tx = <ITransactionModel> {
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
    };

    beforeEach(() => {
        // Remove console logs to make the test results cleaner
        sandbox = sinon.default.createSandbox();
        sandbox.stub(console, 'log');

        mockUtils = sinon.stubInterface<ISuperblocksUtils>({ getApiBaseUrl: 'https://some-url'});
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('sends Ethereum Transaction', () => {
        const mockFetch = fetchMock.sandbox().post('https://some-url/transactions', <MockResponse>{ status: 201, body: tx });
        superblocksClient = new SuperblocksClient(mockFetch, mockUtils);

        let txResponse: ITransactionModel;
        assert.doesNotThrow(async () => {
            txResponse = await superblocksClient.sendEthTransaction(tx);
            assert.deepStrictEqual(txResponse, tx);
        });
    });

    it('fails to send request to inaccessible API address', async () => {
        const mockFetch = fetchMock.sandbox().post('https://some-url/transactions', <MockResponse>{ status: 400, body: { message: 'This is an error' }});
        superblocksClient = new SuperblocksClient(mockFetch, mockUtils);

        try {
            await superblocksClient.sendEthTransaction(tx);
        } catch (e) {
            assert.equal(e.message, '[Superblocks client] cannot create send transaction to the web3 hub');
        }
    });
});
