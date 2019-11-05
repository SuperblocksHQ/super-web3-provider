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

export default class SuperblocksProvider {

    // Pre-defined variable setup by the Superblocks CI when executing the job including the deployment process
    private readonly SESSION_ID: string = process.env.SUPER_SESSION_ID;
    private readonly DEFAULT_PROXY_URL: string = 'https://api.superblocks.com/v1/web3-hub/provider';

    private addresses: [string];
    private options: IProviderOptions;
    private pending: any = {};
    private socket = io.Socket = {} as SocketIOClient.Socket;
    private msgCounter = 0;
    private status = 'unconnected';
    private networkVersion: string;

    constructor(options: IProviderOptions) {
        this.options = options;

        this.init();
    }

    public handleMessage = (msg: IMessage) => {
        if (this.pending[msg.id]) {
            const cb = this.pending[msg.id];
            delete this.pending[msg.id];

            if (msg.payload.err) {
                this.log(`error occurred: ${msg.payload.err}`);
            }
            cb(msg.payload.err, msg.payload.res);
        }
    }

    public sendMessage = (payload: any, networkVersion: string, callback: any) => {
        if (this.status === 'unconnected') {
            this.log('Waiting for connection...');
            setTimeout( () => {
                this.sendMessage(payload, networkVersion, callback);
            }, 1000);
            return;
        }

        if (payload.method === 'eth_sendTransaction' || payload.method === 'eth_sign') {
            console.log('Waiting for user to sign transaction with Metamask...');
        }

        // TODO: Add a timeout for responses so we can abort in a sane manner.
        this.sendSocketMessage(payload, networkVersion, callback);
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

    private init = () => {
        this.networkVersion = null;
        this.options.proxyUrl = this.options.proxyUrl || this.DEFAULT_PROXY_URL;

        const { protocol, host, pathname } = new URL(this.options.proxyUrl);

        // Socket.io uses namespaces instead of routes, so must manually specify route
        this.socket = io(`${protocol}//${host}`, { path: pathname });
        if (!this.socket) {
            throw new Error('Could not instantiate socket.');
        }

        this.socket.emit('handshake', { id: this.SESSION_ID });
        this.socket.on('paired', () => {
            this.log('Socket connected');
            this.socket.on('message', this.handleMessage);

            this.log('Fetch addresses from Metamask');
            const payload = { jsonrpc: '2.0', id: 1, method: 'eth_accounts', params: <any>[] };
            this.sendSocketMessage(payload, this.networkVersion, (_err: any, _res: any) => {
                this.status = 'connected';
            });
        });
    }

    private sendSocketMessage = (payload: IRPCPayload, networkVersion: any, callback: any) => {
        this.msgCounter += 1;
        const id = this.msgCounter;
        const msg = { payload, id, networkVersion };
        this.pending[id] = callback;
        this.socket.emit('message', msg);
    }

    private log = (msg: any) => {
        console.log('[SuperblocksProvider] ' + (msg !== null ? msg : '') );
    }
}
