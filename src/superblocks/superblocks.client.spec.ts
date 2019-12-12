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
import { ISuperblocksClient, Fetch, ISuperblocksUtils } from '../ioc/interfaces';
import { TYPES } from '../ioc/types';
import { container } from '../ioc/ioc.config';
import { ITransactionModel } from './models';
import { SinonSandbox } from 'sinon';

describe('SuperblocksClient: Test sendEthTransaction', () => {

    let superblocksClient: ISuperblocksClient;
    let sandbox: SinonSandbox;

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

        container.snapshot();
        const mockUtils = sinon.stubInterface<ISuperblocksUtils>({ getApiBaseUrl: 'https://some-url'});
        container.rebind<ISuperblocksUtils>(TYPES.SuperblocksUtils).toConstantValue(mockUtils);
    });

    afterEach(() => {
        container.restore();
        sandbox.restore();
    });

    it.skip('sends Ethereum Transaction', () => {
        const mockFetch = fetchMock.sandbox().post('https://some-url/transactions', <MockResponse>{ status: 202, body: tx });
        container.rebind<Fetch>(TYPES.Fetch).toConstantValue(mockFetch);
        superblocksClient = container.get<ISuperblocksClient>(TYPES.SuperblocksClient);

        let txResponse: ITransactionModel;
        assert.doesNotThrow(async () => {
            txResponse = await superblocksClient.sendEthTransaction(tx);
        });
        assert.deepStrictEqual(txResponse, tx);
    });

    it('fails to send request to inaccessible API address', async () => {
        const mockFetch = fetchMock.sandbox().post('https://some-url/transactions', <MockResponse>{ status: 201, body: tx });
        container.rebind<Fetch>(TYPES.Fetch).toConstantValue(mockFetch);
        superblocksClient = container.get<ISuperblocksClient>(TYPES.SuperblocksClient);

        try {
            await superblocksClient.sendEthTransaction(tx);
        } catch (e) {
            assert.equal(e.message, '[Superblocks client] cannot create send transaction to the web3 hub');
        }
    });
});
