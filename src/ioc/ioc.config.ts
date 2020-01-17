import { Container, ContainerModule } from 'inversify';
import * as fetch from 'node-fetch';
import * as pusher from 'pusher-js';
import { TYPES } from './types';
import { Fetch, Pusher, IManualSignProvider, ISuperblocksUtils, ISuperblocksClient, IPusherClient, IRpcClient, IHDWalletProvider } from './interfaces';
import { SuperblocksUtils } from '../superblocks/utils';
import { SuperblocksClient } from '../superblocks/superblocks.client';
import { ManualSignProvider, SuperHDWalletProvider } from '../providers';
import { PusherClient, getPusherKey, getAuthEndpoint } from '../pusher';
import { RpcClient } from '../rpc';

const thirdPartyDependencies = new ContainerModule((bind) => {
    bind<Fetch>(TYPES.Fetch).toConstantValue(fetch.default);
    bind<Pusher>(TYPES.Pusher).toDynamicValue(() => new pusher.default(getPusherKey(), {
        authEndpoint: getAuthEndpoint(),
        cluster: 'eu',
        forceTLS: true
      })
    ).inSingletonScope();
});

const applicationDependencies = new ContainerModule((bind) => {
    bind<IManualSignProvider>(TYPES.ManualSigningProvider).to(ManualSignProvider);
    bind<IHDWalletProvider>(TYPES.HDWalletProvider).to(SuperHDWalletProvider);
    bind<ISuperblocksClient>(TYPES.SuperblocksClient).to(SuperblocksClient).inSingletonScope();
    bind<ISuperblocksUtils>(TYPES.SuperblocksUtils).to(SuperblocksUtils).inSingletonScope();
    bind<IPusherClient>(TYPES.PusherClient).to(PusherClient).inSingletonScope();
    bind<IRpcClient>(TYPES.RpcClient).to(RpcClient).inSingletonScope();
});

const container = new Container();

container.load(thirdPartyDependencies, applicationDependencies);

export { container };
