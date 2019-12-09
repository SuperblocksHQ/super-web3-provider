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

import { IEventResponse } from './pusher.client';
import pusherClient = require('./pusher.client');
import Pusher, { Channel, EventCallback } from 'pusher-js';
import * as assert from 'assert';

// Mock Channel class used by Pusher
class ChannelMock implements Channel{
    name: string;
    pusher: Pusher.Pusher;
    subscribed: boolean;

    emit(eventName: string, data?: any): any {
        (eventName);
        (data);
    }

    authorize(socketId : string, callback : Function) {
        (socketId);
        callback();
    }

    trigger(event : string, data : any): boolean {
        (event);
        (data);
        return false;
    }

    bind(eventName: string, callback: EventCallback, context?: any): any {
        (eventName);
        callback(context, null);
    }

    unbind(eventName?: string, callback?: Function, context?: any): any {
        (eventName);
        (context);
        (callback);
    }

    bind_global(callback: Function): any {
        callback();
    }

    unbind_global(callback?: Function): any {
        (callback);
    }

    unbind_all(callback?: Function): any {
        (callback);
    }
};

// Mock Pusher client class
class PusherMock extends Pusher{
    subscribe(channelName: string): Channel {
        (channelName);
        return new ChannelMock();
    }
};

describe('connectToPusher', () => {
    beforeEach(() => {
        // Reset reference to original condition to disallow access
        // to potentially valid connection outside the test scope
        if(pusherClient.pusher) {
            pusherClient.pusher.disconnect();
            pusherClient.pusher = undefined;
        }
    });

    it('successfully instantiates a new connection object', () => {
        assert.deepStrictEqual(pusherClient.pusher, undefined);
        assert.doesNotThrow( () => {
            pusherClient.connectToPusher();
        });
        assert.notDeepStrictEqual(pusherClient.pusher, undefined);
    });

    it.skip('fails to create valid Pusher object due to bad identification key', () => {
    });

    it.skip('fails to create valid Pusher object due to wrong cluster setting', () => {
    });
});

describe('subscribeToChannel', () => {
    beforeEach(() => {
        // Reset reference to original condition to disallow access
        // to potentially valid connection outside the test scope
        if(pusherClient.pusher) {
            pusherClient.pusher.disconnect();
            pusherClient.pusher = undefined;
        }

        assert.deepStrictEqual(pusherClient.pusher, undefined);
        pusherClient.pusher = new PusherMock('test-subscribe');
        assert.notDeepStrictEqual(pusherClient.pusher, undefined);
    });

    it.skip('checks subscribed channels data is empty at the start', () => {
    });

    it('fails to subscribe to channel due to disconnected pusher object', () => {
        // Disconnect and unset pusher reference before proceeding
        if(pusherClient.pusher) {
            pusherClient.pusher.disconnect();
            pusherClient.pusher = undefined;
        }

        assert.throws( () => {
            pusherClient.subscribeToChannel('test-fail-to-subscribe-channel', ['test-fail-to-subscribe-event'], (eventResponse: IEventResponse) => {
                assert.fail('fail to subscribe callback: ', eventResponse);
            });
        }, {
            name: 'TypeError',
            message: 'Cannot read property \'subscribe\' of undefined'
        });
    });

    it('subscribes to channel', (done) => {
        assert.doesNotThrow( () => {
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
    });

    it.skip('checks subscribedChannels changes after successful subscription', () => {
    });

    it.skip('checks subscribedChannels remains unchanged after subscription failure', () => {
    });

    it('checks subscriptions only map to specified entry in eventNames', (done) => {
        // Keep track of calls to channel bind method
        let bindCount = 0;

        // Modify Channel class used by Pusher to keep track of calls to bind method
        class ChannelMockModifiedBind extends ChannelMock {
            bind(eventName: string, callback: EventCallback, context?: any): any {
                (eventName);
                bindCount++;
                callback(context, null);
            }
        }

        // Modify Pusher client to use the modified Channel class
        class PusherMockModifiedBind extends PusherMock {
            subscribe(channelName: string): Channel {
                (channelName);
                return new ChannelMockModifiedBind();
            }
        };

        pusherClient.pusher = new PusherMockModifiedBind('test-map-entry');
        assert.notDeepStrictEqual(pusherClient.pusher, undefined);

        let currentBindCount = 0;
        assert.doesNotThrow( () => {
            pusherClient.subscribeToChannel('test-channel', ['entry'],
                (eventResponse: IEventResponse) => {
                    currentBindCount++;
                    assert.notDeepStrictEqual(eventResponse, undefined);
                    assert.deepStrictEqual(currentBindCount, bindCount);
                    done();
                }
            );
        });
    });

    it.skip('checks subscriptions do not link to unspecified eventNames', () => {
    });

    it.skip('fails to subscribe to channel without binding to any event', () => {
    });
});

describe('unsubscribeFromChannel', () => {
    beforeEach( () => {
        // Reset reference to original condition to disallow access
        // to potentially valid connection outside the test scope
        if(pusherClient.pusher) {
            pusherClient.pusher.disconnect();
            pusherClient.pusher = undefined;
        }

        assert.deepStrictEqual(pusherClient.pusher, undefined);
        pusherClient.pusher = new PusherMock('test-unsubscribe');
        assert.notDeepStrictEqual(pusherClient.pusher, undefined);
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

        assert.doesNotThrow( () => {
            pusherClient.unsubscribeFromChannel('test-channel');
        });
    });

    it.skip('checks subscribedChannels gets empty after unsubscription', () => {
    });

    it('tries to unsubscribe from unknown channelName', () => {
        assert.doesNotThrow( () => {
            pusherClient.unsubscribeFromChannel('test-channel');
        });
    });
});
