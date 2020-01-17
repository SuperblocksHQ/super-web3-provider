//
// Imports and external libraries
import ProviderEngine from 'web3-provider-engine';
import { JSONRPCRequestPayload, JSONRPCErrorCallback } from 'ethereum-protocol';
import Web3ProviderEngine from 'web3-provider-engine';

// FIXME: importing involves unaccessible web3 dependencies
const hdWalletProvider = require('@truffle/hdwallet-provider');

// FIXME: needs manual typings ?
const whitelistProvider = require('web3-provider-engine/subproviders/whitelist');
const providerSubProvider = require('web3-provider-engine/subproviders/provider');

//
// Debugging tools
const DEBUG_FLAG = process.env.DEBUG_PROVIDER;
if (DEBUG_FLAG) {
    console.log('[SuperHDWalletProvider] DEBUG_FLAG is set: ', DEBUG_FLAG);
}
function logDebug(...argv: any[]) {
    if (DEBUG_FLAG) {
        console.log.apply(this, argv);
    }
}


//
// Connect external release
let releaseHasBeenCreated = false;
const hookCreateRelease = async () => {
    // In case the connected operations lead to side effects,
    // only call it once.
    if (!releaseHasBeenCreated) {
        logDebug('[hook_createRelease] Calling new Superblocks Release');

        // Simulate blocking work
        await new Promise( (t) => {
            setTimeout(t, 3000);
        });

        // Mark as done
        releaseHasBeenCreated = true;
        logDebug('[hook_createRelease] New Superblocks Release has been created');
    }
};

//
// Connect custom operations to be performed before send
const hookBeforeSend = () => {
    logDebug('[hook_before_send] Intercepting send');

    // Do not call any asynchronous function inside synchronous codepath
    // If createRelease involves asynchronous functions, skip it
    // hook_createRelease();
};

const hookBeforeSendAsync = async () => {
    logDebug('[hook_before_sendAsync] Intercepting sendAsync');
    await hookCreateRelease();
};

interface IWeb3ProviderEngine extends Web3ProviderEngine {
    on(event: string, handler: (err: Error, res: any) => void): void;
}


interface IHDWalletProviderOptions {
    deploymentSpaceId: string;
    token: string;
    mnemonic: string | string[];
    endpoint: string;
    networkId: string;
    provider?: any;
    addressIndex?: number;
    numAddresses?: number;
    shareNonce?: boolean;
    walletHdPath?: string;
}

export class SuperHDWalletProvider {
    public engine: IWeb3ProviderEngine;

    constructor({
        mnemonic,
        provider,
        addressIndex = 0,
        numAddresses = 10,
        shareNonce = true,
        walletHdPath = `m/44'/60'/0'/0/`
    }: IHDWalletProviderOptions) {
        console.info('[SuperHDWalletProvider] Initializing...');

        // Create new provider-engine
        this.engine = <IWeb3ProviderEngine> new ProviderEngine();

        // Install event listeners, if available
        if (this.engine.on !== undefined) {
            this.engine.on('start', () => {
                logDebug('[SuperHDWalletProvider] Starting provider engine...');
            });

            this.engine.on('stop', () => {
                logDebug('[SuperHDWalletProvider] Provider engine has stopped');
            });

            /* TODO: FIXME:
            // Unable to register as TypeScript code due to mismatched type definitions.
            // Signature reads: on(event: string, handler: () => void): void;
            // Expected: error object argument
            this.engine.on('error', function(err: Error){
                console.error('[SuperHDWalletProvider] Error: ', err);
            });
            */

            // Install debugging facilities when requested
            if (DEBUG_FLAG) {
                /* TODO: FIXME:
                // Unable to register as TypeScript code due to mismatched type definitions.
                // Signature reads: on(event: string, handler: () => void): void;
                // Expected: error object and data argument
                */
                this.engine.on('data', (err: Error, res: any) => {
                    logDebug('[SuperHDWalletProvider] Data: ', err, res);
                });

                this.engine.on('sync', () => {
                    logDebug('[SuperHDWalletProvider] Sync');
                });

                /* TODO: FIXME:
                // Unable to register as TypeScript code due to mismatched type definitions.
                // Types signature reads: on(event: string, handler: () => void): void;
                // Expected: block argument
                this.engine.on('block', function(block: any){
                    if(block && block.number && block.hash) {
                        const blockNumber = Number.parseInt(block.number.toString('hex'), 16);
                        const blockHash = `0x${block.hash.toString('hex')}`;
                        logDebug(`[SuperHDWalletProvider] Block: #${blockNumber} ${blockHash}`);
                    } else {
                        logDebug('[SuperHDWalletProvider] Unexpected block format: ', block);
                    }
                });

                this.engine.on('rawBlock', function(block){
                    if(block && block.number && block.hash) {
                        const blockNumber = Number.parseInt(block.number.toString('hex'), 16);
                        const blockHash = `0x${block.hash.toString('hex')}`;
                        logDebug(`[SuperHDWalletProvider] Raw block: #${blockNumber} ${blockHash}`);
                    } else {
                        logDebug('[SuperHDWalletProvider] Unexpected block format: ', block);
                    }
                });

                this.engine.on('latest', function(block){
                    if(block && block.number && block.hash) {
                        const blockNumber = Number.parseInt(block.number.toString('hex'), 16);
                        const blockHash = `0x${block.hash.toString('hex')}`;
                        logDebug(`[SuperHDWalletProvider] Latest block: #${blockNumber} ${blockHash}`);
                    } else {
                        logDebug('[SuperHDWalletProvider] Unexpected block format: ', block);
                    }
                });
                */
            }
        } else {
            console.warn('[SuperHDWalletProvider] Expected provider engine listener to be available. Skipping EventEmitter debugging...');
        }

        //
        // Configure provider by composing subproviders
        //

        // Add whitelist filtering
        // NOTE: TODO: FIXME:
        // Experiment with this option by toggling the switch below
        // to only allow a select list of Ethereum operations to be performed
        if (false) {
            this.engine.addProvider(new whitelistProvider(['eth_gasPrice', 'eth_blockNumber']));
        }

        // Add Truffle's HDWalletProvider
        const hdwalletProvider = new hdWalletProvider(mnemonic, provider, addressIndex, numAddresses, shareNonce, walletHdPath);
        this.engine.addProvider(new providerSubProvider(hdwalletProvider));

        // Start the provider engine
        // From this point on, errors are caught by listening to the error event (Event Emitter)
        this.engine.start();
    }

    send(_payload: JSONRPCRequestPayload, _callback: JSONRPCErrorCallback) {

        // Hook external call
        hookBeforeSend();

        // Proceed with base implementation
        return this.engine.send.apply(this.engine, arguments);
    }

    async sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback) {
        // Hook external call in a blocking way expecting some work
        // to be done before calling upper class sendAsync
        await hookBeforeSendAsync();

        // Proceed with base implementation
        //
        // If calling the parent class method synchronously
        // to match the base implementation, the suggested call is as follows:
        // this.engine.sendAsync.apply(this.engine, arguments);
        //
        // Otherwise, proceed with explicit and expanded parameters
        this.engine.sendAsync(payload, callback);
    }
}
