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

import { injectable } from 'inversify';
import { ISuperblocksUtils } from '../ioc/interfaces';

@injectable()
export class SuperblocksUtils implements ISuperblocksUtils {
    getApiBaseUrl(): string {
        if (process.env.LOCAL) {
            return 'http://localhost:2999/v1';
        } else if (process.env.DEVELOP) {
            return `https://api-dev.superblocks.com/v1`;
        } else {
            return `https://api.superblocks.com/v1`;
        }
    }

    networkIdToName(networkId: string): string {
        switch (networkId) {
            case '1':
                return 'Mainnet';
            case '3':
                return 'Ropsten';
            case '4':
                return 'Rinkeby';
            case '5':
                return 'Görli';
            case '42':
                return 'Kovan';
            default:
                return networkId;
    }
    }
}

