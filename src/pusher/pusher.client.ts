// Copyright 2019 Superblocks AB
//
// This file is part of Superblocks.
//
// Superblocks is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation version 3 of the License.
//
// Superblocks is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Superblocks.  If not, see <http://www.gnu.org/licenses/>.

import { Channel } from 'pusher-js';
import { injectable, inject } from 'inversify';
import { Pusher, IPusherClient, IEventResponse } from '../ioc/interfaces';
import { TYPES } from '../ioc/types';

@injectable()
export class PusherClient implements IPusherClient {
  private pusher: Pusher.Pusher;
  private subscribedChannels: { [name: string]: Channel } = {};

  public constructor(
      @inject(TYPES.Pusher) pusher: Pusher,
  ) {
      this.pusher = pusher;
      console.log(`[Pusher Service] Connected to Pusher`);
  }

  public subscribeToChannel(channelName: string, eventNames: [string], callback: (eventResponse: IEventResponse) => any) {
    const channel = this.pusher.subscribe(channelName);

    // Add the channel to the subscribed hash
    this.subscribedChannels[channelName] = channel;

    eventNames.map((name: string) => {
        channel.bind(name, (data: any) => {
            callback({
              eventName: name,
              message: data
            });
        });
    });
  }

  public unsubscribeFromChannel(channelName: string) {
    const channel = this.subscribedChannels[channelName];
    if (channel) {
      channel.unbind();
    }
  }
}
