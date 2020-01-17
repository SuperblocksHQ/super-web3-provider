//
// Imports and external libraries
import ProviderEngine from 'web3-provider-engine';
import { JSONRPCRequestPayload, JSONRPCErrorCallback } from 'ethereum-protocol';
import Web3ProviderEngine from 'web3-provider-engine';
import { injectable, inject } from 'inversify';
import { IHDWalletProviderOptions, ISuperblocksClient, ISuperblocksUtils, IHDWalletProvider } from '../ioc/interfaces';
import { TYPES } from '../ioc/types';

// FIXME: importing involves unaccessible web3 dependencies
const hdWalletProvider = require('@truffle/hdwallet-provider');

// FIXME: needs manual typings ?
const whitelistProvider = require('web3-provider-engine/subproviders/whitelist');
const providerSubProvider = require('web3-provider-engine/subproviders/provider');

// ATTENTION: Merge ProviderEngine types as they are not correctly done
interface IWeb3ProviderEngine extends Web3ProviderEngine {
    on(event: string, handler: (err: Error, res: any) => void): void;
}

// Debugging tools
const DEBUG_FLAG = process.env.DEBUG_PROVIDER;
if (DEBUG_FLAG) {
    console.log('[SuperHDWalletProvider] DEBUG_FLAG is set: ', DEBUG_FLAG);
}

@injectable()
export class SuperHDWalletProvider implements IHDWalletProvider {

    public engine: IWeb3ProviderEngine;

    // Pre-defined variable setup by the Superblocks CI when executing the job including the deployment process
    private readonly CI_JOB_ID: string = process.env.CI_JOB_ID;
    private superblocksClient: ISuperblocksClient;
    private superblocksUtils: ISuperblocksUtils;
    private options: IHDWalletProviderOptions;
    private releaseHasBeenCreated = false;
    // private deployment: IDeploymentModel;

    constructor(
        @inject(TYPES.SuperblocksClient) superblocksClient: ISuperblocksClient,
        @inject(TYPES.SuperblocksUtils) superblocksUtils: ISuperblocksUtils,
    ) {
        this.superblocksClient = superblocksClient;
        this.superblocksUtils = superblocksUtils;
    }

    public async init({
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
                this.logDebug('[SuperHDWalletProvider] Starting provider engine...');
            });

            this.engine.on('stop', () => {
                this.logDebug('[SuperHDWalletProvider] Provider engine has stopped');
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
                    this.logDebug('[SuperHDWalletProvider] Data: ', err, res);
                });

                this.engine.on('sync', () => {
                    this.logDebug('[SuperHDWalletProvider] Sync');
                });
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

        console.log('here');

        await this.hookCreateRelease();

        // Start the provider engine
        // From this point on, errors are caught by listening to the error event (Event Emitter)
        this.engine.start();
    }

    public send(_payload: JSONRPCRequestPayload): Promise<any> {

        // Hook external call
        this.hookBeforeSend();

        // Proceed with base implementation
        return this.engine.send.apply(this.engine, arguments);
    }

    public async sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback) {
        // Proceed with base implementation
        //
        // If calling the parent class method synchronously
        // to match the base implementation, the suggested call is as follows:
        // this.engine.sendAsync.apply(this.engine, arguments);
        //
        // Otherwise, proceed with explicit and expanded parameters
        this.engine.sendAsync(payload, callback);
    }

    private async hookCreateRelease() {
        // In case the connected operations lead to side effects,
        // only call it once.
        if (!this.releaseHasBeenCreated) {
            this.logDebug('[hook_createRelease] Calling new Superblocks Release');

            await this.superblocksClient.createDeployment(this.options.deploymentSpaceId, this.options.token, this.superblocksUtils.networkIdToName(this.options.networkId), this.CI_JOB_ID);
            this.logDebug('[hook_createRelease] Deployment created');

            // Mark as done
            this.releaseHasBeenCreated = true;
            this.logDebug('[hook_createRelease] New Superblocks Release has been created');
        }
    }

    /**
     * Connect custom operations to be performed before send
     */
    private hookBeforeSend() {
        this.logDebug('[hook_before_send] Intercepting send');

        // Do not call any asynchronous function inside synchronous codepath
        // If createRelease involves asynchronous functions, skip it
        // hook_createRelease();
    }

    private logDebug(...argv: any[]) {
        if (DEBUG_FLAG) {
            console.log.apply(this, argv);
        }
    }
}
