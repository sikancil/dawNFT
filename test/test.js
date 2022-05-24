const {
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const { expect } = require("chai");
const { assert } = require("hardhat");
const { log, toReadable } = require("./helpers/utils");

const D4WNFT = artifacts.require("D4WNFT.sol");
const D4WEscrow = artifacts.require("D4WEscrow.sol");
const BN = web3.utils.toBN;

contract("NFT", function (accounts) {
  before(async () => {
    console.log();

    [ this.deployer, this.userA, this.userB ] = accounts;
    log.info("Accounts:");
    log.log ("• Deployer: ", this.deployer, web3.utils.fromWei((await web3.eth.getBalance(this.deployer)), 'ether'), 'ETH');
    log.log ("• User A:   ", this.userA, web3.utils.fromWei((await web3.eth.getBalance(this.userA)), 'ether'), 'ETH');
    log.log ("• User B:   ", this.userB, web3.utils.fromWei((await web3.eth.getBalance(this.userB)), 'ether'), 'ETH');

    this.ZERO = '0x0000000000000000000000000000000000000000';
    this.nftPrefixURI = `https://ipfs.infura.io/ipfs/dawnft/m`;
    this.escrowPrefixURI = `https://ipfs.infura.io/ipfs/dawescrow/m`;

    this.mintedNFTs = {
      deployer: [],
      userA: [],
      userB: [],
    };
    this.escrowNFTs = {
      deployer: [],
      userA: [],
      userB: [],
    };
  });

  it("Deployments..", async () => {
    this.dawNFT = await D4WNFT.new(
      { from: this.deployer }
    );
    
    this.dawEscrow = await D4WEscrow.new(
      dawNFT.address,
      
      { from: this.deployer }
    );

    console.log();
    log.info("D4W NFT:     ", this.dawNFT.address);
    const ownerNFT = await this.dawNFT.owner();
    log.log ("-- Owner    ", ownerNFT);

    console.log();
    log.info("D4W Escrow:  ", this.dawEscrow.address);
    const ownerEscrow = await this.dawEscrow.owner();
    log.log ("-- Owner    ", await ownerEscrow);

    expect(ownerNFT).to.equal(this.deployer);
    expect(ownerEscrow).to.equal(this.deployer);
  });

  it("Should added in Whitelist - User_A", async () => {
    const txWhitelistUserA = await this.dawNFT.whitelist(
      this.userA,

      { from: this.deployer }
    );

    console.log();
    log.info(`User_A in whitelist `, txWhitelistUserA.logs[0].args.state);
    await expectEvent(txWhitelistUserA, "Whitelisted", { minter: this.userA, state: true });
  });
  
  it("Should get Mint fee", async () => {
    this.mintFee = await this.dawNFT.mintFee();

    console.log();
    log.info(`Default mint fee `, this.mintFee.toString(), `(${web3.utils.fromWei(this.mintFee, 'ether')} ETH)`);
    assert.isTrue(this.mintFee.eq(BN(web3.utils.toWei('0.01', 'ether'))));
  });

  it("Should mint NFT token by User_A", async () => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${this.nftPrefixURI}/${id}`;
    const txMintUserA = await this.dawNFT.mint(
      URI,

      { from: this.userA }
    );

    console.log();
    log.info(`Minted NFT id: ${txMintUserA.logs[0].args.tokenId}, to: ${txMintUserA.logs[0].args.to}`);
    this.mintedNFTs.userA.push(txMintUserA.logs[0].args.tokenId);

    await expectEvent(txMintUserA, "Transfer", { from: this.ZERO, to: this.userA });

    const isOwner = await this.dawNFT.ownerOf(this.mintedNFTs.userA[0]);
    log.info(`Owner of NFT id: ${this.mintedNFTs.userA[0]} is ${isOwner}`);
    expect(isOwner).to.equal(this.userA);
  });

  it("Should unable to mint NFT token by User_B without pay fee", async () => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${this.nftPrefixURI}/${id}`;
    const txMintUserB = this.dawNFT.mint(
      URI,

      { from: this.userB }
    );

    console.log();
    await expectRevert(txMintUserB, 'Insufficient fee');
  });
  
  it("Should unable to mint NFT token by User_B when less than required fee", async () => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${this.nftPrefixURI}/${id}`;
    const txMintUserB = this.dawNFT.mint(
      URI,

      {
        from: this.userB,
        value: web3.utils.toWei('0.001', 'ether')
      }
    );

    console.log();
    await expectRevert(txMintUserB, 'Insufficient fee');
  });
  
  it("Should able to mint NFT token by User_B by exact amount or greater amount than fee", async () => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${this.nftPrefixURI}/${id}`;
    const txMintUserB = await this.dawNFT.mint(
      URI,

      {
        from: this.userB,
        value: this.mintFee.toString()
      }
    );

    console.log();
    log.info(`Minted NFT id: ${txMintUserB.logs[0].args.tokenId}, to: ${txMintUserB.logs[0].args.to}`);
    this.mintedNFTs.userB.push(txMintUserB.logs[0].args.tokenId);

    await expectEvent(txMintUserB, "Transfer", { from: this.ZERO, to: this.userB });

    const isOwner = await this.dawNFT.ownerOf(this.mintedNFTs.userB[0]);
    log.info(`Owner of NFT id: ${this.mintedNFTs.userB[0]} is ${isOwner}`);
    expect(isOwner).to.equal(this.userB);
  });

  it("Should show first recap", async () => {
    const userANFTs = await this.dawNFT.balanceOf(this.userA);
    const userBNFTs = await this.dawNFT.balanceOf(this.userB);
    const escrowNFTs = await this.dawNFT.balanceOf(this.dawEscrow.address);

    console.log();
    log.info(`First Recap:`);
    log.log (`User A's NFTs: ${userANFTs}`);
    log.log (`User B's NFTs: ${userBNFTs}`);
    log.log (`Escrow NFTs: ${escrowNFTs}`);
  });

  it("Should not allowed to transfer/escrow NFT token by User_A to the Escrow contract when not approved", async () => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${this.escrowPrefixURI}/${id}`;
    const txEscrowUserA = this.dawEscrow.escrow(
      this.mintedNFTs.userA[0],
      URI,

      { from: this.userA }
    );

    console.log();
    await expectRevert(txEscrowUserA, "ERC721: transfer caller is not owner nor approved");
  });
  
  it("Should approved User_A's NFT token by User_A", async () => {
    const txApprovalUserA = await this.dawNFT.approve(
      this.dawEscrow.address,
      this.mintedNFTs.userA[0],

      { from: this.userA }
    );

    console.log();
    log.info(`Approval NFT owner: ${txApprovalUserA.logs[0].args.owner}`);
    log.log (`               to: ${txApprovalUserA.logs[0].args.approved}`);
    log.log (`         token id: ${txApprovalUserA.logs[0].args.tokenId}`);

    await expectEvent(txApprovalUserA, "Approval", { owner: this.userA, approved: this.dawEscrow.address, tokenId: this.mintedNFTs.userA[0] });
  });

  it("Should not allowed to transfer/escrow User_A's NFT token by User_B", async () => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${this.escrowPrefixURI}/${id}`;
    const txEscrowUserB = this.dawEscrow.escrow(
      this.mintedNFTs.userA[0],
      URI,

      { from: this.userB }
    );

    console.log();
    await expectRevert(txEscrowUserB, "ERC721: transfer from incorrect owner");
  });
  
  it("Should able to escrow User_A's NFT token by User_A to the Escrow contract", async () => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${this.escrowPrefixURI}/${id}`;
    const txEscrowUserA = await this.dawEscrow.escrow(
      this.mintedNFTs.userA[0],
      URI,

      { from: this.userA }
    );

    console.log();
    let logEscrow = txEscrowUserA.logs.filter(d => d.event === 'Escrow');
    logEscrow = logEscrow.length > 0 ? logEscrow[0] : null;
    log.info(`Escrow NFT id: ${logEscrow ? logEscrow.args.nftId : '---'}, escrow: ${logEscrow ? logEscrow.args.escrowId : '---'}`);
    this.escrowNFTs.userA.push({ nftId: logEscrow ? logEscrow.args.nftId : null, escrowId: logEscrow ? logEscrow.args.escrowId : null });

    await expectEvent(txEscrowUserA, "Escrow", { nftId: this.mintedNFTs.userA[0] });
  });

  it("Should approved User_B's NFT token by User_B", async () => {
    const txApprovalUserB = await this.dawNFT.approve(
      this.dawEscrow.address,
      this.mintedNFTs.userB[0],

      { from: this.userB }
    );

    console.log();
    log.info(`Approval NFT owner: ${txApprovalUserB.logs[0].args.owner}`);
    log.log (`               to: ${txApprovalUserB.logs[0].args.approved}`);
    log.log (`         token id: ${txApprovalUserB.logs[0].args.tokenId}`);

    await expectEvent(txApprovalUserB, "Approval", { owner: this.userB, approved: this.dawEscrow.address, tokenId: this.mintedNFTs.userB[0] });
  });
  
  it("Should able to escrow NFT token by User_B to the Escrow contract", async () => {
    const rid = web3.utils.randomHex(32);
    const id = web3.utils.stripHexPrefix(rid);
    const URI = `${this.escrowPrefixURI}/${id}`;
    const txEscrowUserB = await this.dawEscrow.escrow(
      this.mintedNFTs.userB[0],
      URI,

      { from: this.userB }
    );

    console.log();
    let logEscrow = txEscrowUserB.logs.filter(d => d.event === 'Escrow');
    logEscrow = logEscrow.length > 0 ? logEscrow[0] : null;
    log.info(`Escrow NFT id: ${logEscrow ? logEscrow.args.nftId : '---'}, escrow: ${logEscrow ? logEscrow.args.escrowId : '---'}`);
    this.escrowNFTs.userB.push({ nftId: logEscrow ? logEscrow.args.nftId : null, escrowId: logEscrow ? logEscrow.args.escrowId : null });

    await expectEvent(txEscrowUserB, "Escrow", { nftId: this.mintedNFTs.userB[0] });
  });

  it("Should show second recap", async () => {
    const userANFTs = await this.dawNFT.balanceOf(this.userA);
    const userBNFTs = await this.dawNFT.balanceOf(this.userB);
    const escrowNFTs = await this.dawNFT.balanceOf(this.dawEscrow.address);

    console.log();
    log.info(`Second Recap:`);
    log.log (`User A's NFTs: ${userANFTs}`);
    log.log (`User B's NFTs: ${userBNFTs}`);
    log.log (`Escrow NFTs: ${escrowNFTs}`);
    log.log (`User_A's escrow info:`, toReadable(this.escrowNFTs.userA[0]));
    log.log (`User_B's escrow info:`, toReadable(this.escrowNFTs.userB[0]));
  });
  
  it("Should unable to withdraw User_A's NFT token from the Escrow contract by User_B", async () => {
    const txWdEscrowUserB = this.dawEscrow.withdraw(
      this.escrowNFTs.userA[0].nftId,

      { from: this.userB }
    );

    console.log();
    await expectRevert(txWdEscrowUserB, "Unavailable or Unauthorized");
  });

  it("Should able to withdraw User_A's NFT token from the Escrow contract by User_A", async () => {
    const txWdEscrowUserA = await this.dawEscrow.withdraw(
      this.escrowNFTs.userA[0].nftId,

      { from: this.userA }
    );

    console.log();
    let logWithdraw = txWdEscrowUserA.logs.filter(d => d.event === 'Withdraw');
    logWithdraw = logWithdraw.length > 0 ? logWithdraw[0] : null;
    log.info(`Withdraw NFT id: ${logWithdraw ? logWithdraw.args.nftId : '---'}, escrow: ${logWithdraw ? logWithdraw.args.escrowId : '---'}`);
    await expectEvent(txWdEscrowUserA, "Withdraw", { nftId: this.escrowNFTs.userA[0].nftId, escrowId: this.escrowNFTs.userA[0].escrowId });

    delete this.escrowNFTs.userA[0];
  });

  it("Should able to withdraw User_B's NFT token from the Escrow contract by User_B", async () => {
    const txWdEscrowUserB = await this.dawEscrow.withdraw(
      this.escrowNFTs.userB[0].nftId,

      { from: this.userB }
    );

    console.log();
    let logWithdraw = txWdEscrowUserB.logs.filter(d => d.event === 'Withdraw');
    logWithdraw = logWithdraw.length > 0 ? logWithdraw[0] : null;
    log.info(`Withdraw NFT id: ${logWithdraw ? logWithdraw.args.nftId : '---'}, escrow: ${logWithdraw ? logWithdraw.args.escrowId : '---'}`);
    await expectEvent(txWdEscrowUserB, "Withdraw", { nftId: this.escrowNFTs.userB[0].nftId, escrowId: this.escrowNFTs.userB[0].escrowId });

    delete this.escrowNFTs.userB[0];
  });

  it("Should show final recap", async () => {
    const userANFTs = await this.dawNFT.balanceOf(this.userA);
    const userBNFTs = await this.dawNFT.balanceOf(this.userB);
    const escrowNFTs = await this.dawNFT.balanceOf(this.dawEscrow.address);

    console.log();
    log.info(`Final Recap:`);
    log.log (`User A's NFTs: ${userANFTs}`);
    log.log (`User B's NFTs: ${userBNFTs}`);
    log.log (`Escrow NFTs: ${escrowNFTs}`);
    log.log (`User_A's escrow info:`, toReadable(this.escrowNFTs.userA));
    log.log (`User_B's escrow info:`, toReadable(this.escrowNFTs.userB));
  });
});
