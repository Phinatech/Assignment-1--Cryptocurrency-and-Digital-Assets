// ============================================================
//  scripts/compile.js — Local Compilation Script
//
//  Uses the 'solc' npm package (bundled WASM compiler) instead
//  of Hardhat's binary downloader, which requires internet
//  access to binaries.soliditylang.org.
//
//  Run:  node scripts/compile.js
//  Then: npx hardhat test --no-compile
// ============================================================

const solc = require("solc");
const fs   = require("fs");
const path = require("path");

// ── 1. Read contract source files ──────────────────────────
const registry = fs.readFileSync("contracts/ALUAssetRegistry.sol", "utf8");
const token    = fs.readFileSync("contracts/ALULogoToken.sol", "utf8");

const mainSources = {
  "contracts/ALUAssetRegistry.sol": { content: registry },
  "contracts/ALULogoToken.sol":     { content: token },
};

// ── 2. Import resolver (collects all OZ sources) ───────────
const importedSources = {};

function findImports(importPath) {
  const fullPath = path.join("node_modules", importPath);
  try {
    const content = fs.readFileSync(fullPath, "utf8");
    importedSources[importPath] = { content };
    return { contents: content };
  } catch (e) {
    return { error: "File not found: " + importPath };
  }
}

// ── 3. Compile with full output selection ──────────────────
const input = {
  language: "Solidity",
  sources: mainSources,
  settings: {
    evmVersion: "cancun",
    outputSelection: {
      "*": {
        "*": [
          "abi",
          "evm.bytecode",
          "evm.deployedBytecode",
          "evm.methodIdentifiers",
          "evm.gasEstimates",
          "metadata",
          "storageLayout",
        ],
        "": ["ast"],
      },
    },
  },
};

console.log("Compiling contracts with solc", solc.version(), "...");
const output = JSON.parse(
  solc.compile(JSON.stringify(input), { import: findImports })
);

// ── 4. Check for errors ────────────────────────────────────
let hasError = false;
if (output.errors) {
  output.errors.forEach((e) => {
    if (e.severity === "error") {
      console.error("[ERROR]", e.formattedMessage);
      hasError = true;
    } else {
      console.warn("[WARN]", e.message.split("\n")[0]);
    }
  });
}
if (hasError) process.exit(1);

// ── 5. Write Hardhat-compatible artifact files ─────────────
const allSources = { ...mainSources, ...importedSources };

const buildInfo = {
  _format:         "hh-sol-build-info-1",
  id:              "alu-build-001",
  solcVersion:     "0.8.24",
  solcLongVersion: solc.version(),
  input: {
    language: "Solidity",
    sources:  allSources,
    settings: input.settings,
  },
  output,
};

fs.mkdirSync("artifacts/build-info", { recursive: true });
fs.writeFileSync(
  "artifacts/build-info/alu-build-001.json",
  JSON.stringify(buildInfo)
);

const contracts = {
  ALUAssetRegistry: "contracts/ALUAssetRegistry.sol",
  ALULogoToken:     "contracts/ALULogoToken.sol",
};

for (const [name, src] of Object.entries(contracts)) {
  const c = output.contracts[src][name];

  const artifact = {
    _format:               "hh-sol-artifact-1",
    contractName:          name,
    sourceName:            src,
    abi:                   c.abi,
    bytecode:              "0x" + c.evm.bytecode.object,
    deployedBytecode:      "0x" + c.evm.deployedBytecode.object,
    linkReferences:        c.evm.bytecode.linkReferences        || {},
    deployedLinkReferences:c.evm.deployedBytecode.linkReferences || {},
  };

  const dir = `artifacts/${src}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/${name}.json`, JSON.stringify(artifact, null, 2));
  fs.writeFileSync(
    `${dir}/${name}.dbg.json`,
    JSON.stringify({
      _format:   "hh-sol-dbg-1",
      buildInfo: "../../build-info/alu-build-001.json",
    })
  );

  console.log(`  ✔ ${name}: ${c.abi.length} ABI entries, bytecode ${artifact.bytecode.length / 2} bytes`);
}

console.log("\nCompilation complete. Run:  npx hardhat test --no-compile");
