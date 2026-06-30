# Manual Steps Checklist — Read This Before Submitting

Everything in this ZIP is built and working: both contracts compile, all 8 tests pass, the README and report are written. What's listed below is the part that genuinely cannot be done for you — it requires your own student credentials, your own GitHub account, your own webcam/screen, and your own ALU logo file. Work through this top to bottom. Tested on Ubuntu.

Estimated total time: 60–70 minutes (most of it is waiting for the Sepolia faucet).

---

## ☐ 1. Install dependencies (5 min)

```bash
cd ~/path/to/alu-submission
npm install
```

---

## ☐ 2. Compile and get your first 2 screenshots (10 min)

```bash
npx hardhat compile
```

Should say "Compiled 2 Solidity files successfully."

**Terminal 1:**
```bash
npx hardhat node
```
📸 **Screenshot this** — it shows Account #0 through #19 with addresses and balances. Leave this terminal running.

**Terminal 2 (new tab, Ctrl+Shift+T):**
```bash
cd ~/path/to/alu-submission
npx hardhat test
```
📸 **Screenshot this** — all 8 green checkmarks plus the "8 passing" line.

Go back to Terminal 1 and press `Ctrl+C` to stop the node.

---

## ☐ 3. Replace the placeholder logo with the real one (5 min)

- [ ] Download the official ALU logo from your student portal or alueducation.com
- [ ] Copy it into the project, overwriting the placeholder:
  ```bash
  cp ~/Downloads/alu-logo.png ~/path/to/alu-submission/alu-logo.png
  ```
- [ ] Generate its real hash:
  ```bash
  sha256sum alu-logo.png
  ```
  📸 **Screenshot this command and its output** — this is a required report screenshot.

- [ ] Open `scripts/deploy.js`, line 40. Replace the placeholder hash:
  ```
  const ALU_LOGO_SHA256 =
    "0xb2a1ba00a20638d7d1960886a9d7ca45a374865ddc1d69f425c4304b97ff421d";
  ```
  with your real one (keep the `0x` prefix):
  ```
  const ALU_LOGO_SHA256 = "0xYOUR_REAL_64_CHAR_HASH";
  ```

- [ ] Open `README.md`, lines 12 and 17. Replace both instances of `b2a1ba00a20638d7d1960886a9d7ca45a374865ddc1d69f425c4304b97ff421d` with your real hash (with and without the `0x` prefix as shown on those two lines).

---

## ☐ 4. Set up a Sepolia testnet wallet (20 min — mostly faucet wait time)

- [ ] Install MetaMask in your browser (metamask.io) and create a **new** wallet just for this assignment. Never use a wallet holding real funds.
- [ ] In MetaMask: network dropdown at top → "Show test networks" → select **Sepolia**.
- [ ] Export your private key: MetaMask → ⋮ → Account details → Export private key → enter password → copy it.
- [ ] Create a free Alchemy account (alchemy.com) → Create new app → Chain: Ethereum, Network: Sepolia → copy the HTTPS RPC URL.
- [ ] Create the `.env` file in your project root:
  ```bash
  nano .env
  ```
  Paste exactly (with your real values):
  ```
  SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
  SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
  ```
  Save: `Ctrl+O` → `Enter` → `Ctrl+X`

- [ ] Verify it's read correctly:
  ```bash
  node -e "require('dotenv').config(); console.log('Key OK:', process.env.SEPOLIA_PRIVATE_KEY?.length===66, '| RPC OK:', !!process.env.SEPOLIA_RPC_URL)"
  ```
  Should print `Key OK: true | RPC OK: true`.

- [ ] Get free Sepolia ETH (need ~0.01 ETH). Copy your MetaMask address, then use **one** of:
  - sepoliafaucet.com
  - faucet.quicknode.com/ethereum/sepolia
  - faucets.chain.link/sepolia

  Wait until the ETH actually shows up in MetaMask before continuing.

---

## ☐ 5. Deploy to Sepolia (5 min)

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

📸 **Screenshot the full output** — it prints both contract addresses and Etherscan links.

- [ ] Open both Etherscan links it prints in your browser.
  📸 **Screenshot each Etherscan page.**
- [ ] Write down both contract addresses somewhere safe — you'll paste them into the report next.

---

## ☐ 6. Push to GitHub (5 min)

```bash
cd ~/path/to/alu-submission
git init
git add .
git commit -m "ALU blockchain logo protection - 8/8 tests passing, Sepolia deployed"
git branch -M main
git remote add origin https://github.com/Phinatech/alu-blockchain-logo-protection.git
git push -u origin main
```

If prompted for a password, use a GitHub Personal Access Token (Settings → Developer settings → Personal access tokens → Generate new → tick "repo"), not your account password.

- [ ] Confirm at github.com/Phinatech/alu-blockchain-logo-protection that the repo is **Public** and all files show up.

---

## ☐ 7. Record your demo video (10 min)

Record a 3–5 minute screen capture showing, in this order:
1. `npx hardhat test` running with all 8 tests passing
2. `npx hardhat run scripts/deploy.js --network sepolia` running, addresses appearing
3. Both Etherscan pages open in your browser

On Ubuntu: `sudo apt install kazam -y` then run `kazam`, or use loom.com (no install, gives you an instant shareable link).

- [ ] Upload to YouTube (Unlisted) or Google Drive (shared link) and copy the URL.

---

## ☐ 8. Finish the report and re-export to PDF (15 min)

Open `Project_Report.docx` in LibreOffice Writer or Microsoft Word and replace every grey placeholder:

| Find this placeholder text | Replace with |
|---|---|
| "[Screenshot of your actual npx hardhat node terminal output here]" | Your hardhat node screenshot |
| "[Screenshot of your sha256sum command output here]" | Your sha256sum screenshot |
| "[Screenshot of this terminal output must be inserted here]" | Your 8-tests-passing screenshot |
| "[Insert ALUAssetRegistry Sepolia address here]" | Your real registry address + Etherscan link |
| "[Insert ALULogoToken Sepolia address here]" | Your real token address + Etherscan link |
| "[Screenshot of Sepolia Etherscan showing both deployed contracts here]" | Your Etherscan screenshots |
| "https://github.com/Phinatech/alu-blockchain-logo-protection" (placeholder note below it) | Confirm this matches your real repo, delete the placeholder note |
| "[Insert your video link here...]" | Your real video URL |

Then: **File → Export as PDF** → name it `Project_Report.pdf` → Export.

---

## ☐ 9. Final ZIP and submit

```bash
cd ~/path/to
zip -r alu-blockchain-final-submission.zip alu-submission/
```

Before submitting, open the ZIP and confirm these 8 items are all there:
- [ ] contracts/ALUAssetRegistry.sol
- [ ] contracts/ALULogoToken.sol
- [ ] scripts/deploy.js
- [ ] test/ALUAssetRegistry.test.js
- [ ] alu-logo.png (the **real** logo now)
- [ ] hardhat.config.js
- [ ] README.md (with your **real** hash)
- [ ] Project_Report.pdf (with all placeholders replaced)

---

## Quick fixes for common errors

| Error | Fix |
|---|---|
| `node: command not found` | `sudo apt install nodejs npm -y` |
| `Error: insufficient funds for gas` | Go back to the faucet, wait a few minutes |
| `Error HH502: Couldn't download compiler` | Run `node scripts/compile.js` instead of `npx hardhat compile` |
| `git push` rejected / asks for password repeatedly | Use a Personal Access Token as the password, not your GitHub password |
| `.env` values show as `undefined` | Make sure you're inside the project folder when running commands |
