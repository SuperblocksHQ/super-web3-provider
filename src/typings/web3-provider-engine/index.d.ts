declare module 'web3-provider-engine' {
  import {
    Provider,
    JSONRPCRequestPayload,
    JSONRPCErrorCallback
  } from "ethereum-protocol";

  import { Callback, JsonRPCResponse } from "web3/providers";
  
  interface Web3ProviderEngineOptions {
    pollingInterval?: number;
    blockTracker?: any;
    blockTrackerProvider?: any;
  }

  export default class Web3ProviderEngine implements Provider {
    constructor(options?: Web3ProviderEngineOptions);
    on(event: string, handler: (err: Error, res: any) => void): void;
    send(
        payload: JSONRPCRequestPayload,
        callback?: JSONRPCErrorCallback | Callback<JsonRPCResponse>
    ): void;
    sendAsync(
        payload: JSONRPCRequestPayload,
        callback: JSONRPCErrorCallback
    ): void;
    addProvider(provider: any): void;
    // start block polling
    start(callback?: () => void): void;
    // stop block polling
    stop(): void;
  }
}

declare module 'web3/providers' {
  interface Callback<T> {}
  interface JsonRPCResponse {}
}
declare module 'web3-provider-engine/subproviders/provider';
declare module 'web3-provider-engine/subproviders/hooked-wallet';