// ============================================================
//  ALUAssetRegistry.test.js — Automated Test Suite
//  Tests 1-5 : ALUAssetRegistry (ERC-721)
//  Tests 6-8 : ALULogoToken      (ERC-20)
// ============================================================

const { expect } = require("chai");
const { ethers }  = require("hardhat");

// ──────────────────────────────────────────────────────────────
//  Helper: turn a hex string from sha256sum into bytes32
//  In real deployment you would use:
//    const { createHash } = require('crypto');
//    const hash = '0x' + createHash('sha256').update(fs.readFileSync('alu-logo.png')).digest('hex');
// ──────────────────────────────────────────────────────────────
const aluLogoHash = ethers.keccak256(ethers.toUtf8Bytes("ALU-OFFICIAL-LOGO-TEST-HASH"));
const wrongHash   = ethers.keccak256(ethers.toUtf8Bytes("MODIFIED-FAKE-LOGO-HASH"));

// ──────────────────────────────────────────────────────────────
//  Test Suite 1 of 2 — ALUAssetRegistry (ERC-721)
// ──────────────────────────────────────────────────────────────
describe("ALUAssetRegistry (ERC-721)", function () {
  let registry;
  let owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ALUAssetRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();
  });

  // ── Test 1 ──────────────────────────────────────────────────
  it("Test 1 — registers ALU logo successfully and emits AssetRegistered with tokenId 1", async function () {
    const tx      = await registry.registerAsset("ALU Official Logo", "PNG", aluLogoHash);
    const receipt = await tx.wait();

    // Parse the AssetRegistered event from the receipt
    const parsedLogs = receipt.logs
      .map((log) => {
        try { return registry.interface.parseLog(log); }
        catch { return null; }
      })
      .filter(Boolean);

    const event = parsedLogs.find((e) => e.name === "AssetRegistered");
    expect(event, "AssetRegistered event not found").to.not.be.null;
    expect(event.args.tokenId).to.equal(1n);
    expect(event.args.assetName).to.equal("ALU Official Logo");

    // totalAssets() should now return 1
    expect(await registry.totalAssets()).to.equal(1n);
  });

  // ── Test 2 ──────────────────────────────────────────────────
  it("Test 2 — rejects duplicate registration of the same content hash", async function () {
    // First registration succeeds
    await registry.registerAsset("ALU Official Logo", "PNG", aluLogoHash);

    // Second registration with the SAME hash must revert
    await expect(
      registry.registerAsset("ALU Logo Copy", "PNG", aluLogoHash)
    ).to.be.revertedWith(
      "ALUAssetRegistry: asset with this hash is already registered"
    );
  });

  // ── Test 3 ──────────────────────────────────────────────────
  it("Test 3 — verifyLogoIntegrity() returns true when the correct hash is supplied", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", aluLogoHash);

    const [isAuthentic, message] = await registry.verifyLogoIntegrity(1, aluLogoHash);
    expect(isAuthentic).to.be.true;
    expect(message).to.equal("Logo is authentic.");
  });

  // ── Test 4 ──────────────────────────────────────────────────
  it("Test 4 — verifyLogoIntegrity() returns false when an incorrect hash is supplied", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", aluLogoHash);

    const [isAuthentic, message] = await registry.verifyLogoIntegrity(1, wrongHash);
    expect(isAuthentic).to.be.false;
    expect(message).to.equal("Warning: logo does not match.");
  });

  // ── Test 5 ──────────────────────────────────────────────────
  it("Test 5 — getAsset() returns the correct asset name and file type", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", aluLogoHash);

    const asset = await registry.getAsset(1);
    expect(asset.assetName).to.equal("ALU Official Logo");
    expect(asset.fileType).to.equal("PNG");
    expect(asset.contentHash).to.equal(aluLogoHash);
    expect(asset.registeredBy).to.equal(owner.address);
  });
});

// ──────────────────────────────────────────────────────────────
//  Test Suite 2 of 2 — ALULogoToken (ERC-20)
// ──────────────────────────────────────────────────────────────
describe("ALULogoToken (ERC-20)", function () {
  let token;
  let owner, recipient;

  // 1,000,000 tokens with 18 decimal places — matches TOTAL_SUPPLY in contract
  const TOTAL_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    [owner, recipient] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ALULogoToken");
    // Deploy: pass owner's address so all tokens are minted there
    token = await Factory.deploy(owner.address);
    await token.waitForDeployment();
  });

  // ── Test 6 ──────────────────────────────────────────────────
  it("Test 6 — mints the full supply of 1,000,000 ALUT to the logo owner on deployment", async function () {
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(TOTAL_SUPPLY);

    // Total supply on-chain should also equal TOTAL_SUPPLY
    expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
  });

  // ── Test 7 ──────────────────────────────────────────────────
  it("Test 7 — distributeShares() transfers the specified token amount to a recipient", async function () {
    const shareAmount = ethers.parseEther("100000"); // 100,000 ALUT = 10%

    await token.distributeShares(recipient.address, shareAmount);

    const recipientBalance = await token.balanceOf(recipient.address);
    expect(recipientBalance).to.equal(shareAmount);

    // Owner's balance should have decreased accordingly
    const ownerBalance = await token.balanceOf(owner.address);
    expect(ownerBalance).to.equal(TOTAL_SUPPLY - shareAmount);
  });

  // ── Test 8 ──────────────────────────────────────────────────
  it("Test 8 — ownershipPercentage() returns the correct whole-number percentage", async function () {
    const shareAmount = ethers.parseEther("500000"); // 500,000 ALUT = 50%

    await token.distributeShares(recipient.address, shareAmount);

    const percentage = await token.ownershipPercentage(recipient.address);
    expect(percentage).to.equal(50n);

    // Owner still has 50%, recipient has 50%
    const ownerPct = await token.ownershipPercentage(owner.address);
    expect(ownerPct).to.equal(50n);
  });
});
