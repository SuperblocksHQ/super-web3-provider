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

import Pusher, { Channel } from 'pusher-js';


export interface IEventResponse {
  eventName: string;
  message: any;
}

export let pusher: Pusher.Pusher;

export function connectToPusher() {
    pusher = new Pusher('757837ef865906fabbe5', {
        cluster: 'eu',
        forceTLS: true
      });

    console.log(`[Pusher Service] Connected to Pusher`);
}

const subscribedChannels: { [name: string]: Channel } = {};

export function subscribeToChannel(channelName: string, eventNames: [string], callback: (eventResponse: IEventResponse) => any) {
  const channel = pusher.subscribe(channelName);

  // Add the channel to the subscribed hash
  subscribedChannels[channelName] = channel;

  eventNames.map((name: string) => {
      channel.bind(name, (data) => {
          callback({
            eventName: name,
            message: data
          });
      });
  });
}

export function unsubscribeFromChannel(channelName: string) {
  const channel = subscribedChannels[channelName];
  if (channel) {
    channel.unbind();
  }
}
