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

import 'reflect-metadata';
import * as assert from 'assert';
import * as sinon from 'ts-sinon';
import { IPusherClient, IEventResponse, Pusher } from '../ioc/interfaces';
import { TYPES } from '../ioc/types';
import { container } from '../ioc/ioc.config';
import { EventCallback } from 'pusher-js';

let pusherClient: IPusherClient;

// Create the necessary mocks to cover func dependencies
// const mockChannel = sinon.stubInterface<Pusher.Channel>({
//     bind(_eventName: string, callback: EventCallback, context?: any): any => {
//         console.log('PUTTAAAAA');
//         callback(context, 'Some Data');
//         return mockChannel;
//     })
// });
// const mockChannel = Partial<Pusher.Channel> {
//     bind: (_eventName: string, callback: EventCallback, context?: any): any => {
//         callback(context, 'Some Data');
//     }
// };

const mockChannel = <Pusher.Channel> {
    bind(_eventName: string, callback: EventCallback, context?: any): any {
        callback(context, 'Some Data');
    },

    unbind(_eventName: string, callback: EventCallback, context?: any): any {
        callback(context, 'Some Data');
    },
};

const mockPusher = <Pusher.Pusher> {
    subscribe: (_channelName: string) => {
        return mockChannel;
    }
};

describe('PusherClient: Test connectToPusher', () => {
    beforeEach(() => {
        // create a snapshot so each unit test can modify
        // it without breaking other unit tests
        container.snapshot();
    });

    afterEach(() => {

        // Restore to last snapshot so each unit test
        // takes a clean copy of the application container
        container.restore();
    });

    it.skip('fails to create valid Pusher object due to bad identification key', () => {
        // TODO
    });

    it.skip('fails to create valid Pusher object due to wrong cluster setting', () => {
        // TODO
    });
});

describe('PusherClient: Test subscribeToChannel', () => {

    beforeEach(() => {
        container.snapshot();

        container.rebind<Pusher>(TYPES.Pusher).toConstantValue(mockPusher);
        pusherClient = container.get<IPusherClient>(TYPES.PusherClient);
    });

    afterEach(() => {

        // Restore to last snapshot so each unit test
        // takes a clean copy of the application container
        container.restore();
    });

    it.skip('checks subscribed channels data is empty at the start', () => {
        // TODO
    });

    it('subscribes to channel', (done) => {
        assert.doesNotThrow(() => {
            pusherClient.subscribeToChannel('test-channel', ['test_event'],
                (eventResponse: IEventResponse) => {
                    assert.deepStrictEqual(eventResponse.eventName, 'test_event');
                    assert.deepStrictEqual(eventResponse.message, undefined);
                    done();
                }
            );
        });
    });

    it.skip('successfully unsubscribes before overwriting existing channelName in subscribedChannels', () => {
        // TODO
    });

    it.skip('checks subscribedChannels changes after successful subscription', () => {
        // TODO
    });

    it.skip('checks subscribedChannels remains unchanged after subscription failure', () => {
        // TODO
    });

    it('checks subscriptions only map to specified entry in eventNames', (done) => {
        // Lets clear take a clean copy of the application container
        container.restore();
        container.snapshot();

        // Keep track of calls to channel bind method
        let bindCount = 0;
        const modifiedMockChannel = <Pusher.Channel> {
            bind(_eventName: string, callback: EventCallback, context?: any): any {
                bindCount++;
                callback(context, 'Some Data');
            },
        };

        const modifiedMockPusher = <Pusher.Pusher> {
            subscribe: (_channelName: string) => {
                return modifiedMockChannel;
            }
        };

        container.rebind<Pusher>(TYPES.Pusher).toConstantValue(modifiedMockPusher);
        pusherClient = container.get<IPusherClient>(TYPES.PusherClient);

        let currentBindCount = 0;
        assert.doesNotThrow(() => {
            pusherClient.subscribeToChannel('test-channel', ['entry'],
                (eventResponse: IEventResponse) => {
                    currentBindCount++;
                    console.log(currentBindCount);
                    console.log(bindCount);
                    assert.notDeepStrictEqual(eventResponse, undefined);
                    assert.deepStrictEqual(currentBindCount, bindCount);
                    done();
                }
            );
        });
    });

    it.skip('checks subscriptions do not link to unspecified eventNames', () => {
        // TODO
    });

    it.skip('fails to subscribe to channel without binding to any event', () => {
        // TODO
    });
});

describe('PusherClient: Test unsubscribeFromChannel', () => {
    beforeEach(() => {
        container.snapshot();

        container.rebind<Pusher>(TYPES.Pusher).toConstantValue(mockPusher);
        pusherClient = container.get<IPusherClient>(TYPES.PusherClient);
    });

    afterEach(() => {

        // Restore to last snapshot so each unit test
        // takes a clean copy of the application container
        container.restore();
    });

    it('successfully unsubscribes from previously subscribed channelName', (done) => {
        assert.doesNotThrow( () => {
            pusherClient.subscribeToChannel('test-channel', ['test_event'],
                (eventResponse: IEventResponse) => {
                    assert.deepStrictEqual(eventResponse.eventName, 'test_event');
                    assert.deepStrictEqual(eventResponse.message, undefined);
                    done();
                }
            );
        });

        const spy = sinon.default.spy(mockChannel, 'unbind');
        sinon.default.assert.calledOnce(spy);

        assert.doesNotThrow( () => {
            pusherClient.unsubscribeFromChannel('test-channel');
        });
    });

    it.skip('checks subscribedChannels gets empty after un subscription', () => {
        // TODO
    });

    it('tries to unsubscribe from unknown channelName', () => {
        assert.doesNotThrow( () => {
            pusherClient.unsubscribeFromChannel('test-channel');
        });
    });
});
