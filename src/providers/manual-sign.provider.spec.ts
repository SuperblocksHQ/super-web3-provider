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
import { ManualSignProvider } from './manual-sign.provider';
import { ISuperblocksClient, IPusherClient, IRpcClient, IEventResponse, IManualSignProvider, ISuperblocksUtils } from '../ioc/interfaces';
import { ITransactionModel, IDeploymentModel, ITransactionParamsModel, TransactionStatus, IMetadataModel } from '../superblocks/models';
import { JSONRPCRequestPayload, JSONRPCResponsePayload } from 'ethereum-protocol';


// Disable specific tslint warnings
/* tslint:disable:no-unused-expression */
/* tslint:disable:max-classes-per-file */

class TestSuperblocksClient implements ISuperblocksClient {

    addTransactionReceipt(deploymentId: string, token: string, txId: string, txHash: string): Promise<void> {
        (deploymentId);
        (token);
        (txId);
        (txHash);
        return Promise.resolve();
    }
    sendEthTransaction(deploymentId: string, _token: string, transaction: ITransactionParamsModel): Promise<ITransactionModel> {
        return Promise.resolve({
                id: '1234',
                deploymentId,
                from: transaction.from,
                networkId: transaction.networkId,
                status: TransactionStatus.Pending,
                rpcPayload: {
                    params: [],
                    method: transaction.rpcPayload.method,
                    id: transaction.rpcPayload.id,
                    jsonrpc: transaction.rpcPayload.jsonrpc,
                }
        });
    }

    createDeployment(projectId: string, token: string, networkId: string): Promise<IDeploymentModel> {
        return new Promise((resolve, __) => {
            (projectId);
            (token);
            (networkId);
            return resolve({
                id: 'id',
            });
        });
    }
}

class TestPusherClient implements IPusherClient {
    subscribeToChannel(channelName: string, eventNames: [string], token: string, callback: (eventResponse: IEventResponse) => any): void {
        (channelName);
        (eventNames);
        (token);
        callback({
            eventName: 'update_transaction',
            message: channelName
        });
    }

    unsubscribeFromChannel(channelName: string): void {
        (channelName);
    }
}

class TestSuperblocksUtils implements ISuperblocksUtils {
    getApiBaseUrl() {
        return 'http://someBaseUrl.com/';
    }
    networkIdToName(_networkId: string) {
        return 'someName';
    }
    createDefaultMetadata(_metadata: IMetadataModel) {
        return {};
    }
    // tslint:disable-next-line: no-empty
    saveDeploymentInfo(_deploymentId: string, _token: string) { }
}

class TestRpcClient implements IRpcClient {
    sendRpcJsonCall(endpoint: string, payload: JSONRPCRequestPayload): Promise<any> {
        return new Promise(async (resolve, _) => {
            (endpoint);
            (payload);
            return resolve([]);
        });
    }
}

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
        let manualSignProvider: IManualSignProvider;

        beforeEach(() => {
            const client = new TestSuperblocksClient();
            const mockUtils = new TestSuperblocksUtils();
            manualSignProvider = new ManualSignProvider(client, null, null, mockUtils);
        });

        it('initializes manual sign provider successfully', () => {
            return manualSignProvider.init({
                projectId: 'dummyId',
                token: 'dummyToken',
                from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                endpoint: 'http://127.0.0.1',
                networkId: '1',
                metadata: {}
            });
        });

        it('fails to initialize when from option is empty', () => {
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: 'dummyToken',
                    from: '',
                    endpoint: 'http://localhost',
                    networkId: '1',
                    metadata: {}
                });
            });
        });

        it('fails to initialize when from option is invalid', () => {
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: 'dummyToken',
                    from: '0x1234567890',
                    endpoint: 'http://localhost',
                    networkId: '1',
                    metadata: {}
                });
            });
        });

        it('fails to initialize when endpoint option is empty', () => {
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: 'dummyToken',
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: '',
                    networkId: '1',
                    metadata: {}
                });
            });
        });

        it('fails to initialize when endpoint option is missing protocol', () => {
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: 'dummyToken',
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: 'localhost',
                    networkId: '1',
                    metadata: {}
                });
            });
        });

        it('fails to initialize when network id option is empty', () => {
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: 'dummyToken',
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: 'http://localhost',
                    networkId: '',
                    metadata: {}
                });
            });
        });

        it('fails to initialize when network id option is not a number', () => {
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: 'dummyToken',
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: 'http://localhost',
                    networkId: 'one',
                    metadata: {}
                });
            });
        });

        it('fails to initialize when deployment space id option is empty', () => {
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: '',
                    token: 'dummyToken',
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: 'http://localhost',
                    networkId: 'one',
                    metadata: {}
                });
            });
        });

        it('fails to initialize when token option is empty', () => {
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: '',
                    from: '0x3117958590752b0871548Dd8715b4C4c41372d3d',
                    endpoint: 'http://localhost',
                    networkId: 'one',
                    metadata: {}
                });
            });
        });
    });

    describe('getAccounts:', () => {
        let manualSignProvider: IManualSignProvider;

        beforeEach(() => {
            const client = new TestSuperblocksClient();
            const mockUtils = new TestSuperblocksUtils();
            manualSignProvider = new ManualSignProvider(client, null, null, mockUtils);
        });

        it('retrieves accounts successfully', async () => {
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            await manualSignProvider.init({
                projectId: 'dummyId',
                token: 'dummyToken',
                from: fromAddress,
                endpoint: 'http://127.0.0.1',
                networkId: '1',
                metadata: {}
            });

            const accounts = await manualSignProvider.getAccounts();
            assert.deepStrictEqual([ fromAddress ], accounts);
        });

        it('fails to retrieve accounts due to initialized provider', async () => {
            try {
                await manualSignProvider.getAccounts();
            } catch (e) {
                assert.deepStrictEqual('TypeError: Cannot read property \'from\' of undefined', e.toString());
            }
        });
    });

    describe('sendMessage:', () => {
        let manualSignProvider: IManualSignProvider;
        let pusherClient: IPusherClient;

        beforeEach(() => {
            const client = new TestSuperblocksClient();
            pusherClient = new TestPusherClient();
            const rpcClient = new TestRpcClient();
            const mockUtils = new TestSuperblocksUtils();
            manualSignProvider = new ManualSignProvider(client, pusherClient, rpcClient, mockUtils);
        });

        it('successfully retrieve accounts', async () => {
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            assert.doesNotReject(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: 'dummyToken',
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1',
                    metadata: {}
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
            const fromAddress = '0x1234567890';
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: 'dummyToken',
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1',
                    metadata: {}
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
            const fromAddress = '';
            assert.rejects(() => {
                return manualSignProvider.init({
                    projectId: 'dummyId',
                    token: 'dummyToken',
                    from: fromAddress,
                    endpoint: 'http://127.0.0.1',
                    networkId: '1',
                    metadata: {}
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

        // TODO - Disable for now until we figure out how to test it with the Pusher subscription model
        // it('successfully sends message via Rest API', async () => {
        //     const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
        //     await manualSignProvider.init({
        //         projectId: 'dummyId',
        //         token: 'dummyToken',
        //         from: fromAddress,
        //         endpoint: 'http://127.0.0.1',
        //         networkId: '1'
        //     });

        //     await manualSignProvider.sendMessage({
        //         jsonrpc: 'eth_test',
        //         id: 0,
        //         method: 'eth_sendTransaction',
        //         params: [],
        //     }, '0');
        // });

        it('fails to send message via Rest API due to Superblocks Client failure', async () => {
            class MockSuperblocksClient implements ISuperblocksClient {
                addTransactionReceipt(deploymentId: string, token: string, txId: string, txHash: string): Promise<void> {
                    (deploymentId);
                    (token);
                    (txId);
                    (txHash);
                    return Promise.resolve();
                }
                sendEthTransaction(_deploymentId: string, _token: string, _transaction: ITransactionParamsModel): Promise<ITransactionModel> {
                    throw new Error('sendEthTransaction exception');
                }

                createDeployment(projectId: string, token: string, networkId: string): Promise<IDeploymentModel> {
                    return new Promise(async (resolve, __) => {
                        (projectId);
                        (token);
                        (networkId);
                        return resolve({
                            id: 'id',
                        });
                    });
                }
            }

            const superblocksClient = new MockSuperblocksClient();
            const mockUtils = new TestSuperblocksUtils();
            manualSignProvider = new ManualSignProvider(superblocksClient, null, null, mockUtils);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';

            await manualSignProvider.init({
                projectId: 'dummyId',
                token: 'dummyToken',
                from: fromAddress,
                endpoint: 'http://127.0.0.1',
                networkId: '1',
                metadata: {}
            });

            await assert.rejects(manualSignProvider.sendMessage({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_sendTransaction',
                params: [],
            }, '0'));
        });

        // TODO - Disable for now until we figure out how to test it with the Pusher subscription model
        // it('successfully signs message via Rest API', async () => {
        //     const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
        //     await manualSignProvider.init({
        //         projectId: 'dummyId',
        //         token: 'dummyToken',
        //         from: fromAddress,
        //         endpoint: 'http://127.0.0.1',
        //         networkId: '1'
        //     });

        //     await manualSignProvider.sendMessage({
        //         jsonrpc: 'eth_test',
        //         id: 0,
        //         method: 'eth_sign',
        //         params: [],
        //     }, '0');
        // });

        it('successfully sends message via RPC', async () => {
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            await manualSignProvider.init({
                projectId: 'dummyId',
                token: 'dummyToken',
                from: fromAddress,
                endpoint: 'http://127.0.0.1',
                networkId: '1',
                metadata: {}
            });

            await manualSignProvider.sendMessage({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_test',
                params: ['test'],
            }, '0');
        });
    });

    describe('send:', () => {
        let manualSignProvider: IManualSignProvider;

        beforeEach(() => {
            const client = new TestSuperblocksClient();
            const pusherClient = new TestPusherClient();
            const rpcClient = new TestRpcClient();
            const mockUtils = new TestSuperblocksUtils();
            manualSignProvider = new ManualSignProvider(client, pusherClient, rpcClient, mockUtils);
        });

        it('successfully retrieve accounts', async () => {
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';

            await manualSignProvider.init({
                projectId: 'dummyId',
                token: 'dummyToken',
                from: fromAddress,
                endpoint: 'http://127.0.0.1',
                networkId: '1',
                metadata: {}
            });

            await manualSignProvider.send({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_accounts',
                params: [],
            });
        });

        // TODO - Disable for now until we figure out how to test it with the Pusher subscription model
        // it('successfully sends message via Rest API', async () => {
        //     const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';

        //     await manualSignProvider.init({
        //         projectId: 'dummyId',
        //         token: 'dummyToken',
        //         from: fromAddress,
        //         endpoint: 'http://127.0.0.1',
        //         networkId: '1'
        //     });

        //     await manualSignProvider.send({
        //         jsonrpc: 'eth_test',
        //         id: 0,
        //         method: 'eth_sendTransaction',
        //         params: [],
        //     });
        // });

        it('successfully sends message via RPC', async () => {
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            await manualSignProvider.init({
                projectId: 'dummyId',
                token: 'dummyToken',
                from: fromAddress,
                endpoint: 'http://127.0.0.1',
                networkId: '1',
                metadata: {}
            });

            await manualSignProvider.send({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_test',
                params: ['test'],
            });
        });
    });

    describe('sendAsync:', () => {
        let manualSignProvider: IManualSignProvider;

        beforeEach(() => {
            const client = new TestSuperblocksClient();
            const pusherClient = new TestPusherClient();
            const rpcClient = new TestRpcClient();
            const mockUtils = new TestSuperblocksUtils();
            manualSignProvider = new ManualSignProvider(client, pusherClient, rpcClient, mockUtils);
        });

        it('successfully retrieve accounts', async () => {
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            await manualSignProvider.init({
                projectId: 'dummyId',
                token: 'dummyToken',
                from: fromAddress,
                endpoint: 'http://127.0.0.1',
                networkId: '1',
                metadata: {}
            });

            manualSignProvider.sendAsync({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_accounts',
                params: [],
            }, (err: Error | null, result?: JSONRPCResponsePayload) => {
                assert.deepStrictEqual(null, err);
                assert.notDeepStrictEqual(null, result);
            });
        });

        // TODO - Disable for now until we figure out how to test it with the Pusher subscription model
        // it('successfully sends message via Rest API', async () => {
        //     const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
        //     await manualSignProvider.init({
        //         projectId: 'dummyId',
        //         token: 'dummyToken',
        //         from: fromAddress,
        //         endpoint: 'http://127.0.0.1',
        //         networkId: '1'
        //     });

        //     manualSignProvider.sendAsync({
        //         jsonrpc: 'eth_test',
        //         id: 0,
        //         method: 'eth_sendTransaction',
        //         params: [],
        //     }, (err: Error | null, result?: JSONRPCResponsePayload) => {
        //         assert.deepStrictEqual(null, err);
        //         assert.notDeepStrictEqual(null, result);
        //     });
        // });

        it('fails to send message via Rest API due to Superblocks Client failure', async () => {
            class MockSuperblocksClient implements ISuperblocksClient {
                addTransactionReceipt(deploymentId: string, token: string, txId: string, txHash: string): Promise<void> {
                    (deploymentId);
                    (token);
                    (txId);
                    (txHash);
                    return Promise.resolve();
                }
                sendEthTransaction(_deploymentId: string, _token: string, _transaction: ITransactionParamsModel): Promise<ITransactionModel> {
                    throw new Error('sendEthTransaction exception');
                }

                createDeployment(projectId: string, token: string, networkId: string): Promise<IDeploymentModel> {
                    return new Promise(async (resolve, __) => {
                        (projectId);
                        (token);
                        (networkId);
                        return resolve({
                            id: 'id',
                        });
                    });
                }
            }

            const superblocksClient = new MockSuperblocksClient();
            const mockUtils = new TestSuperblocksUtils();
            manualSignProvider = new ManualSignProvider(superblocksClient, null, null, mockUtils);
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';

            await manualSignProvider.init({
                projectId: 'dummyId',
                token: 'dummyToken',
                from: fromAddress,
                endpoint: 'http://127.0.0.1',
                networkId: '1',
                metadata: {}
            });

            manualSignProvider.sendAsync({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_sendTransaction',
                params: [],
            }, (err: Error | null, result?: JSONRPCResponsePayload) => {
                assert.deepStrictEqual('sendEthTransaction exception', err.toString());
                assert.deepStrictEqual(null, result);
            });
        });

        it('successfully sends message via RPC', async () => {
            const fromAddress = '0x3117958590752b0871548Dd8715b4C4c41372d3d';
            await manualSignProvider.init({
                projectId: 'dummyId',
                token: 'dummyToken',
                from: fromAddress,
                endpoint: 'http://127.0.0.1',
                networkId: '1',
                metadata: {}
            });

            manualSignProvider.sendAsync({
                jsonrpc: 'eth_test',
                id: 0,
                method: 'eth_test',
                params: ['test'],
            }, (err: Error | null, result?: JSONRPCResponsePayload) => {
                assert.deepStrictEqual(null, err);
                assert.notDeepStrictEqual(null, result);
            });
        });
    });

    it('check all the possibilities to init the provider', () => {
        const client = new TestSuperblocksClient();
        const pusherClient = new TestPusherClient();
        const rpcClient = new TestRpcClient();
        const mockUtils = new TestSuperblocksUtils();
        const manualSignProvider = new ManualSignProvider(client, pusherClient, rpcClient, mockUtils);

        assert.rejects(() => manualSignProvider.init({ projectId: '', token: '', from: '', endpoint: '', networkId: '', metadata: {} }));
        assert.rejects(() => manualSignProvider.init({ projectId: 'dummy', token: '', from: '', endpoint: '', networkId: '', metadata: {} }));
        assert.rejects(() => manualSignProvider.init({ projectId: 'dummy', token: 'dummy', from: '', endpoint: '', networkId: '', metadata: {} }));
        assert.rejects(() => manualSignProvider.init({ projectId: 'dummy', token: 'dummy', from: '0x0', endpoint: '', networkId: '', metadata: {} }));
        assert.rejects(() => manualSignProvider.init({ projectId: 'dummy', token: 'dummy', from: '0x3117958590752b0871548Dd8715b4C4c41372d3d', endpoint: '', networkId: '', metadata: {} }));
        assert.rejects(() => manualSignProvider.init({ projectId: 'dummy', token: 'dummy', from: '0x3117958590752b0871548Dd8715b4C4c41372d3d', endpoint: 'something', networkId: '', metadata: {} }));
        assert.rejects(() => manualSignProvider.init({ projectId: 'dummy', token: 'dummy', from: '0x3117958590752b0871548Dd8715b4C4c41372d3d', endpoint: 'something', networkId: '1a', metadata: {} }));
        assert.doesNotReject(() => manualSignProvider.init({ projectId: 'dummy', token: 'dummy', from: '0x3117958590752b0871548Dd8715b4C4c41372d3d', endpoint: 'http://something', networkId: '1', metadata: {} }));
    });
});
