import fetch from 'node-fetch';
import pusher from 'pusher-js';
import { ITransactionModel, ITransactionParamsModel } from '../superblocks/models';
import { JSONRPCErrorCallback, JSONRPCRequestPayload, JSONRPCResponsePayload } from 'ethereum-protocol';

export type Fetch = typeof fetch.prototype;
export type Pusher = typeof pusher.prototype;

export interface ISuperblocksUtils {
    getApiBaseUrl: () => string;
}

export interface ISuperblocksClient {
    sendEthTransaction(releaseId: string, token: string, transaction: ITransactionParamsModel): Promise<ITransactionModel>;
    createRelease(workspaceId: string, token: string, networkId: string): Promise<ITransactionModel>;
}

export interface IRpcClient {
    sendRpcJsonCall(endpoint: string, payload: JSONRPCRequestPayload): Promise<any>;
}

export interface IManualSignProviderOptions {
    from: string;
    endpoint: string;
    networkId: string;
}

export interface IManualSignProvider {
    init?(options: IManualSignProviderOptions): void;
    getAccounts(): Promise<string[]>;
    sendMessage(payload: JSONRPCRequestPayload, networkId: string): Promise<any>;
    send(payload: JSONRPCRequestPayload): Promise<any>;
    sendAsync(payload: JSONRPCRequestPayload, callback: JSONRPCErrorCallback | JSONRpcCallback): void;
}

export interface IEventResponse {
    eventName: string;
    message: any;
}

export interface IPusherClient {
    subscribeToChannel(channelName: string, eventNames: [string], callback: (eventResponse: IEventResponse) => any): void;
    unsubscribeFromChannel(channelName: string): void;
}

export type JSONRpcCallback = (error: null, result: JSONRPCResponsePayload) => void;
