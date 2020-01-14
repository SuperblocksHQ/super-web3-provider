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

import { injectable, inject } from 'inversify';
import web3Utils from 'web3-utils';
import ora from 'ora';
import Url from 'url';
import { JSONRPCRequestPayload, JSONRPCErrorCallback } from 'ethereum-protocol';
import { ITransactionModel } from '../superblocks/models';
import { TYPES } from '../ioc/types';
import { ISuperblocksClient, IManualSignProvider, IPusherClient, IRpcClient, JSONRpcCallback, IManualSignProviderOptions, ISuperblocksUtils } from '../ioc/interfaces';

@injectable()
export class ManualSignProvider implements IManualSignProvider {

    // Pre-defined variable setup by the Superblocks CI when executing the job including the deployment process
    private readonly CI_JOB_ID: string = process.env.CI_JOB_ID;
    private superblocksClient: ISuperblocksClient;
    private pusherClient: IPusherClient;
    private rpcClient: IRpcClient;
    private superblocksUtils: ISuperblocksUtils;
    private options: IManualSignProviderOptions;
    private deploymentId: string;
    private pendingToSignTxs: Map<string, ITransactionModel>;

    constructor(
        @inject(TYPES.SuperblocksClient) superblocksClient: ISuperblocksClient,
        @inject(TYPES.PusherClient) pusherClient: IPusherClient,
        @inject(TYPES.RpcClient) rpcClient: IRpcClient,
        @inject(TYPES.SuperblocksUtils) superblocksUtils: ISuperblocksUtils,
    ) {
        this.superblocksClient = superblocksClient;
        this.pusherClient = pusherClient;
        this.rpcClient = rpcClient;
        this.superblocksUtils = superblocksUtils;
    }

    public static isValidEndpoint(endpoint: string): boolean {
        const validProtocols = ['http:', 'https:', 'ws:', 'wss:'];

        if (typeof endpoint === 'string') {
            const url = Url.parse(endpoint.toLowerCase());
            return !!(validProtocols.includes(url.protocol || '') && url.slashes);
        }

        return false;
    }

    public async init(options: IManualSignProviderOptions)  {
        if (!options.from || options.from === '' || !web3Utils.checkAddressChecksum(options.from)) {
            throw new Error('The property from: is required to be set and needs to be a valid address');
        } else if (!options.endpoint || options.endpoint === '' || !ManualSignProvider.isValidEndpoint(options.endpoint)) {
            throw new Error(
                [
                  `Malformed provider URL: '${options.endpoint}'`,
                  'Please specify a correct URL, using the http, https, ws, or wss protocol.',
                  ''
                ].join('\n')
              );
        } else if (!options.networkId || !Number(options.networkId)) {
            throw new Error('The property network: is required to be set and needs to be a valid number');
        } else if (!options.token || options.token === '') {
            throw new Error('The property token: is required to be set');
        } else if (!options.deploymentSpaceId || options.deploymentSpaceId === '') {
            throw new Error('The property deploymentSpaceId: is required to be set');
        }

        this.options = options;
        this.pendingToSignTxs = new Map();

        // Let make sure we crete a new deployment on every init in order to group txs together
        const deployment = await this.superblocksClient.createDeployment(options.deploymentSpaceId, options.token, this.superblocksUtils.networkIdToName(options.networkId), this.CI_JOB_ID);
        this.deploymentId = deployment.id;
    }

    public getAccounts(): Promise<string[]> {
        return Promise.resolve([this.options.from]);
    }

    public async sendMessage(payload: JSONRPCRequestPayload, networkId: string): Promise<any> {
        // console.log('SENDING MESSAGE\n\n');
        // console.log(payload.method);

        if (payload.method === 'eth_accounts') {
            return this.getAccounts();
        } else if (payload.method === 'eth_sendTransaction' || payload.method === 'eth_sign') {
            return this.sendRestApiCall(payload, networkId);
         } else {
            // Methods which are not to be intercepted or do not need any account information could be
            // offloaded to Infura, Etherscan, custom Ethereum node or some other public node
            return this.rpcClient.sendRpcJsonCall(this.options.endpoint, payload);
        }
    }

    public send(payload: JSONRPCRequestPayload): Promise<any> {
        return this.sendMessage(payload, this.options.networkId);
    }

    public sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback | JSONRpcCallback): void {
        this.sendMessage(payload, this.options.networkId)
            .then((result) => {
                callback(null, {
                    id: payload.id,
                    jsonrpc: payload.jsonrpc,
                    result
                });
            })
            .catch((error) => {
                callback(error, null);
            });
    }

    private async sendRestApiCall(payload: JSONRPCRequestPayload, networkId: string): Promise<any> {
        const spinner = this.loadingLog('[Superblocks - Manual Sign Provider] Sending tx to Superblocks').start();
        return new Promise(async (resolve, rejects) => {
            let transaction: ITransactionModel;
            try {
                transaction = await this.superblocksClient.sendEthTransaction(this.deploymentId, this.options.token, {
                    networkId,
                    endpoint: this.options.endpoint,
                    from: this.options.from,
                    rpcPayload: payload
                });
            } catch (error) {
                spinner.fail('[Superblocks - Manual Sign Provider] Failed to send the tx to Superblocks.');
                console.log('\x1b[31m%s\x1b[0m', 'Error: ', error.message);

                rejects(error.message);
                return;
            }

            this.pendingToSignTxs.set(transaction.id, transaction);
            spinner.start('[Superblocks - Manual Sign Provider] Waiting tx to be signed in the dashboard\n');

            // We can only subscribe to the transaction on this precise moment, as otherwise we won't have the proper JobId mapped
            this.pusherClient.subscribeToChannel(`private-deployment-${transaction.deploymentId}`, ['transaction-updated'], this.options.token, (event) => {
                if (event.eventName === 'transaction-updated') {
                    const txUpdated: ITransactionModel = event.message;

                    if (txUpdated.transactionHash && this.pendingToSignTxs.get(txUpdated.id)) {
                        spinner.succeed(`[Superblocks - Manual Sign Provider] Transaction deployed. TxHash: ${txUpdated.transactionHash}`);

                        this.pendingToSignTxs.delete(txUpdated.id);

                        console.log('Resolving Promise: ' + txUpdated.transactionHash);
                        resolve(txUpdated.transactionHash);
                    }
                }
            });
        });
    }

    private loadingLog(text: string): ora.Ora {
        console.log('\n');
        return ora({
            text,
            color: 'cyan',
        });
    }
}
