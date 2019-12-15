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

import { injectable, inject } from 'inversify';
import { TYPES } from '../ioc/types';
import { Fetch, IRpcClient } from '../ioc/interfaces';
import { JSONRPCRequestPayload } from 'ethereum-protocol';

@injectable()
export class RpcClient implements IRpcClient {
    private fetch: Fetch;

    public constructor(
        @inject(TYPES.Fetch) fetch: Fetch,
    ) {
        this.fetch = fetch;
    }

    sendRpcJsonCall(endpoint: string, payload: JSONRPCRequestPayload): Promise<any> {
        return new Promise(async (resolve, rejects) => {
            try {
                const response = await this.fetch(endpoint, {
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
