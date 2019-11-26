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
import fetch from 'node-fetch';
import { ITransactionModel } from './models';
import { getApiBaseUrl } from './utils';

/**
 * Communication client for Superblocks API.
 */
export interface ISuperblocksClient {
    sendEthTransaction(transaction: ITransactionModel): Promise<ITransactionModel>;
}

export const superblocksClient: ISuperblocksClient = {

    async sendEthTransaction(transaction: ITransactionModel): Promise<ITransactionModel> {
        console.log(`${getApiBaseUrl()}/transactions`);
        const response = await fetch(`${getApiBaseUrl()}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
    },
};
