# super-web3-provider

[![Superblocks](https://superblocks.com/d/superblocks/projects/superblocks-platform.svg?branch=master)](https://superblocks.com/d/superblocks/projects/superblocks-platform) ![npm](https://img.shields.io/npm/v/super-web3-provider?color=blue)

Web3 provider to create a secure channel between our CI runners and the Superblocks platform to handle Smart Contract deployments through our blockchain dedicated CI/CD platform



## Manual Sign Provider
This provider allows you to track and manually securely sign your Txs using Metamask, Ledger or Trezor inside the Superblocks platform. 


## HDWallet Provider (Coming Soon)
A minimal custom HD Ethereum wallet provider based on MetaMask's provider engine library and Truffle's [HDWalletProvider](https://github.com/trufflesuite/truffle/tree/develop/packages/hdwallet-provider) provider package.

### Why using this custom HDWallet provider? 
There are cases in which you might don't care about exposing your private keys through an environmental variable in the CI provider, per example when either deploying to a tesnet or having a throw away deployment key. For all these cases, you can use this provider to sign your transactions locally but still manage to track the deployment through the Superblocks platform. 


