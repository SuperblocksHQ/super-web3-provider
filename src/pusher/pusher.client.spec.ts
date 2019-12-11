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
import * as sinon from 'ts-sinon';
import * as assert from 'assert';
import { IPusherClient, IEventResponse, Pusher } from '../ioc/interfaces';
import { TYPES } from '../ioc/types';
// import { Container, ContainerModule } from 'inversify';
// import { PusherClient } from './pusher.client';
// import { Channel } from 'pusher-js';
import { container } from '../ioc/ioc.config';

// Mock Channel class used by Pusher
// class ChannelMock implements Channel {
//     name: string;
//     pusher: Pusher.Pusher;
//     subscribed: boolean;

//     emit(eventName: string, data?: any): any {
//         (eventName);
//         (data);
//     }

//     authorize(socketId : string, callback: Function) {
//         (socketId);
//         callback();
//     }

//     trigger(event : string, data : any): boolean {
//         (event);
//         (data);
//         return false;
//     }

//     bind(eventName: string, callback: EventCallback, context?: any): any {
//         (eventName);
//         callback(context, null);
//     }

//     unbind(eventName?: string, callback?: Function, context?: any): any {
//         (eventName);
//         (context);
//         (callback);
//     }

//     bind_global(callback: Function): any {
//         callback();
//     }

//     unbind_global(callback?: Function): any {
//         (callback);
//     }

//     unbind_all(callback?: Function): any {
//         (callback);
//     }
// }

// // Mock Pusher client class
// class PusherMock extends Pusher{
//     subscribe(channelName: string): Channel {
//         (channelName);
//         return new ChannelMock();
//     }
// };

// let mockChannel: Channel;

// let mockPusher: Pusher.Pusher;

let pusherClient: IPusherClient;

// // Create the necessary mocks to cover func dependencies
// mockChannel = sinon.stubInterface<Pusher.Channel>({
//     bind(_eventName: string, callback: EventCallback, context?: any): any {
//         callback(context, 'Some Data');
//     },
// });
// mockPusher = sinon.stubInterface<Pusher.Pusher>({ subscribe: (_channelName: string) => {
//     console.log('patata');
//     return mockChannel;
// }});

// // Setup all DI to satisfy the test suite dependencies
// let container = new Container();
// let thirdPartyDependencies = new ContainerModule((bind) => {
//     bind<Pusher>(TYPES.Pusher).toConstantValue(mockPusher);
// });

// let applicationDependencies = new ContainerModule((bind) => {
//     bind<IPusherClient>(TYPES.PusherClient).to(PusherClient).inSingletonScope();
// });

// container.load(thirdPartyDependencies, applicationDependencies);

describe('connectToPusher', () => {
    const pusher = container.get<Pusher>(TYPES.Pusher);
    let subscribeStub = sinon.stubInterface<Pusher>();

    beforeEach(() => {
        // subscribeStub = sinon.stubInterface<Pusher>({
        //     subscribe: () => console.log('patata')
        // });
        subscribeStub = sinon.stubInterface<Pusher>(pusher);
        subscribeStub.subscribe.returns(() => console.log('patata'));
        pusherClient = container.get<IPusherClient>(TYPES.PusherClient);
    });

    it.skip('fails to create valid Pusher object due to bad identification key', () => {
        // TODO
    });

    it.skip('fails to create valid Pusher object due to wrong cluster setting', () => {
        // TODO
    });
});

describe('subscribeToChannel', () => {
    beforeEach(() => {
        pusherClient = container.get<IPusherClient>(TYPES.PusherClient);
    });

    it.skip('checks subscribed channels data is empty at the start', () => {
        // TODO
    });

    it('fails to subscribe to channel due to disconnected pusher object', () => {
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
        // TODO
    });

    it.skip('checks subscribedChannels changes after successful subscription', () => {
        // TODO
    });

    it.skip('checks subscribedChannels remains unchanged after subscription failure', () => {
        // TODO
    });

    it('checks subscriptions only map to specified entry in eventNames', (_done) => {
        // Keep track of calls to channel bind method
        // let bindCount = 0;

        // mockChannel = sinon.stubInterface<Pusher.Channel>({ bind: () => { bindCount++; }});
        // const modifiedMockPusher = sinon.stubInterface<Pusher.Pusher>({ subscribe: mockChannel });

        // container = new Container();
        // thirdPartyDependencies = new ContainerModule((bind) => {
        //     bind<Pusher>(TYPES.Pusher).toConstantValue(modifiedMockPusher);
        // });

        // applicationDependencies = new ContainerModule((bind) => {
        //     bind<IPusherClient>(TYPES.PusherClient).to(PusherClient).inSingletonScope();
        // });

        // container.load(thirdPartyDependencies, applicationDependencies);
        // pusherClient = container.get<IPusherClient>(TYPES.PusherClient);

        // let currentBindCount = 0;
        // assert.doesNotThrow( () => {
        //     pusherClient.subscribeToChannel('test-channel', ['entry'],
        //         (eventResponse: IEventResponse) => {
        //             currentBindCount++;
        //             assert.notDeepStrictEqual(eventResponse, undefined);
        //             console.log(bindCount + '\n\n\n\n\n\n\n\n\n\n\n\n\n');
        //             assert.deepStrictEqual(currentBindCount, bindCount);
        //             done();
        //         }
        //     );
        // });
    });

    it.skip('checks subscriptions do not link to unspecified eventNames', () => {
        // TODO
    });

    it.skip('fails to subscribe to channel without binding to any event', () => {
        // TODO
    });
});

describe('unsubscribeFromChannel', () => {
    beforeEach(() => {
        pusherClient = container.get<IPusherClient>(TYPES.PusherClient);
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

    it.skip('checks subscribedChannels gets empty after un subscription', () => {
        // TODO
    });

    it('tries to unsubscribe from unknown channelName', () => {
        assert.doesNotThrow( () => {
            pusherClient.unsubscribeFromChannel('test-channel');
        });
    });
});


// // Modify Channel class used by Pusher to keep track of calls to bind method
        // class ChannelMockModifiedBind extends ChannelMock {
        //     bind(eventName: string, callback: EventCallback, context?: any): any {
        //         (eventName);
        //         bindCount++;
        //         callback(context, null);
        //     }
        // }

        // // Modify Pusher client to use the modified Channel class
        // class PusherMockModifiedBind extends PusherMock {
        //     subscribe(channelName: string): Channel {
        //         (channelName);
        //         return new ChannelMockModifiedBind();
        //     }
        // };