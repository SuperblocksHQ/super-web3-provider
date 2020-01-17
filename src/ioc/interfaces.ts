import fetch from 'node-fetch';
import pusher from 'pusher-js';
import { ITransactionModel, ITransactionParamsModel, IDeploymentModel } from '../superblocks/models';
import { JSONRPCErrorCallback, JSONRPCRequestPayload, JSONRPCResponsePayload } from 'ethereum-protocol';

export type Fetch = typeof fetch.prototype;
export type Pusher = typeof pusher.prototype;

export interface ISuperblocksUtils {
    getApiBaseUrl: () => string;
    networkIdToName: (networkId: string) => string;
}

export interface ISuperblocksClient {
    sendEthTransaction(deploymentId: string, token: string, transaction: ITransactionParamsModel): Promise<ITransactionModel>;
    createDeployment(deploymentSpaceId: string, token: string, networkId: string, ciJobId?: string): Promise<IDeploymentModel>;
}

export interface IRpcClient {
    sendRpcJsonCall(endpoint: string, payload: JSONRPCRequestPayload): Promise<any>;
}

export interface IManualSignProviderOptions {
    deploymentSpaceId: string;
    token: string;
    from: string;
    endpoint: string;
    networkId: string;
}

export interface IManualSignProvider {
    init?(options: IManualSignProviderOptions): Promise<void>;
    getAccounts(): Promise<string[]>;
    sendMessage(payload: JSONRPCRequestPayload, networkId: string): Promise<any>;
    send(payload: JSONRPCRequestPayload): Promise<any>;
    sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback | JSONRpcCallback): void;
}

export interface IHDWalletProviderOptions {
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
