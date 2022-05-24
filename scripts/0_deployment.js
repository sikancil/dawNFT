// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// const hre = require("hardhat");

const { log, toReadable } = require("../test/helpers/utils");

// Initialize & Deployment
async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [ deployer, userA, userB ] = await web3.eth.getAccounts();

  log.info("Accounts:");
  log.log ("• Deployer: ", deployer, web3.utils.fromWei((await web3.eth.getBalance(deployer)), 'ether'), 'ETH');
  log.log ("• User A:   ", userA, web3.utils.fromWei((await web3.eth.getBalance(userA)), 'ether'), 'ETH');
  log.log ("• User B:   ", userB, web3.utils.fromWei((await web3.eth.getBalance(userB)), 'ether'), 'ETH');

  // We get the contract to deploy
  const D4WNFT = artifacts.require("D4WNFT");
  const D4WEscrow = artifacts.require("D4WEscrow");
  
  const dawNFT = await D4WNFT.new({ from: deployer });

  console.log();
  log.info("D4W NFT deployed   :", dawNFT.address);
  const ownerNFT = await dawNFT.owner();
  log.log ("-- Owner    ", ownerNFT);
  
  const dawEscrow = await D4WEscrow.new(
    dawNFT.address,

    { from: deployer }
  );

  log.info("D4W Escrow deployed:", dawEscrow.address);
  const ownerEscrow = await dawEscrow.owner();
  log.log ("-- Owner    ", await ownerEscrow);

  const mintFee = await dawNFT.mintFee();

  return {
    uri: {
      prefixNFT: `https://ipfs.infura.io/ipfs/dawnft/m`,
      prefixEscrow: `https://ipfs.infura.io/ipfs/dawescrow/m`
    },

    acc: {
      deployer,
      userA,
      userB
    },

    dawNFT,
    dawEscrow,

    mintFee,    

    mintedNFTs: {
      deployer: [],
      userA: [],
      userB: []
    },
    escrowNFTs: {
      deployer: [],
      userA: [],
      userB: []
    }
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  
  // User_A mint NFT
  .then(async (__) => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${__.uri.prefixNFT}/${id}`;
    const txMintUserA = await __.dawNFT.mint(
      URI,

      {
        from: __.acc.userA,
        value: __.mintFee.toString()
      }
    );

    console.log();
    log.info(`Minted NFT id: ${txMintUserA.logs[0].args.tokenId}, to: ${txMintUserA.logs[0].args.to}`);
    
    __.mintedNFTs.userA.push(txMintUserA.logs[0].args.tokenId);

    log.debug(toReadable(__.mintedNFTs));

    const isOwner = await __.dawNFT.ownerOf(__.mintedNFTs.userA[0]);
    log.info(`Owner of NFT id: ${__.mintedNFTs.userA[0]} is ${isOwner}`);

    return __;
  })
  
  // User_B mint NFT
  .then(async (__) => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${__.uri.prefixNFT}/${id}`;
    const txMintUserB = await __.dawNFT.mint(
      URI,

      {
        from: __.acc.userB,
        value: __.mintFee.toString()
      }
    );

    console.log();
    log.info(`Minted NFT id: ${txMintUserB.logs[0].args.tokenId}, to: ${txMintUserB.logs[0].args.to}`);
    
    __.mintedNFTs.userB.push(txMintUserB.logs[0].args.tokenId);

    log.debug(toReadable(__.mintedNFTs));

    const isOwner = await __.dawNFT.ownerOf(__.mintedNFTs.userB[0]);
    log.info(`Owner of NFT id: ${__.mintedNFTs.userB[0]} is ${isOwner}`);

    return __;
  })
  
  // First Recap after minted NFT for both A & B
  .then(async (__) => {
    const userANFTs = await __.dawNFT.balanceOf(__.acc.userA);
    const userBNFTs = await __.dawNFT.balanceOf(__.acc.userB);
    const escrowNFTs = await __.dawNFT.balanceOf(__.dawEscrow.address);

    console.log();
    log.info(`First Recap:`);
    log.log (`User A's NFTs: ${userANFTs}`);
    log.log (`User B's NFTs: ${userBNFTs}`);
    log.log (`Escrow NFTs: ${escrowNFTs}`);

    return __;
  })
  
  // Approval User_A's NFT to Escrow contract
  .then(async (__) => {
    const txApprovalUserA = await __.dawNFT.approve(
      __.dawEscrow.address,
      __.mintedNFTs.userA[0],

      { from: __.acc.userA }
    );

    console.log();
    log.info(`Approval NFT owner: ${txApprovalUserA.logs[0].args.owner}`);
    log.log (`               to: ${txApprovalUserA.logs[0].args.approved}`);
    log.log (`         token id: ${txApprovalUserA.logs[0].args.tokenId}`);

    return __;
  })

  // Approval User_B's NFT to Escrow contract
  .then(async (__) => {
    const txApprovalUserB = await __.dawNFT.approve(
      __.dawEscrow.address,
      __.mintedNFTs.userB[0],

      { from: __.acc.userB }
    );

    console.log();
    log.info(`Approval NFT owner: ${txApprovalUserB.logs[0].args.owner}`);
    log.log (`               to: ${txApprovalUserB.logs[0].args.approved}`);
    log.log (`         token id: ${txApprovalUserB.logs[0].args.tokenId}`);

    return __;
  })

  // User_A deposit NFT to Escrow contract
  .then(async (__) => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${__.uri.prefixEscrow}/${id}`;
    const txEscrowUserA = await __.dawEscrow.escrow(
      __.mintedNFTs.userA[0],
      URI,

      { from: __.acc.userA }
    );

    console.log();
    let logEscrow = txEscrowUserA.logs.filter(d => d.event === 'Escrow');
    logEscrow = logEscrow.length > 0 ? logEscrow[0] : null;
    log.info(`Escrow NFT id: ${logEscrow ? logEscrow.args.nftId : '---'}, escrow: ${logEscrow ? logEscrow.args.escrowId : '---'}`);
    
    __.escrowNFTs.userA.push({ nftId: logEscrow ? logEscrow.args.nftId : null, escrowId: logEscrow ? logEscrow.args.escrowId : null });

    return __;
  })

  // User_B deposit NFT to Escrow contract
  .then(async (__) => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${__.uri.prefixEscrow}/${id}`;
    const txEscrowUserB = await __.dawEscrow.escrow(
      __.mintedNFTs.userB[0],
      URI,

      { from: __.acc.userB }
    );

    console.log();
    let logEscrow = txEscrowUserB.logs.filter(d => d.event === 'Escrow');
    logEscrow = logEscrow.length > 0 ? logEscrow[0] : null;
    log.info(`Escrow NFT id: ${logEscrow ? logEscrow.args.nftId : '---'}, escrow: ${logEscrow ? logEscrow.args.escrowId : '---'}`);

    __.escrowNFTs.userB.push({ nftId: logEscrow ? logEscrow.args.nftId : null, escrowId: logEscrow ? logEscrow.args.escrowId : null });

    return __;
  })

  // Second Recap after deposited to Escrow contract for both A & B
  .then(async (__) => {
    const userANFTs = await __.dawNFT.balanceOf(__.acc.userA);
    const userBNFTs = await __.dawNFT.balanceOf(__.acc.userB);
    const escrowNFTs = await __.dawNFT.balanceOf(__.dawEscrow.address);

    console.log();
    log.info(`Second Recap:`);
    log.log (`User A's NFTs: ${userANFTs}`);
    log.log (`User B's NFTs: ${userBNFTs}`);
    log.log (`Escrow NFTs: ${escrowNFTs}`);
    log.log (`User_A's escrow info:`, toReadable(__.escrowNFTs.userA[0]));
    log.log (`User_B's escrow info:`, toReadable(__.escrowNFTs.userB[0]));

    return __;
  })
  
  // User_A withdraw NFT from Escrow contract
  .then(async (__) => {
    const txWdEscrowUserA = await __.dawEscrow.withdraw(
      __.escrowNFTs.userA[0].nftId,

      { from: __.acc.userA }
    );

    console.log();
    let logWithdraw = txWdEscrowUserA.logs.filter(d => d.event === 'Withdraw');
    logWithdraw = logWithdraw.length > 0 ? logWithdraw[0] : null;
    log.info(`Withdraw NFT id: ${logWithdraw ? logWithdraw.args.nftId : '---'}, escrow: ${logWithdraw ? logWithdraw.args.escrowId : '---'}`);

    delete __.escrowNFTs.userA[0];

    return __;
  })
  
  // User_B withdraw NFT from Escrow contract
  .then(async (__) => {
    const txWdEscrowUserB = await __.dawEscrow.withdraw(
      __.escrowNFTs.userB[0].nftId,

      { from: __.acc.userB }
    );

    console.log();
    let logWithdraw = txWdEscrowUserB.logs.filter(d => d.event === 'Withdraw');
    logWithdraw = logWithdraw.length > 0 ? logWithdraw[0] : null;
    log.info(`Withdraw NFT id: ${logWithdraw ? logWithdraw.args.nftId : '---'}, escrow: ${logWithdraw ? logWithdraw.args.escrowId : '---'}`);

    delete __.escrowNFTs.userB[0];

    return __;
  })

  // Final Recap after withdrawal from Escrow contract for both A & B
  .then(async (__) => {
    const userANFTs = await __.dawNFT.balanceOf(__.acc.userA);
    const userBNFTs = await __.dawNFT.balanceOf(__.acc.userB);
    const escrowNFTs = await __.dawNFT.balanceOf(__.dawEscrow.address);

    console.log();
    log.info(`Final Recap:`);
    log.log (`User A's NFTs: ${userANFTs}`);
    log.log (`User B's NFTs: ${userBNFTs}`);
    log.log (`Escrow NFTs: ${escrowNFTs}`);
    log.log (`User_A's escrow info:`, toReadable(__.escrowNFTs.userA));
    log.log (`User_B's escrow info:`, toReadable(__.escrowNFTs.userB));

    return __;
  })

  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
