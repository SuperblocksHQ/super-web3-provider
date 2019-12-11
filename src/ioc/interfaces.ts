import * as fetch from 'node-fetch';
import pusher from 'pusher-js';
import { ITransactionModel, IRpcPayload } from '../superblocks/models';

export type Fetch = typeof fetch.default;
export type Pusher = typeof pusher.prototype;

export interface ISuperblocksUtils {
    getApiBaseUrl: () => string;
}

export interface ISuperblocksClient {
    sendEthTransaction(transaction: ITransactionModel): Promise<ITransactionModel>;
}

export interface IManualSignProviderOptions {
    from: string;
    endpoint: string;
    networkId: string;
}

export interface IManualSignProvider {
    init?(options: IManualSignProviderOptions): void;
    sendMessage(payload: IRpcPayload, networkId: string): Promise<any>;
    send(payload: IRpcPayload): Promise<any>;
    sendAsync(payload: IRpcPayload, callback: (error: any, result: any) => void): void;
}

export interface IEventResponse {
    eventName: string;
    message: any;
}

export interface IPusherClient {
    subscribeToChannel(channelName: string, eventNames: [string], callback: (eventResponse: IEventResponse) => any): void;
    unsubscribeFromChannel(channelName: string): void;
}
