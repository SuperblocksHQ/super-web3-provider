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
import { ITransactionModel, IRpcPayload } from './superblocks/models';
import { TYPES } from './ioc/types';
import { ISuperblocksClient, Fetch, IManualSignProvider, IPusherClient } from './ioc/interfaces';

interface IProviderOptions {
    from: string;
    endpoint: string;
    networkId: string;
}

@injectable()
export class InternalManualSignProvider implements IManualSignProvider {

    // Pre-defined variable setup by the Superblocks CI when executing the job including the deployment process
    private readonly PROJECT_ID: string = process.env.SUPER_PROJECT_ID;
    private readonly BUILD_CONFIG_ID: string = process.env.SUPER_BUILD_CONFIG_ID;
    private readonly CI_JOB_ID: string = process.env.CI_JOB_ID;
    private fetch: Fetch;
    private superClient: ISuperblocksClient;
    private pusherClient: IPusherClient;
    private options: IProviderOptions;
    private pendingTxs: Map<string, ITransactionModel>;

    constructor(
        @inject(TYPES.Fetch) fetch: Fetch,
        @inject(TYPES.SuperblocksClient) client: ISuperblocksClient,
        @inject(TYPES.PusherClient) pusherClient: IPusherClient
    ) {
        this.fetch = fetch;
        this.superClient = client;
        this.pusherClient = pusherClient;
    }

    public init(options: IProviderOptions)  {
        this.options = options;
        this.pendingTxs = new Map();
    }

    public async sendMessage(payload: IRpcPayload, networkId: string): Promise<any> {
        if (payload.method === 'eth_accounts') {
            return this.getAccounts();
        } else if (payload.method === 'eth_sendTransaction' || payload.method === 'eth_sign') {
            return this.sendRestApiCall(payload, networkId);
         } else {
            // Methods which are not to be intercepted or do not need any account information could be
            // offloaded to Infura, Etherscan, custom Ethereum node or some other public node
            return this.sendRpcJsonCall(payload);
        }
    }

    public send(payload: IRpcPayload): Promise<any> {
        return this.sendMessage(payload, this.options.networkId);
    }

    public sendAsync(payload: IRpcPayload, callback: (error: any, result: any) => void): void {
        this.sendMessage(payload, this.options.networkId)
            .then((result) => {
                const response = payload;
                response.result = result;
                callback(null, response);
            })
            .catch((error) => {
                callback(error, null);
                console.error(`Error from EthereumProvider sendAsync ${payload}: ${error}`);
            });
    }

    private getAccounts(): Promise<any> {
        return new Promise((resolve) => {
            resolve([this.options.from]);
        });
    }

    private async sendRestApiCall(payload: IRpcPayload, networkId: string): Promise<any> {
        return new Promise(async (resolve) => {
            const transaction = await this.superClient.sendEthTransaction({
                buildConfigId: this.BUILD_CONFIG_ID,
                ciJobId: this.CI_JOB_ID,
                projectId: this.PROJECT_ID,
                networkId,
                from: this.options.from,
                rpcPayload: payload
            });

            this.pendingTxs.set(transaction.id, transaction);

            // We can only subscribe to the transaction on this precise moment, as otherwise we won't have the proper JobId mapped
            this.pusherClient.subscribeToChannel(`web3-hub-${transaction.jobId}`, ['update_transaction'], (event) => {
                if (event.eventName === 'update_transaction') {
                    const txUpdated: ITransactionModel = event.message;

                    if (this.pendingTxs.get(txUpdated.id)) {
                        // TODO - Is his actually the right thing to do?
                        // Unsubscribe immediately after receiving the receipt txHash
                        this.pusherClient.unsubscribeFromChannel(`web3-hub-${transaction.jobId}`);

                        this.pendingTxs.delete(txUpdated.id);

                        // TODO - Proper error handling here
                        resolve(txUpdated.transactionHash);
                    }
                }
            });
        });
    }

    private sendRpcJsonCall(payload: IRpcPayload): Promise<any> {
        return new Promise(async (resolve, rejects) => {
            try {
                const response = await this.fetch(this.options.endpoint, {
                    body: JSON.stringify(payload),
                    headers: {
                        'content-type': 'application/json',
                    },
                    method: 'POST'
                });

                const data = await response.json();
                return resolve(data.result);
            } catch (error) {
                rejects(error);
            }
        });
    }
}