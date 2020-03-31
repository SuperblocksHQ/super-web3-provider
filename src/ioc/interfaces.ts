import fetch from 'node-fetch';
import pusher from 'pusher-js';
import { ITransactionModel, ITransactionParamsModel, IDeploymentModel, IMetadataModel, ICustomMetadataModel } from '../superblocks/models';
import { JSONRPCErrorCallback, JSONRPCRequestPayload, JSONRPCResponsePayload } from 'ethereum-protocol';

export type Fetch = typeof fetch.prototype;
export type Pusher = typeof pusher.prototype;

export interface ISuperblocksUtils {
    getApiBaseUrl: () => string;
    networkIdToName: (networkId: string) => string;
    createDefaultMetadata: (metadata: ICustomMetadataModel, ciJobId: string) => IMetadataModel;
    saveDeploymentInfo(deploymentId: string, token: string): void;
}

export interface ISuperblocksClient {
    createDeployment(projectId: string, token: string, networkId: string, metadata?: ICustomMetadataModel): Promise<IDeploymentModel>;
    sendEthTransaction(deploymentId: string, token: string, transaction: ITransactionParamsModel): Promise<ITransactionModel>;
    addTransactionReceipt(deploymentId: string, token: string, txId: string, txHash: string): Promise<void>;
}

export interface IRpcClient {
    sendRpcJsonCall(endpoint: string, payload: JSONRPCRequestPayload): Promise<any>;
}

export interface IManualSignProviderOptions {
    projectId: string;
    token: string;
    from: string;
    endpoint: string;
    networkId: string;
    metadata?: ICustomMetadataModel;
}

export interface IManualSignProvider {
    init?(options: IManualSignProviderOptions): Promise<void>;
    getAccounts(): Promise<string[]>;
    sendMessage(payload: JSONRPCRequestPayload, networkId: string): Promise<any>;
    send(payload: JSONRPCRequestPayload): Promise<any>;
    sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback | JSONRpcCallback): void;
}

export interface IHDWalletProviderOptions {
    projectId: string;
    token: string;
    mnemonic: string | string[];
    provider: any;
    networkId: string;
    addressIndex?: number;
    numAddresses?: number;
    shareNonce?: boolean;
    walletHdPath?: string;
    metadata?: ICustomMetadataModel;
}

export interface IHDWalletProvider {
    init?(options: IHDWalletProviderOptions): Promise<void>;
    send(payload: JSONRPCRequestPayload): Promise<any>;
    sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback | JSONRpcCallback): void;
}

export interface IEventResponse {
    eventName: string;
    message: any;
}

export interface IPusherClient {
    subscribeToChannel(channelName: string, eventNames: [string], token: string, callback: (eventResponse: IEventResponse) => any): void;
    unsubscribeFromChannel(channelName: string): void;
}

export type JSONRpcCallback = (error: null, result: JSONRPCResponsePayload) => void;
