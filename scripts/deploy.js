// ============================================================
//  scripts/deploy.js — Deployment Script
//  Deploys ALUAssetRegistry (ERC-721) and ALULogoToken (ERC-20)
// ============================================================
//
//  LOCAL (in-process Hardhat network):
//    npx hardhat run scripts/deploy.js --no-compile
//
//  LOCALHOST (persistent node running in another terminal):
//    npx hardhat node
//    npx hardhat run scripts/deploy.js --network localhost --no-compile
//
//  SEPOLIA TESTNET:
//    1. Copy .env.example → .env and fill in private key + RPC URL
//    2. Get Sepolia ETH from:  https://sepoliafaucet.com
//    3. npx hardhat run scripts/deploy.js --network sepolia --no-compile
//    4. Copy contract addresses printed below → paste into report
//    5. View on Etherscan: https://sepolia.etherscan.io/address/<address>
//
// ============================================================

const { ethers, network } = require("hardhat");

// ──────────────────────────────────────────────────────────────
//  SHA-256 hash of the ALU logo file (alu-logo.png)
//
//  How to generate this on your machine:
//    Linux / Mac:  sha256sum alu-logo.png
//    Windows:      certutil -hashfile alu-logo.png SHA256
//    Node.js:      node -e "
//                    const {createHash} = require('crypto');
//                    const fs = require('fs');
//                    console.log('0x' + createHash('sha256')
//                      .update(fs.readFileSync('alu-logo.png'))
//                      .digest('hex'));"
//
//  IMPORTANT: Replace the hash below with the hash of the real
//  ALU logo file before submitting.
// ──────────────────────────────────────────────────────────────
const ALU_LOGO_SHA256 =
  "0xad06d77ae6cdbb7d2c62513bec3df065696aa545d811f4f7fd9821e1a19f154c";

// Etherscan base URLs by network
const ETHERSCAN = {
  sepolia:   "https://sepolia.etherscan.io",
  localhost: null,
  hardhat:   null,
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name;

  console.log("=".repeat(60));
  console.log(" ALU Blockchain Asset Protection — Deployment");
  console.log("=".repeat(60));
  console.log("Network    :", networkName);
  console.log("Deployer   :", deployer.address);
  console.log(
    "Balance    :",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH\n"
  );

  // ── Step 1: Deploy ALUAssetRegistry ────────────────────────
  console.log("Step 1: Deploying ALUAssetRegistry (ERC-721)...");
  const RegistryFactory = await ethers.getContractFactory("ALUAssetRegistry");
  const registry = await RegistryFactory.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("  ✔ ALUAssetRegistry deployed to:", registryAddress);
  if (ETHERSCAN[networkName]) {
    console.log("  → Etherscan:", `${ETHERSCAN[networkName]}/address/${registryAddress}`);
  }

  // ── Step 2: Register the ALU logo on-chain ─────────────────
  console.log("\nStep 2: Registering ALU logo on-chain...");
  console.log("  Content hash:", ALU_LOGO_SHA256);
  const tx = await registry.registerAsset("ALU Official Logo", "PNG", ALU_LOGO_SHA256);
  const receipt = await tx.wait();
  console.log("  ✔ Logo registered in tx:", receipt.hash);
  if (ETHERSCAN[networkName]) {
    console.log("  → Etherscan:", `${ETHERSCAN[networkName]}/tx/${receipt.hash}`);
  }
  console.log("  ✔ NFT token ID: 1  |  Owner:", deployer.address);

  // ── Step 3: Verify the registration ─────────────────────────
  const [isAuthentic, message] = await registry.verifyLogoIntegrity(1, ALU_LOGO_SHA256);
  console.log("\nStep 3: Integrity check:", message, "→", isAuthentic);

  // ── Step 4: Deploy ALULogoToken ────────────────────────────
  console.log("\nStep 4: Deploying ALULogoToken (ERC-20)...");
  const TokenFactory = await ethers.getContractFactory("ALULogoToken");
  const token = await TokenFactory.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("  ✔ ALULogoToken deployed to:", tokenAddress);
  if (ETHERSCAN[networkName]) {
    console.log("  → Etherscan:", `${ETHERSCAN[networkName]}/address/${tokenAddress}`);
  }

  const supply = await token.totalSupply();
  console.log("  ✔ Total supply:", ethers.formatEther(supply), "ALUT  → Owner:", deployer.address);

  // ── Summary ─────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log(" Deployment Summary");
  console.log("=".repeat(60));
  console.log("ALUAssetRegistry :", registryAddress);
  console.log("ALULogoToken     :", tokenAddress);
  console.log("Logo SHA-256     :", ALU_LOGO_SHA256);
  console.log("Logo Token ID    : 1");
  console.log("ALUT Supply      :", ethers.formatEther(supply));
  if (ETHERSCAN[networkName]) {
    console.log("\nVerify on Etherscan:");
    console.log("  Registry :", `${ETHERSCAN[networkName]}/address/${registryAddress}`);
    console.log("  Token    :", `${ETHERSCAN[networkName]}/address/${tokenAddress}`);
  }
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
