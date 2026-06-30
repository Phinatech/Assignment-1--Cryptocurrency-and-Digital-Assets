require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * Hardhat Configuration
 *
 * Networks:
 *   hardhat  — in-process local blockchain (default for tests)
 *   localhost — persistent local node (npx hardhat node)
 *   sepolia  — Ethereum public testnet (requires .env vars)
 *
 * To deploy to Sepolia:
 *   1. Copy .env.example → .env
 *   2. Fill in SEPOLIA_PRIVATE_KEY and SEPOLIA_RPC_URL
 *   3. npx hardhat run scripts/deploy.js --network sepolia --no-compile
 */

const SEPOLIA_RPC_URL    = process.env.SEPOLIA_RPC_URL    || "";
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    // ── Local in-process network (tests run here by default) ──
    hardhat: {
      chainId: 1337,
    },
    // ── Persistent local node (npx hardhat node) ───────────
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    // ── Ethereum Sepolia public testnet ────────────────────
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
      chainId: 11155111,
    },
  },
};
