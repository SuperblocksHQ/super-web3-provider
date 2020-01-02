# super-web3-provider

[![Superblocks](https://superblocks.com/d/superblocks/projects/superblocks-platform.svg?branch=master)](https://superblocks.com/d/superblocks/projects/superblocks-platform) ![npm](https://img.shields.io/npm/v/super-web3-provider?color=blue)

Web3 provider to create a secure channel between our CI runners and the Superblocks platform to handle Smart Contract deployments through our blockchain dedicated CI/CD platform


### How to create new version

1. Do changes in code
2. Update package.json *version* field to new version (using [semver](https://semver.org/) notation)
    2.a. In case this is beta version of the package then format is *"x.y.z-beta.n"*, where *x, y, z, n* - numbers. Beta version is published with "beta" tag in npm (thus it won't be automatically installed as "latest")
    2.b. In order to publish "latest" version - just use *"x.y.z"* format for *version* field.
3. Push the code to master branch
4. Create a tag with version as in package.json and add some release description
5. Gitlab will trigger a job which will push new version to NPM
