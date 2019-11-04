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

import io from 'socket.io-client';

interface IProviderOptions {
    proxyUrl: string;
    addresses: [string];
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

export class SuperblocksProvider {
    private addresses: [string];
    private options: IProviderOptions;
    private pending: any = {};
    private socket = io.Socket = {} as SocketIOClient.Socket;
    private msgCounter = 0;
    private status = 'unconnected';
    private networkVersion: string;

    // Pre-defined variable setup by the Superblocks CI when executing the job including the deployment process
    private readonly SESSION_ID: string = process.env.SUPER_SESSION_ID;


    constructor(options: IProviderOptions) {
        this.options = options;

        this._init();
    }

    public handleMessage(msg: IMessage) {
        if (this.pending[msg.id]) {
            const cb = this.pending[msg.id];
            delete this.pending[msg.id];

            if (msg.payload.err) {
                this._log(`error occurred: ${msg.payload.err}`);
            }
            cb(msg.payload.err, msg.payload.res);
        }
    }

    public sendMessage = (payload: any, networkVersion: string, callback: any) => {
        if (status === 'unconnected') {
            this._log('Waiting for connection...');
            setTimeout( () => {
                this.sendMessage(payload, networkVersion, callback);
            }, 1000);
            return;
        }

        if (payload.method === 'eth_sendTransaction' || payload.method === 'eth_sign') {
            console.log('Waiting for user to sign transaction with Metamask...');
        }

        // TODO: Add a timeout for responses so we can abort in a sane manner.
        this._sendMessage(payload, networkVersion, callback);
    }

    public prepareRequest = (_async: any) => {
        throw new Error('Not implemented.');
    }

    public isConnected = () => {
        return this.status === 'connected';
    }

    public send = (payload: any, callback: any) => {
        this.sendAsync(payload, callback);
    }

    public sendAsync = (payload: any, callback: any) => {
        this.sendMessage(payload, this.networkVersion, callback);
    }

    public getAddress = (index: number) => {
        return this.addresses[index];
    }

    public getAddresses = () => {
        return this.addresses;
    }

    private _init() {
        this.networkVersion = null;
        this.options.proxyUrl = this.options.proxyUrl || 'https://api.superblocks.com/v1/web3-hub/provider';

        const { protocol, host, pathname } = new URL(this.options.proxyUrl);

        // Socket.io uses namespaces instead of routes, so must manually specify route
        this.socket = io(`${protocol}//${host}`, { path: pathname });
        if (!this.socket) {
            throw new Error('Could not instantiate socket.');
        }

        this.socket.emit('handshake', { id: this.SESSION_ID });
        this.socket.on('paired', () => {
            this._log('Socket connected');
            this.socket.on('message', this.handleMessage);

            this._log('Fetch addresses from Metamask');
            const payload = { jsonrpc: '2.0', id: 1, method: 'eth_accounts', params: <any>[] };
            this._sendMessage(payload, this.networkVersion, (_err: any, _res: any) => {
                this.status = 'connected';
            });
        });
    }

    private _sendMessage(payload: IRPCPayload, networkVersion: any, callback: any) {
        const id = this.msgCounter++;
        const msg = {payload, id, networkVersion};
        this.pending[id] = callback;
        this.socket.emit('message', msg);
    }

    private _log(msg: any) {
        console.log('[SuperblocksProvider] ' + (msg !== null ? msg : '') );
    }
}
