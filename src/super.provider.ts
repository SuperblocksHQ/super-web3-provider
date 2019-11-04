// Copyright 2019 Superblocks AB
//

'use strict';

const io = require('socket.io-client');
const url = require('url');

const pending = {};
let msgCounter = 0;
let socket = null;
let status = 'unconnected';

const handleMessage = (msg) => {
    if (pending[msg.id]) {
        const cb = pending[msg.id];
        delete pending[msg.id];
	       if (msg.payload.err) {
		console.log('error occured: ', msg.payload.err);
	}
        cb(msg.payload.err, msg.payload.res);
    }
};

const sendMessage = (payload, networkVersion, callback) => {
    if (status === 'unconnected') {
        log('Waiting for connection...');
        setTimeout( () => {
            sendMessage(payload, networkVersion, callback);
        }, 1000);
        return;
    }

    if (payload.method == 'eth_sendTransaction' || payload.method == 'eth_sign') {
        log('Waiting for user to sign transaction with Metamask...');
    }

    // TODO: Add a timeout for responses so we can abort in a sane manner.
    _sendMessage(payload, networkVersion, callback);
};

const _sendMessage = (payload, networkVersion, callback) => {
    const id = msgCounter++;
    const msg = {payload, id, networkVersion};
    pending[id] = callback;
    socket.emit('message', msg);
};

const log = msg => {
    console.log('[SuperblocksProvider] ' + (msg !== null ? msg : '') );
};

function SuperblocksProvider(sessionId, addresses, options) {
    // We use a singleton pattern here since we do not want to create mutliple sockets if the
    // callee is lazy and is recreating this object when it does not have to.
    sessionId = sessionId.toString();

    if (SuperblocksProvider.prototype._instances[sessionId]) {
        return SuperblocksProvider.prototype._instances[sessionId];
    }
    SuperblocksProvider.prototype._instances[sessionId] = this;

    if (addresses instanceof Array) {
        this.addresses = addresses;
    } else if (typeof addresses == 'string') {
        this.addresses = [addresses];
    } else {
        this.addresses = [];
    }

    this.vendor = 'Superblocks';
    this.networkVersion = null;
    this.options = options || {};
    this.sessionId = sessionId;

    this.options.proxyUrl = this.options.proxyUrl || 'https://api.superblocks.com/v1/web3-hub/provider';

    const { protocol, host, pathname } = new URL(this.options.proxyUrl);

    // Socket.io uses namespaces instead of routes, so must manually specify route
    socket = io(`${protocol}//${host}`, {path: pathname});

    if (!socket) {
        throw new Error('Could not instantiate socket.');
    }

    socket.emit('handshake', {id: sessionId});

    socket.on('paired', () => {
        log('Socket connected');
        socket.on('message', handleMessage);

        if (this.options.fetchAddresses !== false && this.addresses.length === 0) {
            log('Fetch addresses from Metamask');
            const payload = { jsonrpc: '2.0', id: 1, method: 'eth_accounts', params: [] };
            _sendMessage(payload, this.networkVersion, (err, res) => {
                status = 'connected';
            });
        } else {
            status = 'connected';
        }
    });

    return this;
}

SuperblocksProvider.prototype._instances = {};

SuperblocksProvider.prototype.prepareRequest = function(async) {
    throw new Error('Not implemented.');
};

SuperblocksProvider.prototype.isConnected = function() {
    return status === 'connected';
};

SuperblocksProvider.prototype.sendAsync = function(payload, callback) {
    sendMessage(payload, this.networkVersion, callback);
};

SuperblocksProvider.prototype.send = SuperblocksProvider.prototype.sendAsync;

SuperblocksProvider.prototype.getAddress = function(index) {
    return this.addresses[index];
};

SuperblocksProvider.prototype.getAddresses = function() {
    return this.addresses;
};

module.exports = SuperblocksProvider;
