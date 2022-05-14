# 🏗 Scaffold-ETH

```bash
% yarn deploy --network rinkeby
yarn run v1.22.15
$ yarn workspace @scaffold-eth/hardhat deploy --network rinkeby
$ hardhat deploy --export-all ../react-app/src/contracts/hardhat_contracts.json --network rinkeby
Compiling 6 files with 0.8.4
Compilation finished successfully
reusing "GTC" at 0x67775cBe9e73aa255Fc8e6A992Ed340e3b28D926
Sending GTC...
GTC address is 0x67775cBe9e73aa255Fc8e6A992Ed340e3b28D926
deploying "GTCStaking" (tx: 0x39bee34bc21540a102995bf1d329a86112e462d6690486c07e931de780700956)...: deployed at 0x18317de792D372Dc39c5e0c99C70b08bbf27162A with 893568 gas
$ hardhat run scripts/publish.js
✅  Published contracts to the subgraph package.
✨  Done in 72.75s.
```

Local subgraph endpoint:
http://localhost:8000/subgraphs/name/gtc-conviction-subgraph-eth

## Subgraph raw notes

Step 1: Clean up previous data:
yarn clean-graph-node
Step 2: Spin up a local graph node by running
yarn run-graph-node
Step 3: Create your local subgraph by running
yarn graph-create-local
This is only required once!
Step 4: Deploy your local subgraph by running
yarn graph-ship-local
Step 5: Edit your local subgraph in packages/subgraph/src
Learn more about subgraph definition here
Step 6: Deploy your contracts and your subgraph in one go by running:
yarn deploy-and-graph

### Sample GraphQL Queries

```graphql
query getVoterById {
  voter(id: "0x523d007855b3543797e0d3d462cb44b601274819") {
    id
  }
}

query getRunningRecordsByVoterId {
  runningVoteRecords(
    where: { voter: "0x523d007855b3543797e0d3d462cb44b601274819" }
  ) {
    id
    voter {
      id
    }
    votes {
      id
      voteId
    }
    grantId
    voteCount
    totalStaked
    createdAt
    updatedAt
  }
}

query getVotesByVoterId {
  votes(where: { voter: "0x523d007855b3543797e0d3d462cb44b601274819" }) {
    id
    voteId
    voter {
      id
    }
    amount
    grantId
    createdAt
  }
}

query getVotesByGrantId {
  votes(where: { grantId: 2062 }) {
    id
    voteId
    voter {
      id
    }
    amount
    grantId
    createdAt
  }
}

query getRunningRecordsByGrantId {
  runningVoteRecords(where: { grantId: 2062 }) {
    id
    voter {
      id
    }
    grantId
    voteCount
    totalStaked
    createdAt
    updatedAt
  }
}

query getReleasesByVoterId {
  releases(where: { voter: "0x523d007855b3543797e0d3d462cb44b601274819" }) {
    id
    voter {
      id
    }
    voteId
    amount
    createdAt
  }
}

query getReleases {
  releases {
    id
    voter {
      id
    }
    voteId
    amount
    createdAt
  }
}
```

> everything you need to build on Ethereum! 🚀

🧪 Quickly experiment with Solidity using a frontend that adapts to your smart contract:

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd scaffold-eth
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd scaffold-eth
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)

# 🍦 Other Flavors

- [scaffold-eth-typescript](https://github.com/scaffold-eth/scaffold-eth-typescript)
- [scaffold-nextjs](https://github.com/scaffold-eth/scaffold-eth/tree/scaffold-nextjs)
- [scaffold-chakra](https://github.com/scaffold-eth/scaffold-eth/tree/chakra-ui)
- [eth-hooks](https://github.com/scaffold-eth/eth-hooks)
- [eth-components](https://github.com/scaffold-eth/eth-components)
- [scaffold-eth-expo](https://github.com/scaffold-eth/scaffold-eth-expo)

# 🔭 Learning Solidity

📕 Read the docs: https://docs.soliditylang.org

📚 Go through each topic from [solidity by example](https://solidity-by-example.org) editing `YourContract.sol` in **🏗 scaffold-eth**

- [Primitive Data Types](https://solidity-by-example.org/primitives/)
- [Mappings](https://solidity-by-example.org/mapping/)
- [Structs](https://solidity-by-example.org/structs/)
- [Modifiers](https://solidity-by-example.org/function-modifier/)
- [Events](https://solidity-by-example.org/events/)
- [Inheritance](https://solidity-by-example.org/inheritance/)
- [Payable](https://solidity-by-example.org/payable/)
- [Fallback](https://solidity-by-example.org/fallback/)

📧 Learn the [Solidity globals and units](https://docs.soliditylang.org/en/latest/units-and-global-variables.html)

# 🛠 Buidl

Check out all the [active branches](https://github.com/scaffold-eth/scaffold-eth/branches/active), [open issues](https://github.com/scaffold-eth/scaffold-eth/issues), and join/fund the 🏰 [BuidlGuidl](https://BuidlGuidl.com)!

- 🚤 [Follow the full Ethereum Speed Run](https://medium.com/@austin_48503/%EF%B8%8Fethereum-dev-speed-run-bd72bcba6a4c)

- 🎟 [Create your first NFT](https://github.com/scaffold-eth/scaffold-eth/tree/simple-nft-example)
- 🥩 [Build a staking smart contract](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-1-decentralized-staking)
- 🏵 [Deploy a token and vendor](https://github.com/scaffold-eth/scaffold-eth/tree/challenge-2-token-vendor)
- 🎫 [Extend the NFT example to make a "buyer mints" marketplace](https://github.com/scaffold-eth/scaffold-eth/tree/buyer-mints-nft)
- 🎲 [Learn about commit/reveal](https://github.com/scaffold-eth/scaffold-eth-examples/tree/commit-reveal-with-frontend)
- ✍️ [Learn how ecrecover works](https://github.com/scaffold-eth/scaffold-eth-examples/tree/signature-recover)
- 👩‍👩‍👧‍👧 [Build a multi-sig that uses off-chain signatures](https://github.com/scaffold-eth/scaffold-eth/tree/meta-multi-sig)
- ⏳ [Extend the multi-sig to stream ETH](https://github.com/scaffold-eth/scaffold-eth/tree/streaming-meta-multi-sig)
- ⚖️ [Learn how a simple DEX works](https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90)
- 🦍 [Ape into learning!](https://github.com/scaffold-eth/scaffold-eth/tree/aave-ape)

# 💌 P.S.

🌍 You need an RPC key for testnets and production deployments, create an [Alchemy](https://www.alchemy.com/) account and replace the value of `ALCHEMY_KEY = xxx` in `packages/react-app/src/constants.js` with your new key.

📣 Make sure you update the `InfuraID` before you go to production. Huge thanks to [Infura](https://infura.io/) for our special account that fields 7m req/day!

# 🏃💨 Speedrun Ethereum

Register as a builder [here](https://speedrunethereum.com) and start on some of the challenges and build a portfolio.

# 💬 Support Chat

Join the telegram [support chat 💬](https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA) to ask questions and find others building with 🏗 scaffold-eth!

---

🙏 Please check out our [Gitcoin grant](https://gitcoin.co/grants/2851/scaffold-eth) too!

### Automated with Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#github.com/scaffold-eth/scaffold-eth)
