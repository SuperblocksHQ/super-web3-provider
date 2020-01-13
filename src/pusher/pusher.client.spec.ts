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
import { SinonSandbox } from 'sinon';
import { IPusherClient, IEventResponse } from '../ioc/interfaces';
import { EventCallback } from 'pusher-js';
import { PusherClient } from './pusher.client';

let pusherClient: IPusherClient;

const mockChannel = <Pusher.Channel> {
    bind(_eventName: string, callback: EventCallback, context?: any): any {
        callback(context, 'Some Data');
    },

    unbind(_eventName: string, callback: EventCallback, context?: any): any {
        callback(context, 'Some Data');
    },
};

const mockPusher = <Pusher.Pusher> {
    config: {
        auth: {}
    },
    subscribe: (_channelName: string) => {
        return mockChannel;
    }
};

describe('PusherClient:', () => {
    let sandbox: SinonSandbox;

    beforeEach(() => {
        // Remove console logs to make the test results cleaner
        sandbox = sinon.default.createSandbox();
        sandbox.stub(console, 'log');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Test subscribeToChannel', () => {
        beforeEach(() => {
            pusherClient = new PusherClient(mockPusher);
        });

        it('subscribes to channel', (done) => {
            assert.doesNotThrow(() => {
                pusherClient.subscribeToChannel('test-channel', ['test_event'], 'token',
                    (eventResponse: IEventResponse) => {
                        assert.deepStrictEqual(eventResponse.eventName, 'test_event');
                        assert.deepStrictEqual(eventResponse.message, undefined);
                        done();
                    }
                );
            });
        });

        it('checks subscriptions only map to specified entry in eventNames', (done) => {
            // Keep track of calls to channel bind method
            let bindCount = 0;
            const modifiedMockChannel = <Pusher.Channel> {
                bind(_eventName: string, callback: EventCallback, context?: any): any {
                    bindCount++;
                    callback(context, 'Some Data');
                },
            };

            const modifiedMockPusher = <Pusher.Pusher> {
                config: {
                    auth: {}
                },
                subscribe: (_channelName: string) => {
                    return modifiedMockChannel;
                }
            };

            pusherClient = new PusherClient(modifiedMockPusher);

            let currentBindCount = 0;
            assert.doesNotThrow(() => {
                pusherClient.subscribeToChannel('test-channel', ['entry'], 'token',
                    (eventResponse: IEventResponse) => {
                        currentBindCount++;
                        assert.notDeepStrictEqual(eventResponse, undefined);
                        assert.deepStrictEqual(currentBindCount, bindCount);
                        done();
                    }
                );
            });
        });
    });

    describe('Test unsubscribeFromChannel', () => {
        beforeEach(() => {
            pusherClient = new PusherClient(mockPusher);
        });

        it('successfully unsubscribes from previously subscribed channelName', (done) => {
            assert.doesNotThrow( () => {
                pusherClient.subscribeToChannel('test-channel', ['test_event'], 'token',
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

        it('tries to unsubscribe from unknown channelName', () => {
            assert.doesNotThrow( () => {
                pusherClient.unsubscribeFromChannel('test-channel-unknown');
            });
        });
    });

});
