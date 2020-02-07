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

import { injectable } from 'inversify';
import { ISuperblocksUtils } from '../ioc/interfaces';
import { ICustomMetadataModel, IMetadataModel } from './models';

@injectable()
export class SuperblocksUtils implements ISuperblocksUtils {
    getApiBaseUrl(): string {
        if (process.env.LOCAL) {
            return 'http://localhost:2999/v1';
        } else if (process.env.DEVELOP) {
            return `https://api-dev.superblocks.com/v1`;
        } else {
            return `https://api.superblocks.com/v1`;
        }
    }

    networkIdToName(networkId: string): string {
        switch (networkId) {
            case '1':
                return 'Mainnet';
            case '3':
                return 'Ropsten';
            case '4':
                return 'Rinkeby';
            case '5':
                return 'Görli';
            case '42':
                return 'Kovan';
            default:
                return networkId;
    }
    }

    createDefaultMetadata(metadata: ICustomMetadataModel, ciJobId: string): IMetadataModel {
        const { jobId, jobURL, description, hash, branch, branchUrl, commitUrl } = metadata || {};
        const { env } = process;

        // env variables from metadata object, Superblocks, Circle CI, Travis CI, Gitlab and Jenkins respectively
        return {
            jobId : jobId || env.CIRCLE_WORKFLOW_ID || env.TRAVIS_JOB_ID || env.CI_JOB_ID || env.BUILD_ID,
            jobURL : jobURL || env.CIRCLE_BUILD_URL || env.CI_JOB_URL || env.TRAVIS_JOB_WEB_URL || env.BUILD_URL,
            description : description || env.SUPER_COMMIT_DESCRIPTION || env.CI_COMMIT_MESSAGE || env.TRAVIS_COMMIT_MESSAGE,
            hash : hash || env.SUPER_COMMIT_SHA1 || env.CIRCLE_SHA1 || env.TRAVIS_COMMIT || env.CI_COMMIT_SHA,
            branch : branch || env.SUPER_COMMIT_BRANCH || env.CIRCLE_BRANCH || env.TRAVIS_PULL_REQUEST_BRANCH || env.CI_COMMIT_REF_NAME || env.COMMIT_BRANCH,
            branchUrl : branchUrl || env.SUPER_COMMIT_BRANCH_URL || env.CIRCLE_REPOSITORY_URL || env.CI_REPOSITORY_URL,
            commitUrl : commitUrl || env.SUPER_COMMIT_URL,
            ciJobId,
            buildConfigId : env.SUPER_BUILD_CONFIG_ID,
            superblocks: env.SUPER_CI || 'false'
        };
    }
}

