import { Container, ContainerModule } from 'inversify';
import * as fetch from 'node-fetch';
import * as pusher from 'pusher-js';
import { TYPES } from './types';
import { Fetch, Pusher, IManualSignProvider, ISuperblocksUtils, ISuperblocksClient, IPusherClient } from './interfaces';
import { SuperblocksUtils } from '../superblocks/utils';
import { SuperblocksClient } from '../superblocks/superblocks.client';
import { InternalManualSignProvider } from '..';
import { PusherClient } from '../pusher';

const thirdPartyDependencies = new ContainerModule((bind) => {
    bind<Fetch>(TYPES.Fetch).toConstantValue(fetch.default);
    bind<Pusher>(TYPES.Pusher).toConstantValue(new pusher.default('757837ef865906fabbe5', {
        cluster: 'eu',
        forceTLS: true
      })
    );
});

const applicationDependencies = new ContainerModule((bind) => {
    bind<IManualSignProvider>(TYPES.InternalManualProvider).to(InternalManualSignProvider);
    bind<ISuperblocksClient>(TYPES.SuperblocksClient).to(SuperblocksClient).inSingletonScope();
    bind<ISuperblocksUtils>(TYPES.SuperblocksUtils).to(SuperblocksUtils).inSingletonScope();
    bind<IPusherClient>(TYPES.PusherClient).to(PusherClient).inSingletonScope();
});

const container = new Container();

container.load(thirdPartyDependencies, applicationDependencies);

export { container };
