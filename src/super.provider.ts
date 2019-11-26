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
import { connectToPusher, subscribeToChannel } from './pusher/pusher.client';
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
    private readonly PROJECT_ID: string = process.env.PROJECT_ID;
    private readonly BUILD_CONFIG_ID: string = process.env.BUILD_CONFIG_ID;
    private readonly CI_JOB_ID: string = process.env.CI_JOB_ID;

    private options: IProviderOptions;
    private pending: any = {};

    constructor(options: IProviderOptions) {
        this.options = options;

        this.init();
    }

    public handleMessage(msg: IMessage) {
        if (this.pending[msg.id]) {
            const cb = this.pending[msg.id];
            delete this.pending[msg.id];

            if (msg.payload.err) {
                this.log(`error occurred: ${msg.payload.err}`);
            }
            cb(msg.payload.err, msg.payload.res);
        }
    }

    public async sendMessage(payload: IRPCPayload, networkId: string, callback: any) {
        if (payload.method === 'eth_sendTransaction' || payload.method === 'eth_sign') {
            console.log('PUTA');
            const transaction = await superblocksClient.sendEthTransaction({
                buildConfigId: this.BUILD_CONFIG_ID,
                jobId: this.CI_JOB_ID,
                projectId: this.PROJECT_ID,
                networkId,
                from: this.options.from,
                rpcPayload: payload
            });

            // We can only subscribe to the transaction on this precise moment, as otherwise we won't have the proper JobId mapped
            subscribeToChannel(`web3-hub-${transaction.jobId}`, ['update_transaction'], (event) => {
                if (event.eventName === 'update_transaction') {
                    const txUpdated: ITransactionModel = event.message;
                    console.log(txUpdated);

                    // TODO - Proper error handling here
                    callback(null, txUpdated.transactionDetails.hash);
                }
            });
         } else {
             // Methods which are not to be intercepted or do not need any account information could be
             // offloaded to Infura, Etherscan, custom Ethereum node or some other public node
             fetch(this.options.endpoint, {
                    body: JSON.stringify(payload),
                    headers: {'content-type': 'application/json',
                },
                method: 'POST'
            }).then((response) => {
                callback(null, response.body);
            }).catch((error) => {
                callback(error, null);
            });
         }
    }

    public prepareRequest(_async: any) {
        throw new Error('Not implemented.');
    }

    public send(payload: IRPCPayload, callback: any) {
        this.sendAsync(payload, callback);
    }

    public sendAsync(payload: any, callback: any) {
        this.sendMessage(payload, this.options.networkId, callback);
    }

    private init() {
        connectToPusher();
    }

    private log(msg: any) {
        console.log('[SuperblocksProvider] ' + (msg !== null ? msg : '') );
    }
}
