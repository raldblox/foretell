require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: false,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    etherlinkMainnet: {
      url: "https://node.mainnet.etherlink.com",
      accounts: [process.env.WALLET_PRIVATE_KEY],
    },
    etherlinkTestnet: {
      url: "https://node.ghostnet.etherlink.com",
      accounts: [process.env.WALLET_PRIVATE_KEY],
    },
    coreTestnet: {
      url: "https://rpc.test2.btcs.network",
      accounts: [process.env.WALLET_PRIVATE_KEY],
      chainId: 1114,
    },
    seiTestnet: {
      url: "https://evm-rpc-testnet.sei-apis.com",
      accounts: [process.env.WALLET_PRIVATE_KEY],
      chainId: 1328,
    },
  },

  etherscan: {
    apiKey: {
      etherlinkMainnet: "abc",
      etherlinkTestnet: "abc",
      coreTestnet: "abc",
    },
    customChains: [
      {
        network: "etherlinkMainnet",
        chainId: 42793,
        urls: {
          apiURL: "https://explorer.etherlink.com/api",
          browserURL: "https://explorer.etherlink.com",
        },
      },
      {
        network: "etherlinkTestnet",
        chainId: 128123,
        urls: {
          apiURL: "https://testnet.explorer.etherlink.com/api",
          browserURL: "https://testnet.explorer.etherlink.com",
        },
      },
      {
        network: "coreTestnet",
        chainId: 1114,
        urls: {
          apiURL: "https://scan.test2.btcs.network",
          browserURL: "https://scan.test.btcs.network/",
        },
      },
      {
        network: "coreMainnet",
        chainId: 1115,
        urls: {
          apiURL: "https://rpc.coredao.org",
          browserURL: "https://scan.coredao.org",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};
