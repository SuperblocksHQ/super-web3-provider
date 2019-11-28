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

import fetch from 'node-fetch';
import { connectToPusher, subscribeToChannel, unsubscribeFromChannel } from './pusher/pusher.client';
import { superblocksClient } from './superblocks/superblocks.client';
import { ITransactionModel } from './superblocks/models';

interface IProviderOptions {
    from: string;
    endpoint: string;
    networkId: string;
}

interface IMessage {
    id: string;
    payload: {
        err: any;
        res: any;
    };
}

interface IRPCPayload {
    jsonrpc: string;
    id: number;
    method: string;
    params: [any];
}

export default class SuperblocksProvider {

    // Pre-defined variable setup by the Superblocks CI when executing the job including the deployment process
    private readonly PROJECT_ID: string = process.env.SUPER_PROJECT_ID;
    private readonly BUILD_CONFIG_ID: string = process.env.SUPER_BUILD_CONFIG_ID;
    private readonly CI_JOB_ID: string = process.env.CI_JOB_ID;

    private options: IProviderOptions;

    constructor(options: IProviderOptions) {
        this.options = options;

        this.init();
    }

    public async sendMessage(payload: IRPCPayload, networkId: string): Promise<any> {
        return new Promise(async (resolve, rejects) => {
            if (payload.method === 'eth_accounts') {
                resolve({
                    jsonrpc: payload.jsonrpc,
                    id: payload.id,
                    result: [this.options.from]
                });
            } else if (payload.method === 'eth_sendTransaction' || payload.method === 'eth_sign') {
                const transaction = await superblocksClient.sendEthTransaction({
                    buildConfigId: this.BUILD_CONFIG_ID,
                    ciJobId: this.CI_JOB_ID,
                    projectId: this.PROJECT_ID,
                    networkId,
                    from: this.options.from,
                    rpcPayload: payload
                });

                // We can only subscribe to the transaction on this precise moment, as otherwise we won't have the proper JobId mapped
                subscribeToChannel(`web3-hub-${transaction.jobId}`, ['update_transaction'], (event) => {
                    if (event.eventName === 'update_transaction') {
                        const txUpdated: ITransactionModel = event.message;

                        // TODO - Is his actually the right thing to do?
                        // Unsubscribe immediately after receiving the receipt txHash
                        unsubscribeFromChannel(`web3-hub-${transaction.jobId}`);

                        // TODO - Proper error handling here
                        resolve({
                            jsonrpc: payload.jsonrpc,
                            id: payload.id,
                            result: txUpdated.transactionHash
                        });
                    }
                });
             } else {
                // Methods which are not to be intercepted or do not need any account information could be
                // offloaded to Infura, Etherscan, custom Ethereum node or some other public node
                try {
                    const response = await fetch(this.options.endpoint, {
                        body: JSON.stringify(payload),
                        headers: {
                            'content-type': 'application/json',
                        },
                        method: 'POST'
                    });

                    const data = await response.json();
                    resolve(data);
                } catch (error) {
                    rejects(error);
                }
            }
        });
    }

    public send(payload: IRPCPayload): Promise<any> {
        return this.sendMessage(payload, this.options.networkId);
    }

    public sendAsync(payload: IRPCPayload, callback: (error: any, result: any) => void): void {
        this.sendMessage(payload, this.options.networkId)
            .then((result) => callback(null, result))
            .catch((error) => callback(error, null));
    }

    private init() {
        connectToPusher();
    }
}
