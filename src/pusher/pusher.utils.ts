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


 // TODO - All this should be env variables!
export function getPusherKey() {
  if (process.env.LOCAL) {
    return '757837ef865906fabbe5';
  } else if (process.env.DEVELOP) {
    return '1385353d1bf5394b8aae';
  } else {
    return 'e50bb90f8537b80b1906';
  }
}

export function getAuthEndpoint() {
  if (process.env.LOCAL) {
    return 'http://localhost:2999/v1/pusher/auth';
  } else if (process.env.DEVELOP) {
    return 'https://api-dev.superblocks.com/v1/pusher/auth';
  } else {
    return 'https://api.superblocks.com/v1/pusher/auth';
  }
}
