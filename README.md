# Foretell

Foretell is a decentralized application that allows users to create and participate in surveys, with a unique focus on privacy and rewards. It leverages a powerful combination of web3 technologies to provide a seamless and secure user experience.

## Deployments

- [Etherlink Testnet](https://testnet.explorer.etherlink.com/address/0xf1805Bc3F6C8dA9b3D7A69257BA3888F7194fFE7)
- [Core Testnet](https://scan.test2.btcs.network/address/0x4DAb62B27b5310cC9AE11A72d9e39a0B53D85b6D)
- [Sei Testnet](https://seitrace.com/address/0x80Ae7950f790819EF678D20cC4e0710fc18367D9?chain=atlantic-2)

## Tech Stack

Foretell is built on a modern, robust tech stack:

### Frontend & Wallet

- **Sequence SDK:** We use the Sequence SDK to create smart accounts for our users, enabling easy onboarding and interaction with the web3 world. Sequence's non-custodial wallets provide a secure and user-friendly experience.
- **@sequence/checkout:** To further streamline the user experience allowing users to add funds to their wallets using traditional payment methods like credit cards.
- **wagmi/viem:** These powerful libraries provide the foundation for our dApp's interaction with the Ethereum blockchain. `viem` offers a low-level, type-safe interface, while `wagmi` provides a set of convenient React hooks for a seamless developer experience.
- **Next.js:** Our frontend is built with Next.js, a popular React framework that enables server-side rendering and a host of other performance and SEO benefits.

### Backend & Smart Contracts

- **Hardhat:** We use Hardhat for our smart contract development, testing, and deployment. It provides a flexible and extensible environment for building robust and secure smart contracts.
- **MongoDB:** Foretell uses MongoDB as its primary database for storing off-chain data, such as survey details and other information.
- **MerkleTree.js:** We use `merkletreejs` to create Merkle trees for efficient and secure verification of data, such as whitelists for survey participation.

### AI & Machine Learning

- **Google MediaPipe (BERT Classifier):** To analyze and classify textual data from surveys, we use Google's MediaPipe library with a BERT-based text classifier. This allows us to gain valuable insights from the survey responses.

### Decentralized Social Integration

- **Farcaster:** We've integrated Farcaster to enable users to connect their decentralized identity to their Foretell account, further enhancing the web3-native experience.

## Getting Started

To get started with Foretell, you'll need to have Node.js and a package manager (like npm or yarn) installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/foretell.git
    ```
2.  **Install dependencies:**
    ```bash
    cd foretell/foretell-app
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```

This will start the development server on `http://localhost:3000`. You can then access the application in your browser.
