# ALU Blockchain Asset Protection System

A two-contract Ethereum project that protects the African Leadership University (ALU) logo using blockchain technology. The first contract, **ALUAssetRegistry** (ERC-721), registers the logo as a unique non-fungible token and stores its SHA-256 fingerprint permanently on-chain so that authenticity can be verified by anyone. The second contract, **ALULogoToken** (ERC-20), issues 1,000,000 divisible ALUT tokens that represent fractional ownership shares of the registered logo.

---

## SHA-256 Hash of the ALU Logo

The SHA-256 hash of the included `alu-logo.png` file is:

```
ad06d77ae6cdbb7d2c62513bec3df065696aa545d811f4f7fd9821e1a19f154c
```

As a Solidity `bytes32` value:
```
0xb2a1ba00a20638d7d1960886a9d7ca45a374865ddc1d69f425c4304b97ff421d
```

To independently verify: `sha256sum alu-logo.png`

> **Note:** Replace `alu-logo.png` with the official ALU logo, regenerate the hash, and update `scripts/deploy.js` before final submission.

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | v18.0 or later |
| npm | v8.0 or later |
| Hardhat | v2 (`hh2` toolbox tag) |
| Solidity | 0.8.24 |
| OpenZeppelin Contracts | v5.x |

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/Phinatech/Assignment-1--Cryptocurrency-and-Digital-Assets
cd alu-submission

# 2. Install all dependencies
npm install
```

---

## Compile the Contracts

**Standard method** (downloads Solidity compiler automatically):

```bash
npx hardhat compile
```

**Alternative** (uses the bundled solc npm package — no internet required):

```bash
node scripts/compile.js
```

---

## Run the Tests

```bash
# After running npx hardhat compile:
npx hardhat test

# After running node scripts/compile.js:
npx hardhat test --no-compile
```

Expected output — all 8 tests pass:

```
  ALUAssetRegistry (ERC-721)
    ✔ Test 1 — registers ALU logo successfully and emits AssetRegistered with tokenId 1
    ✔ Test 2 — rejects duplicate registration of the same content hash
    ✔ Test 3 — verifyLogoIntegrity() returns true when the correct hash is supplied
    ✔ Test 4 — verifyLogoIntegrity() returns false when an incorrect hash is supplied
    ✔ Test 5 — getAsset() returns the correct asset name and file type

  ALULogoToken (ERC-20)
    ✔ Test 6 — mints the full supply of 1,000,000 ALUT to the logo owner on deployment
    ✔ Test 7 — distributeShares() transfers the specified token amount to a recipient
    ✔ Test 8 — ownershipPercentage() returns the correct whole-number percentage

  8 passing
```

---

## Deploy to Local Network

```bash
# Option A — in-process network (simplest, no extra terminal needed):
npx hardhat run scripts/deploy.js

# Option B — persistent local node:
npx hardhat node                                        # Terminal 1
npx hardhat run scripts/deploy.js --network localhost   # Terminal 2
```

## Deploy to Sepolia Testnet

```bash
# 1. Copy the example env file and fill in your credentials
cp .env.example .env

# 2. Get free Sepolia ETH from:  https://sepoliafaucet.com

# 3. Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 4. View on Etherscan: https://sepolia.etherscan.io/address/<deployed-address>
```

---

## Project Structure

```
alu-blockchain-logo-protection/
├── contracts/
│   ├── ALUAssetRegistry.sol    # ERC-721 logo registration contract
│   └── ALULogoToken.sol        # ERC-20 ownership tokenisation contract
├── scripts/
│   ├── compile.js              # Alternative compiler (uses solc npm package)
│   └── deploy.js               # Deploys both contracts + registers logo
├── test/
│   └── ALUAssetRegistry.test.js  # 8 automated tests
├── .env.example                # Template for testnet credentials
├── .gitignore                  # Excludes .env and node_modules
├── alu-logo.png                # ALU logo file
├── hardhat.config.js           # Hardhat + Sepolia configuration
├── Project_Report.pdf          # Written project report
└── README.md
```

---

## Problems Encountered and How They Were Resolved

1. **OpenZeppelin v5 `Ownable` constructor change:** Unlike v4, OpenZeppelin v5 requires the initial owner address to be passed explicitly in the constructor — `Ownable(msg.sender)` or `Ownable(logoOwner)`. Updated both contracts accordingly.

2. **OpenZeppelin v5 uses the `mcopy` opcode:** The `Bytes.sol` utility in OpenZeppelin v5 uses the `mcopy` EVM instruction introduced in the Cancun upgrade. Resolved by setting `evmVersion: 'cancun'` in `hardhat.config.js`.

3. **GitHub authentication:** Used SSH key authentication (`git@github.com:Phinatech/...`) instead of HTTPS to avoid credential prompts when pushing.
