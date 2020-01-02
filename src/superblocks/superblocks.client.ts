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
// import fetch from 'node-fetch';
import { ITransactionModel, IReleaseModel } from './models';
import { injectable, inject } from 'inversify';
import { TYPES } from '../ioc/types';
import { Fetch, ISuperblocksUtils, ISuperblocksClient } from '../ioc/interfaces';

@injectable()
export class SuperblocksClient implements ISuperblocksClient {
    private fetch: Fetch;
    private utils: ISuperblocksUtils;

    public constructor(
        @inject(TYPES.Fetch) fetch: Fetch,
        @inject(TYPES.SuperblocksUtils) utils: ISuperblocksUtils,
    ) {
        this.fetch = fetch;
        this.utils = utils;
    }

    async sendEthTransaction(releaseId: string, token: string, transaction: ITransactionModel): Promise<ITransactionModel> {
        const response = await this.fetch(`${this.utils.getApiBaseUrl()}/releases/${releaseId}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'project-token': token
            },
            body: JSON.stringify(transaction)
        });

        if (response.ok) {
            const tx = await response.json();
            console.log('[Superblocks client] transaction sent', tx);
            return tx;
        } else {
            console.log(await response.text());
            throw new Error('[Superblocks client] cannot create send transaction to the web3 hub');
        }
    }

    async createRelease(workspaceId: string, token: string, environment: string): Promise<IReleaseModel> {
        const response = await this.fetch(`${this.utils.getApiBaseUrl()}/workspaces/${workspaceId}/releases/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'project-token': token
            },
            body: JSON.stringify({
                environment,
                type: 'ethereum'
            })
        });

        if (response.ok) {
            const release = await response.json();
            console.log('[Superblocks client] release created', release);
            return release;
        } else {
            const error = await response.text();
            throw new Error(`[Superblocks client] cannot create a release: ${error}`);
        }
    }
}
