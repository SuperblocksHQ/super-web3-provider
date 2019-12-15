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

import { JSONRPCRequestPayload } from 'ethereum-protocol';

export enum MinedTransactionStatus {
    Success = '0x01',
    Fail = '0x00'
}

export interface ITransactionDetails {
    blockHash: string;
    blockNumber: number;
    hash: string;
    transactionIndex: number | null;
    nonce: number;
    from: string;
    to: string | null;
    input: any;
    value: number;
    gas: number;
    gasPrice: number;

    // Params only available once mined
    gasUsed?: number;
    contractAddress?: string;
    logs?: string;
    logsBloom?: any;
    status?: MinedTransactionStatus;
    code?: any;
    blockTime?: any;
}

export interface ITransactionModel {
    id?: string;
    projectId: string;
    buildConfigId: string;

    // Job id in the context of the platform
    jobId?: string;

    // Job id represented inside the CI context itself
    ciJobId?: string;
    from: string;
    networkId: string;
    rpcPayload: JSONRPCRequestPayload;

    // This will only be available when the receipt is in place
    transactionHash?: string;
    transactionDetails?: ITransactionDetails;
}
