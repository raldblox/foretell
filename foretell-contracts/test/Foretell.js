const { expect } = require("chai");
const { ethers } = require("hardhat");
const { keccak256 } = require("ethers");
const { MerkleTree } = require("merkletreejs");

describe("OpenSurveyVaultFactory and OpenSurveyRewardVault", function () {
  let factory, vault, token;
  let owner, user1, user2;
  const surveyId = 42;

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    token = await Token.deploy("Mocked USDC", "mUSDC");

    const Factory = await ethers.getContractFactory("OpenSurveyVaultFactory");
    factory = await Factory.deploy();

    await factory.createVault(surveyId);
    const vaultAddress = await factory.vaults(surveyId);
    vault = await ethers.getContractAt("OpenSurveyRewardVault", vaultAddress);
  });

  it("should fund the vault", async () => {
    await token.mint(user1.address, 1000);
    await token.connect(user1).approve(vault.target, 500);
    await expect(vault.connect(user1).fund(token.target, 500))
      .to.emit(vault, "Funded")
      .withArgs(user1.address, token.target, 500);
    expect(await token.balanceOf(vault.target)).to.equal(500);
  });

  it("should allow claiming via valid merkle proof", async () => {
    const leaves = [
      keccak256(
        new ethers.AbiCoder().encode(
          ["address", "uint256"],
          [user1.address, 300]
        )
      ),
      keccak256(
        new ethers.AbiCoder().encode(
          ["address", "uint256"],
          [user2.address, 700]
        )
      ),
    ];
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    await factory.setVaultMerkleRoot(surveyId, token.target, root);

    await token.mint(owner.address, 1000);
    await token.approve(vault.target, 1000);
    await vault.fund(token.target, 1000);

    const proof1 = tree.getHexProof(leaves[0]);

    await expect(vault.connect(user1).claim(token.target, 300, proof1))
      .to.emit(vault, "Claimed")
      .withArgs(user1.address, token.target, 300);

    expect(await token.balanceOf(user1.address)).to.equal(300);
  });

  it("should reject invalid proofs", async () => {
    const invalidLeaf = keccak256(
      new ethers.AbiCoder().encode(
        ["address", "uint256"],
        [user1.address, 300]
      )
    );
    const tree = new MerkleTree([invalidLeaf], keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    await factory.setVaultMerkleRoot(surveyId, token.target, root);

    await token.mint(owner.address, 1000);
    await token.approve(vault.target, 1000);
    await vault.fund(token.target, 1000);

    const fakeProof = tree.getHexProof(invalidLeaf);
    await expect(
      vault.connect(user1).claim(token.target, 500, fakeProof)
    ).to.be.revertedWithCustomError(vault, "InvalidProof");
  });
});
