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
import * as sinon from 'ts-sinon';
import { SinonSandbox } from 'sinon';
import { ManualSignProvider } from './super.provider';
import { ISuperblocksClient, IPusherClient, IRpcClient, IEventResponse } from '../ioc/interfaces';
import { ITransactionModel } from '../superblocks/models';
import { JSONRPCRequestPayload, JSONRPCResponsePayload } from 'ethereum-protocol';


// Disable specific tslint warnings
/* tslint:disable:no-unused-expression */
/* tslint:disable:max-classes-per-file */

describe('ManualSignProvider:', () => {

    let sandbox: SinonSandbox;

    beforeEach(() => {
        // Remove console logs to make the test results cleaner
        sandbox = sinon.default.createSandbox();
        sandbox.stub(console, 'log');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('isValidEndpoint:', () => {
        it('checks http is a valid endpoint protocol', () => {
            const endpoint = 'http://localhost';
            const isValidEndpoint = ManualSignProvider.isValidEndpoint(endpoint);
            assert.deepStrictEqual(isValidEndpoint, true);
        });

        it('checks https is a valid endpoint protocol', () => {
            const endpoint = 'https://localhost';
            const isValidEndpoint = ManualSignProvider.isValidEndpoint(endpoint);
            assert.deepStrictEqual(isValidEndpoint, true);
        });

        it('checks ws is a valid endpoint protocol', () => {
            const endpoint = 'ws://localhost';
            const isValidEndpoint = ManualSignProvider.isValidEndpoint(endpoint);
            assert.deepStrictEqual(isValidEndpoint, true);
        });

        it('checks wss is a valid endpoint protocol', () => {
            const endpoint = 'wss://localhost';
            const isValidEndpoint = ManualSignProvider.isValidEndpoint(endpoint);
            assert.deepStrictEqual(isValidEndpoint, true);
        });

        it('checks that out of place protocol is not valid', () => {
            const endpoint = 'localhosthttp:';
            const isValidEndpoint = ManualSignProvider.isValidEndpoint(endpoint);
            assert.deepStrictEqual(isValidEndpoint, false);
        });

        it('checks that out of place protocol with slashes are invalid', () => {
            const endpoint = 'localhosthttp://';
            const isValidEndpoint = ManualSignProvider.isValidEndpoint(endpoint);
            assert.deepStrictEqual(isValidEndpoint, false);
        });

        it('checks slashes alone do not form a valid endpoint', () => {
            const endpoint = '//localhost';
            const isValidEndpoint = ManualSignProvider.isValidEndpoint(endpoint);
            assert.deepStrictEqual(isValidEndpoint, false);
        });
    });

    describe('init:', () => {
        it('initializes manual sign provider successfully', () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });
        });

        it('fails to initialize when from option is empty', () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            assert.throws(() => {
                manualSignProvider.init({
                    from: '',
                    endpoint: 'http://localhost',
                    networkId: '1'
                });
            });
        });

        it('fails to initialize when from option is invalid', () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            assert.throws(() => {
                manualSignProvider.init({
                    from: '0x1234567890',
                    endpoint: 'http://localhost',
                    networkId: '1'
                });
            });
        });

        it('fails to initialize when endpoint option is empty', () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            assert.throws(() => {
                manualSignProvider.init({
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: '',
                    networkId: '1'
                });
            });
        });

        it('fails to initialize when endpoint option is missing protocol', () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            assert.throws(() => {
                manualSignProvider.init({
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: 'localhost',
                    networkId: '1'
                });
            });
        });

        it('fails to initialize when network id option is empty', () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            assert.throws(() => {
                manualSignProvider.init({
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: 'http://localhost',
                    networkId: ''
                });
            });
        });

        it('fails to initialize when network id option is not a number', () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            assert.throws(() => {
                manualSignProvider.init({
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: 'http://localhost',
                    networkId: 'one'
                });
            });
        });
    });

    describe('getAccounts:', () => {
        it('retrieves accounts successfully', async () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            const accounts = await manualSignProvider.getAccounts();
            assert.deepStrictEqual([ fromAddress ], accounts);
        });

        it('fails to retrieve accounts due to initialized provider', async () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            try {
                const accounts = await manualSignProvider.getAccounts();
            } catch (e) {
                assert.deepStrictEqual('TypeError: Cannot read property \'from\' of undefined', e.toString());
            }
        });
    });

    describe('sendMessage:', () => {
        it('successfully retrieve accounts', async () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.doesNotReject( async () => {
                const promise = manualSignProvider.sendMessage({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_accounts',
                    params: [],
                }, '0');
                return promise;
            });
        });

        it('fails to retrieve accounts due to bad from address during initialization', async () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            const fromAddress = '0x1234567890';
            assert.throws(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.rejects( async () => {
                const promise = manualSignProvider.sendMessage({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_accounts',
                    params: [],
                }, '0');
                return promise;
            });
        });

        it('fails to retrieve accounts due to empty address during initialization', async () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            const fromAddress = '';
            assert.throws(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.rejects( async () => {
                const promise = manualSignProvider.sendMessage({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_accounts',
                    params: [],
                }, '0');
                return promise;
            });
        });

        it('successfully sends message via Rest API', async () => {
            class TestSuperblocksClient implements ISuperblocksClient {
                sendEthTransaction(transaction: ITransactionModel): Promise<ITransactionModel> {
                    return new Promise(async (resolve, _) => {
                        return resolve({
                            projectId: transaction.projectId,
                            buildConfigId: transaction.buildConfigId,
                            from: transaction.from,
                            networkId: transaction.networkId,
                            rpcPayload: {
                                params: [],
                                method: transaction.rpcPayload.method,
                                id: transaction.rpcPayload.id,
                                jsonrpc: transaction.rpcPayload.jsonrpc,
                            }
                        });
                    });
                }

                createRelease(workspaceId: string, userToken: string, networkId: string): Promise<ITransactionModel> {
                    return new Promise(async (_, __) => {
                        (workspaceId);
                        (userToken);
                        return {
                            projectId: 'id',
                            buildConfigId: 'id',
                            from: '0x0',
                            networkId,
                            rpcPayload: {
                                params: [],
                                method: 'eth_zilch',
                                id: '0',
                                jsonrpc: '0',
                            }
                        };

                    });
                }
            }

            class TestPusherClient implements IPusherClient {
                subscribeToChannel(channelName: string, eventNames: [string], callback: (eventResponse: IEventResponse) => any): void {
                    (channelName);
                    (eventNames);
                    callback({
                        eventName: 'update_transaction',
                        message: channelName
                    });
                }

                unsubscribeFromChannel(channelName: string): void {
                    (channelName);
                }
            }

            const superblocksClient = new TestSuperblocksClient();
            const pusherClient = new TestPusherClient();
            const manualSignProvider = new ManualSignProvider(superblocksClient, pusherClient, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.doesNotReject( async () => {
                const promise = manualSignProvider.sendMessage({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_sendTransaction',
                    params: [],
                }, '0');
                return promise;
            });
        });

        it('fails to send message via Rest API due to Superblocks Client failure', async () => {
            class TestSuperblocksClient implements ISuperblocksClient {
                sendEthTransaction(transaction: ITransactionModel): Promise<ITransactionModel> {
                    throw new Error('sendEthTransaction exception');
                    return new Promise(async (resolve, _) => {
                        return resolve({
                            projectId: transaction.projectId,
                            buildConfigId: transaction.buildConfigId,
                            from: transaction.from,
                            networkId: transaction.networkId,
                            rpcPayload: {
                                params: [],
                                method: transaction.rpcPayload.method,
                                id: transaction.rpcPayload.id,
                                jsonrpc: transaction.rpcPayload.jsonrpc,
                            }
                        });
                    });
                }

                createRelease(workspaceId: string, userToken: string, networkId: string): Promise<ITransactionModel> {
                    return new Promise(async (_, __) => {
                        (workspaceId);
                        (userToken);
                        return {
                            projectId: 'id',
                            buildConfigId: 'id',
                            from: '0x0',
                            networkId,
                            rpcPayload: {
                                params: [],
                                method: 'eth_zilch',
                                id: '0',
                                jsonrpc: '0',
                            }
                        };

                    });
                }
            }

            const superblocksClient = new TestSuperblocksClient();
            const manualSignProvider = new ManualSignProvider(superblocksClient, null, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.rejects( async () => {
                const promise = manualSignProvider.sendMessage({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_sendTransaction',
                    params: [],
                }, '0');
                return promise;
            });
        });

        it('successfully signs message via Rest API', async () => {
            class TestSuperblocksClient implements ISuperblocksClient {
                sendEthTransaction(transaction: ITransactionModel): Promise<ITransactionModel> {
                    return new Promise(async (resolve, _) => {
                        return resolve({
                            projectId: transaction.projectId,
                            buildConfigId: transaction.buildConfigId,
                            from: transaction.from,
                            networkId: transaction.networkId,
                            rpcPayload: {
                                params: [],
                                method: transaction.rpcPayload.method,
                                id: transaction.rpcPayload.id,
                                jsonrpc: transaction.rpcPayload.jsonrpc,
                            }
                        });
                    });
                }

                createRelease(workspaceId: string, userToken: string, networkId: string): Promise<ITransactionModel> {
                    return new Promise(async (_, __) => {
                        (workspaceId);
                        (userToken);
                        return {
                            projectId: 'id',
                            buildConfigId: 'id',
                            from: '0x0',
                            networkId,
                            rpcPayload: {
                                params: [],
                                method: 'eth_zilch',
                                id: '0',
                                jsonrpc: '0',
                            }
                        };

                    });
                }
            }

            class TestPusherClient implements IPusherClient {
                subscribeToChannel(channelName: string, eventNames: [string], callback: (eventResponse: IEventResponse) => any): void {
                    (channelName);
                    (eventNames);
                    callback({
                        eventName: 'update_transaction',
                        message: channelName
                    });
                }

                unsubscribeFromChannel(channelName: string): void {
                    (channelName);
                }
            }

            const superblocksClient = new TestSuperblocksClient();
            const pusherClient = new TestPusherClient();
            const manualSignProvider = new ManualSignProvider(superblocksClient, pusherClient, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.doesNotReject( async () => {
                const promise = manualSignProvider.sendMessage({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_sign',
                    params: [],
                }, '0');
                return promise;
            });
        });

        it('successfully sends message via RPC', async () => {
            class TestRpcClient implements IRpcClient {
                sendRpcJsonCall(endpoint: string, payload: JSONRPCRequestPayload): Promise<any> {
                    return new Promise(async (resolve, _) => {
                        (endpoint);
                        (payload);
                        return resolve([]);
                    });
                }
            }

            const rpcClient = new TestRpcClient();
            const manualSignProvider = new ManualSignProvider(null, null, rpcClient);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.doesNotReject( async () => {
                const promise = manualSignProvider.sendMessage({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_test',
                    params: ['test'],
                }, '0');
                return promise;
            });
        });
    });

    describe('send:', () => {
        it('successfully retrieve accounts', async () => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.doesNotReject( async () => {
                const promise = manualSignProvider.send({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_accounts',
                    params: [],
                });
                return promise;
            });
        });

        it('successfully sends message via Rest API', async () => {
            class TestSuperblocksClient implements ISuperblocksClient {
                sendEthTransaction(transaction: ITransactionModel): Promise<ITransactionModel> {
                    return new Promise(async (resolve, _) => {
                        return resolve({
                            projectId: transaction.projectId,
                            buildConfigId: transaction.buildConfigId,
                            from: transaction.from,
                            networkId: transaction.networkId,
                            rpcPayload: {
                                params: [],
                                method: transaction.rpcPayload.method,
                                id: transaction.rpcPayload.id,
                                jsonrpc: transaction.rpcPayload.jsonrpc,
                            }
                        });
                    });
                }

                createRelease(workspaceId: string, userToken: string, networkId: string): Promise<ITransactionModel> {
                    return new Promise(async (_, __) => {
                        (workspaceId);
                        (userToken);
                        return {
                            projectId: 'id',
                            buildConfigId: 'id',
                            from: '0x0',
                            networkId,
                            rpcPayload: {
                                params: [],
                                method: 'eth_zilch',
                                id: '0',
                                jsonrpc: '0',
                            }
                        };

                    });
                }
            }

            class TestPusherClient implements IPusherClient {
                subscribeToChannel(channelName: string, eventNames: [string], callback: (eventResponse: IEventResponse) => any): void {
                    (channelName);
                    (eventNames);
                    callback({
                        eventName: 'update_transaction',
                        message: channelName
                    });
                }

                unsubscribeFromChannel(channelName: string): void {
                    (channelName);
                }
            }

            const superblocksClient = new TestSuperblocksClient();
            const pusherClient = new TestPusherClient();
            const manualSignProvider = new ManualSignProvider(superblocksClient, pusherClient, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.doesNotReject( async () => {
                const promise = manualSignProvider.send({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_sendTransaction',
                    params: [],
                });
                return promise;
            });
        });

        it('successfully sends message via RPC', async () => {
            class TestRpcClient implements IRpcClient {
                sendRpcJsonCall(endpoint: string, payload: JSONRPCRequestPayload): Promise<any> {
                    return new Promise(async (resolve, _) => {
                        (endpoint);
                        (payload);
                        return resolve([]);
                    });
                }
            }

            const rpcClient = new TestRpcClient();
            const manualSignProvider = new ManualSignProvider(null, null, rpcClient);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            await assert.doesNotReject( async () => {
                const promise = manualSignProvider.send({
                    jsonrpc: 'eth_test',
                    id: 0,
                    method: 'eth_test',
                    params: ['test'],
                });
                return promise;
            });
        });
    });

    describe('sendAsync:', () => {
        it('successfully retrieve accounts', (done) => {
            const manualSignProvider = new ManualSignProvider(null, null, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            manualSignProvider.sendAsync({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_accounts',
                params: [],
            }, (err: Error | null, result?: JSONRPCResponsePayload) => {
                assert.deepStrictEqual(null, err);
                assert.notDeepStrictEqual(null, result);
                done();
            });
        });

        it('successfully sends message via Rest API', (done) => {
            class TestSuperblocksClient implements ISuperblocksClient {
                sendEthTransaction(transaction: ITransactionModel): Promise<ITransactionModel> {
                    return new Promise(async (resolve, _) => {
                        return resolve({
                            projectId: transaction.projectId,
                            buildConfigId: transaction.buildConfigId,
                            from: transaction.from,
                            networkId: transaction.networkId,
                            rpcPayload: {
                                params: [],
                                method: transaction.rpcPayload.method,
                                id: transaction.rpcPayload.id,
                                jsonrpc: transaction.rpcPayload.jsonrpc,
                            }
                        });
                    });
                }

                createRelease(workspaceId: string, userToken: string, networkId: string): Promise<ITransactionModel> {
                    return new Promise(async (_, __) => {
                        (workspaceId);
                        (userToken);
                        return {
                            projectId: 'id',
                            buildConfigId: 'id',
                            from: '0x0',
                            networkId,
                            rpcPayload: {
                                params: [],
                                method: 'eth_zilch',
                                id: '0',
                                jsonrpc: '0',
                            }
                        };

                    });
                }
            }

            class TestPusherClient implements IPusherClient {
                subscribeToChannel(channelName: string, eventNames: [string], callback: (eventResponse: IEventResponse) => any): void {
                    (channelName);
                    (eventNames);
                    callback({
                        eventName: 'update_transaction',
                        message: channelName
                    });
                }

                unsubscribeFromChannel(channelName: string): void {
                    (channelName);
                }
            }

            const superblocksClient = new TestSuperblocksClient();
            const pusherClient = new TestPusherClient();
            const manualSignProvider = new ManualSignProvider(superblocksClient, pusherClient, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            manualSignProvider.sendAsync({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_sendTransaction',
                params: [],
            }, (err: Error | null, result?: JSONRPCResponsePayload) => {
                assert.deepStrictEqual(null, err);
                assert.notDeepStrictEqual(null, result);
                done();
            });
        });

        it('fails to send message via Rest API due to Superblocks Client failure', (done) => {
            class TestSuperblocksClient implements ISuperblocksClient {
                sendEthTransaction(transaction: ITransactionModel): Promise<ITransactionModel> {
                    throw new Error('sendEthTransaction exception');
                    return new Promise(async (resolve, _) => {
                        return resolve({
                            projectId: transaction.projectId,
                            buildConfigId: transaction.buildConfigId,
                            from: transaction.from,
                            networkId: transaction.networkId,
                            rpcPayload: {
                                params: [],
                                method: transaction.rpcPayload.method,
                                id: transaction.rpcPayload.id,
                                jsonrpc: transaction.rpcPayload.jsonrpc,
                            }
                        });
                    });
                }

                createRelease(workspaceId: string, userToken: string, networkId: string): Promise<ITransactionModel> {
                    return new Promise(async (_, __) => {
                        (workspaceId);
                        (userToken);
                        return {
                            projectId: 'id',
                            buildConfigId: 'id',
                            from: '0x0',
                            networkId,
                            rpcPayload: {
                                params: [],
                                method: 'eth_zilch',
                                id: '0',
                                jsonrpc: '0',
                            }
                        };

                    });
                }
            }

            const superblocksClient = new TestSuperblocksClient();
            const manualSignProvider = new ManualSignProvider(superblocksClient, null, null);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            manualSignProvider.sendAsync({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_sendTransaction',
                params: [],
            }, (err: Error | null, result?: JSONRPCResponsePayload) => {
                assert.deepStrictEqual('sendEthTransaction exception', err.toString());
                assert.deepStrictEqual(null, result);
                done();
            });
        });

        it('successfully sends message via RPC', (done) => {
            class TestRpcClient implements IRpcClient {
                sendRpcJsonCall(endpoint: string, payload: JSONRPCRequestPayload): Promise<any> {
                    return new Promise(async (resolve, _) => {
                        (endpoint);
                        (payload);
                        return resolve([]);
                    });
                }
            }

            const rpcClient = new TestRpcClient();
            const manualSignProvider = new ManualSignProvider(null, null, rpcClient);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotThrow(() => {
                manualSignProvider.init({
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1'
                });
            });

            manualSignProvider.sendAsync({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_test',
                params: ['test'],
            }, (err: Error | null, result?: JSONRPCResponsePayload) => {
                assert.deepStrictEqual(null, err);
                assert.notDeepStrictEqual(null, result);
                done();
            });
        });
    });

    it('check all the possibilities to init the provider', () => {
        const manualSignProvider = new ManualSignProvider(null, null, null);

        assert.throws(() => { manualSignProvider.init({ from: '', endpoint: '', networkId: '' }); });
        assert.throws(() => { manualSignProvider.init({ from: '0x0', endpoint: '', networkId: '' }); });
        assert.throws(() => { manualSignProvider.init({ from: '0x3117958590752b0871548Dd8715b4C4c41372d3d', endpoint: '', networkId: '' }); });
        assert.throws(() => { manualSignProvider.init({ from: '0x3117958590752b0871548Dd8715b4C4c41372d3d', endpoint: 'something', networkId: '' }); });
        assert.throws(() => { manualSignProvider.init({ from: '0x3117958590752b0871548Dd8715b4C4c41372d3d', endpoint: 'something', networkId: '1a' }); });
        assert.doesNotThrow(() => { manualSignProvider.init({ from: '0x3117958590752b0871548Dd8715b4C4c41372d3d', endpoint: 'http://something', networkId: '1' }); });
    });
});
