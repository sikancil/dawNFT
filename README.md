# Assessments

1) Create an ERC721 contract, which can allow users to mint 1 NFT at a given time, provided they pay a minimum price of 0.01 in ETH.
2) Create a second ERC721 contract, which can allow users to mint an NFT, provided they transfer the NFT from the first contract above to the second contract (which escrows the token). 
3) At a later stage, the user can swap back the second NFT back for the first one.Assume that price is zero for the swap functionality.
4) Finally, deploy all contracts following best practices of Solidity, keeping upgradability and reusability in mind.


# Prequisites

Current project implement 3 different accounts for testing purposes, such as:
1) **Deployer**: Account responsible to deploy both Smart contracts for ERC-721 compliant token *(Case #1)*, and Custom ERC-721 act as Escrow *(Case #2)*.
2) **UserA**: Account responsible to test mint, do escrow and swap (withdraw; *Case #3*) functionality.
3) **UserB**: Same responsible like UserA, also including access violations test.


## Test
### Local Network (Fork Testnet | Terminal #1) – Optional
```shell
$ npm run fork:testnet

> dawnft@1.0.0 fork:test
...
```

### Local Test (Terminal #2)
```shell
$ npm run test

> dawnft@1.0.0 test
> npx hardhat test
...
```

## Deployment
### Local Network (Fork Testnet | Terminal #1) – Optional
```shell
$ npm run fork:testnet

> dawnft@1.0.0 fork:test
...
```

### Local (Without Fork chain | Terminal #2)
```shell
$ npm run deploy

> dawnft@1.0.0 deploy
> npx hardhat run scripts/0_deployment.js
...
```

### Local (On Fork chain | Terminal #2)
```shell
$ npm run deploy:fork

> dawnft@1.0.0 deploy:fork
> npx hardhat run scripts/0_deployment.js --network local
...
```


### Public (To TestNet chain | Terminal #2) – *Case #4*
```shell
$ npm run deploy:testnet

> dawnft@1.0.0 deploy:testnet
> npx hardhat run scripts/0_deployment.js --network testnet

ℹ️  INFO      Accounts:
💬  LOG       • Deployer:  0x0B2641B0Ee501F219450A5E252bd4fF40c987777 0.35 ETH
💬  LOG       • User A:    0x367C1371E99d9e60f3786f1CECD08c8Ea1C68888 0.1 ETH
💬  LOG       • User B:    0x2f2f9B51af90dc127869d695d04c3a7723Bb9999 0.1 ETH

ℹ️  INFO      D4W NFT deployed   : 0xb10373155880aB011F99292d50C000163f3A08aF
💬  LOG       -- Owner     0x0B2641B0Ee501F219450A5E252bd4fF40c987777
ℹ️  INFO      D4W Escrow deployed: 0xa0590e137bcF280eDcB9014fbD31EDc252c88535
💬  LOG       -- Owner     0x0B2641B0Ee501F219450A5E252bd4fF40c987777

ℹ️  INFO      Minted NFT id: 1, to: 0x367C1371E99d9e60f3786f1CECD08c8Ea1C68888
📍  DEBUG     { deployer: [], userA: [ '1' ], userB: [] }
ℹ️  INFO      Owner of NFT id: 1 is 0x367C1371E99d9e60f3786f1CECD08c8Ea1C68888

ℹ️  INFO      Minted NFT id: 2, to: 0x2f2f9B51af90dc127869d695d04c3a7723Bb9999
📍  DEBUG     { deployer: [], userA: [ '1' ], userB: [ '2' ] }
ℹ️  INFO      Owner of NFT id: 2 is 0x2f2f9B51af90dc127869d695d04c3a7723Bb9999

ℹ️  INFO      First Recap:
💬  LOG       User A's NFTs: 1
💬  LOG       User B's NFTs: 1
💬  LOG       Escrow NFTs: 0

ℹ️  INFO      Approval NFT owner: 0x367C1371E99d9e60f3786f1CECD08c8Ea1C68888
💬  LOG                      to: 0xa0590e137bcF280eDcB9014fbD31EDc252c88535
💬  LOG                token id: 1

ℹ️  INFO      Approval NFT owner: 0x2f2f9B51af90dc127869d695d04c3a7723Bb9999
💬  LOG                      to: 0xa0590e137bcF280eDcB9014fbD31EDc252c88535
💬  LOG                token id: 2

ℹ️  INFO      Escrow NFT id: 1, escrow: 1

ℹ️  INFO      Escrow NFT id: 2, escrow: 2

ℹ️  INFO      Second Recap:
💬  LOG       User A's NFTs: 0
💬  LOG       User B's NFTs: 0
💬  LOG       Escrow NFTs: 2
💬  LOG       User_A's escrow info: { nftId: '1', escrowId: '1' }
💬  LOG       User_B's escrow info: { nftId: '2', escrowId: '2' }

ℹ️  INFO      Withdraw NFT id: 1, escrow: 1

ℹ️  INFO      Withdraw NFT id: 2, escrow: 2

ℹ️  INFO      Final Recap:
💬  LOG       User A's NFTs: 1
💬  LOG       User B's NFTs: 1
💬  LOG       Escrow NFTs: 0
💬  LOG       User_A's escrow info: [ <1 empty item> ]
💬  LOG       User_B's escrow info: [ <1 empty item> ]
```

Deployment on TestNet availabale at https://testnet.bscscan.com/

**ERC-721**: Successfully verified contract D4WNFT on Bscscan.
https://testnet.bscscan.com/address/0xb10373155880aB011F99292d50C000163f3A08aF#code


**ERC-721 (w/ Escrow)**: Successfully verified contract D4WEscrow on Bscscan.
https://testnet.bscscan.com/address/0xa0590e137bcF280eDcB9014fbD31EDc252c88535#code