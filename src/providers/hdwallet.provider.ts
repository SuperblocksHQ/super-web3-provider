import ProviderEngine from 'web3-provider-engine';
import { JSONRPCRequestPayload, JSONRPCErrorCallback } from 'ethereum-protocol';
import HDWalletProvider from '@truffle/hdwallet-provider';
import ProviderSubProvider from 'web3-provider-engine/subproviders/provider';
import { injectable, inject } from 'inversify';
import { IHDWalletProviderOptions, ISuperblocksClient, ISuperblocksUtils, IHDWalletProvider } from '../ioc/interfaces';
import { TYPES } from '../ioc/types';
import { IDeploymentModel, SignMethod, ITransactionModel } from '../superblocks/models';

// Debugging tools
const DEBUG_FLAG = process.env.DEBUG_PROVIDER;
if (DEBUG_FLAG) {
    console.log('[SuperHDWalletProvider] DEBUG_FLAG is set: ', DEBUG_FLAG);
}

@injectable()
export class SuperHDWalletProvider implements IHDWalletProvider {

    public engine: ProviderEngine;

    // Pre-defined variable setup by the Superblocks CI when executing the job including the deployment process
    private readonly CI_JOB_ID: string = process.env.CI_JOB_ID;
    private superblocksClient: ISuperblocksClient;
    private superblocksUtils: ISuperblocksUtils;
    private options: IHDWalletProviderOptions;
    private releaseHasBeenCreated = false;
    private deployment: IDeploymentModel;
    private from: string;

    constructor(
        @inject(TYPES.SuperblocksClient) superblocksClient: ISuperblocksClient,
        @inject(TYPES.SuperblocksUtils) superblocksUtils: ISuperblocksUtils,
    ) {
        this.superblocksClient = superblocksClient;
        this.superblocksUtils = superblocksUtils;
    }

    public async init({
        deploymentSpaceId,
        token,
        mnemonic,
        provider,
        networkId,
        addressIndex = 0,
        numAddresses = 10,
        shareNonce = true,
        walletHdPath = `m/44'/60'/0'/0/`
    }: IHDWalletProviderOptions) {
        console.info('[SuperHDWalletProvider] Initializing...');

        // TODO - Add validation to everything

        this.options = {
            deploymentSpaceId,
            token,
            mnemonic,
            provider,
            networkId,
            addressIndex,
            numAddresses,
            shareNonce,
            walletHdPath
        };

        // Create new provider-engine
        this.engine = new ProviderEngine();

        // Install event listeners, if available
        if (this.engine.on !== undefined) {
            this.engine.on('start', () => {
                this.logDebug('[SuperHDWalletProvider] Starting provider engine...');
            });

            this.engine.on('stop', () => {
                this.logDebug('[SuperHDWalletProvider] Provider engine has stopped');
            });

            // Unable to register as TypeScript code due to mismatched type definitions.
            // Signature reads: on(event: string, handler: () => void): void;
            // Expected: error object argument
            this.engine.on('error', (err: Error) => {
                console.error('[SuperHDWalletProvider] Error: ', err);
            });
        } else {
            console.warn('[SuperHDWalletProvider] Expected provider engine listener to be available. Skipping EventEmitter debugging...');
        }

        // Add Truffle's HDWalletProvider and setup the from address
        const hdwalletProvider = new HDWalletProvider(mnemonic, provider, addressIndex, numAddresses, shareNonce, walletHdPath);
        this.from = hdwalletProvider.getAddresses()[addressIndex];
        this.engine.addProvider(new ProviderSubProvider(hdwalletProvider));

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

    public sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback) {
        // Proceed with base implementation
        //
        // If calling the parent class method synchronously
        // to match the base implementation, the suggested call is as follows:
        // this.engine.sendAsync.apply(this.engine, arguments);
        //

        if (payload.method === 'eth_sendTransaction') {
            this.registerTransaction(payload)
                .then((transaction) => {
                    // Otherwise, proceed with explicit and expanded parameters
                    this.engine.sendAsync(payload, (err, response) => {
                        this.addTransactionReceipt(transaction, response.result)
                            .then(() => {
                                callback(err, response);
                            });
                    });
                });
        } else {
            // Otherwise, proceed with explicit and expanded parameters
            // this.engine.sendAsync(payload, callback);
            this.engine.sendAsync.apply(this.engine, arguments);
        }
    }

    private async registerTransaction(payload: JSONRPCRequestPayload) {
        try {
            const transaction = await this.superblocksClient.sendEthTransaction(this.deployment.id, this.options.token, {
                networkId: this.options.networkId,
                endpoint: this.options.provider,
                from: this.from,
                signMethod: SignMethod.Automatic,
                rpcPayload: payload
            });

            return Promise.resolve(transaction);
        } catch (error) {
            // spinner.fail('[Superblocks - Manual Sign Provider] Failed to send the tx to Superblocks.');
            console.log('\x1b[31m%s\x1b[0m', 'Error: ', error.message);

            return Promise.reject(error.message);
        }
    }

    private async addTransactionReceipt(transaction: ITransactionModel, txHash: string) {
        try {
            await this.superblocksClient.addTransactionReceipt(this.deployment.id, this.options.token, transaction.id, txHash);
        } catch (error) {
            // spinner.fail('[Superblocks - Manual Sign Provider] Failed to send the tx to Superblocks.');
            console.log('\x1b[31m%s\x1b[0m', 'Error: ', error.message);

            return Promise.reject(error.message);
        }
    }

    private async hookCreateRelease() {
        // In case the connected operations lead to side effects,
        // only call it once.
        if (!this.releaseHasBeenCreated) {
            this.logDebug('[hook_createRelease] Calling new Superblocks Release');

            this.deployment = await this.superblocksClient.createDeployment(this.options.deploymentSpaceId, this.options.token, this.superblocksUtils.networkIdToName(this.options.networkId), this.CI_JOB_ID);
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
