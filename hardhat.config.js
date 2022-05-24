// require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");

require("@nomiclabs/hardhat-etherscan");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require("dotenv").config();
//  require("@nomiclabs/hardhat-ethers");
 require("@nomiclabs/hardhat-web3");
 require("@nomiclabs/hardhat-solhint");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.10",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    local: {
      url: 'http://localhost:8545/',
      accounts: [
        `0x${process.env.PRIVKEY_DEPLOYER}`,
        `0x${process.env.PRIVKEY_USER_A}`,
        `0x${process.env.PRIVKEY_USER_B}`,
      ]
    },
    testnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
      accounts: [
        `0x${process.env.PRIVKEY_DEPLOYER}`,
        `0x${process.env.PRIVKEY_USER_A}`,
        `0x${process.env.PRIVKEY_USER_B}`,
      ]
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://bscscan.com/
    apiKey: `${process.env.ETHERSCAN}`
  },
};
