const path = require("path");
const SuperblocksProvider = require("super-web3-provider").default;
const superProvider = new SuperblocksProvider({ proxyUrl: 'http://localhost:2999/v1/web3-hub/provider' });

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
	ropsten_metamask: {
        provider: () => {
            return superProvider;
        },
        network_id: '3',
    }
  }
};
