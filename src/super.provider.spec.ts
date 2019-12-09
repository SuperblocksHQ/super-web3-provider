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

import SuperblocksProvider from './super.provider';
import * as assert from 'assert';

describe('Superprovider:', function () {
    this.timeout(10000);

    it('successfully instantiates provider object', () => {
        const superblocksProvider = new SuperblocksProvider({
            from: '0x0101010100101010100101010100101010101010',
            endpoint: 'test',
            networkId: '0'
        });
        assert.notStrictEqual(superblocksProvider, undefined);
        assert.notStrictEqual(superblocksProvider, null);
    });

    it.skip('sends message using JSON-RPC', () => {
    });

    it('fails to send message using JSON-RPC due to invalid JSON response', async () => {
        const superblocksProvider = new SuperblocksProvider({
            from: '0x0101010100101010100101010100101010101010',
            endpoint: 'https://superblocks.com/',
            networkId: '0'
        });
        assert.notStrictEqual(superblocksProvider, undefined);
        assert.notStrictEqual(superblocksProvider, null);

        await assert.rejects( async () => {
            const promise = superblocksProvider.sendMessage({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_test',
                params: ['test'],
            }, '0');
            return promise;
        }, {
            'message': 'invalid json response body at https://superblocks.com/ reason: Unexpected token < in JSON at position 0',
            'type': 'invalid-json'
        });
    });

    it.skip('sends message targetting eth_accounts when accounts are empty', () => {
    });

    it.skip('sends message targetting eth_accounts when accounts length is bigger than zero', () => {
    });

    it.skip('sends message targetting eth_sendTransaction', () => {
    });

    it.skip('sends message targetting eth_sendTransaction which resolves the Promise', () => {
    });

    it.skip('sends message targetting eth_sign', () => {
    });

    it.skip('sends message targetting eth_sign which resolves the Promise', () => {
    });

    it.skip('sends synchronous message via provider interface', () => {
    });

    it('fails to send synchronous message via provider interface due to invalid JSON response', async () => {
        const superblocksProvider = new SuperblocksProvider({
            from: '0x0101010100101010100101010100101010101010',
            endpoint: 'https://superblocks.com/',
            networkId: '0'
        });
        assert.notStrictEqual(superblocksProvider, undefined);
        assert.notStrictEqual(superblocksProvider, null);

        await assert.rejects( async () => {
            const promise = superblocksProvider.send({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_test',
                params: ['test'],
            });
            return promise;
        }, {
            'message': 'invalid json response body at https://superblocks.com/ reason: Unexpected token < in JSON at position 0',
            'type': 'invalid-json'
        });
    });

    it.skip('sends asynchronous message via provider interface', () => {
    });

    it('fails to send asynchronous message via provider interface due to invalid JSON response', (done) => {
        const superblocksProvider = new SuperblocksProvider({
            from: '0x0101010100101010100101010100101010101010',
            endpoint: 'https://superblocks.com/',
            networkId: '0'
        });
        assert.notStrictEqual(superblocksProvider, undefined);
        assert.notStrictEqual(superblocksProvider, null);

        superblocksProvider.sendAsync({
            jsonrpc: 'eth_test',
            id: 0,
            method: 'eth_test',
            params: ['test'],
        }, (error: any, result: any) => {
            assert.deepStrictEqual(error.toString(), 'FetchError: invalid json response body at https://superblocks.com/ reason: Unexpected token < in JSON at position 0');
            assert.deepStrictEqual(result, null);
            done();
        });
    });

    it.skip('catches an error after sending asynchronous message via provider interface', () => {
    });

    it.skip('retrieves accounts list', () => {
    });

    it.skip('calls REST API', () => {
    });

    it.skip('calls REST API and resolves the Promise', () => {
    });

    it.skip('fails to call REST API', async () => {
    });

    it.skip('sends message to remote endpoint which resolves the Promise', () => {
    });

    it.skip('sends message to remote endpoint which rejects the Promise', () => {
    });

    it.skip('successfully initializes the provider', () => {
    });

    it.skip('fails to initialize the provider', () => {
    });
});
