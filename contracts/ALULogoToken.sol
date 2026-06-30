// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ============================================================
//  ALULogoToken — ERC-20 Ownership Tokenisation Contract
//  African Leadership University | Blockchain Assignment
//
//  This contract tokenises ownership of the ALU logo.
//  One million ALUT tokens are minted at deployment and sent
//  to the logo owner (ALU). The owner can then distribute
//  tokens to stakeholders — faculty, students, administration —
//  so that each holder owns a proportional share of the logo.
// ============================================================

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ALULogoToken is ERC20, Ownable {

    // ──────────────────────────────────────────────────────
    //  Constants
    // ──────────────────────────────────────────────────────

    /**
     * @dev Fixed total supply: 1,000,000 ALUT tokens.
     *
     *      ERC-20 tokens use 18 decimal places by default
     *      (matching how ETH uses "wei" as its smallest unit).
     *      So internally the value is:
     *
     *          1,000,000 × 10^18  =  1_000_000_000_000_000_000_000_000
     *
     *      When a user's wallet displays their balance it divides
     *      by 10^18, so 500_000 * 10^18 shows as 500,000 ALUT.
     */
    uint256 public constant TOTAL_SUPPLY = 1_000_000 * 10 ** 18;

    // ──────────────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────────────

    /**
     * @dev Deploys the token and immediately mints the entire
     *      supply to the logo owner's wallet.
     *
     *      Token name:   "ALU Logo Token"
     *      Token symbol: "ALUT"
     *
     * @param logoOwner The wallet address that represents ALU
     *                  (receives 100% of the token supply at launch).
     */
    constructor(address logoOwner)
        ERC20("ALU Logo Token", "ALUT")
        Ownable(logoOwner)
    {
        // Mint all 1,000,000 ALUT to the logo owner
        _mint(logoOwner, TOTAL_SUPPLY);
    }

    // ──────────────────────────────────────────────────────
    //  External functions
    // ──────────────────────────────────────────────────────

    /**
     * @notice Transfers ALUT tokens from the owner's wallet to a recipient.
     *
     * @dev Restricted to the contract owner (onlyOwner modifier from OpenZeppelin).
     *      The owner is the wallet that was passed to the constructor, which
     *      already holds the full token supply.
     *
     *      This function is how ALU distributes ownership shares:
     *        — Give 100,000 ALUT to a Faculty Senate committee
     *        — Give 50,000 ALUT to a student leadership body
     *        — Retain 850,000 ALUT under central administration
     *
     * @param recipient The wallet address that will receive the tokens.
     * @param amount    The number of tokens to transfer (in smallest units, 10^18 per token).
     */
    function distributeShares(address recipient, uint256 amount)
        external
        onlyOwner
    {
        require(amount > 0,                 "ALULogoToken: amount must be greater than zero");
        require(recipient != address(0),    "ALULogoToken: cannot transfer to the zero address");

        // transfer() moves tokens from msg.sender (the owner) to recipient
        transfer(recipient, amount);
    }

    /**
     * @notice Returns the ownership percentage held by a wallet address.
     *
     * @dev Calculated as:  (balance × 100) / totalSupply()
     *      Result is truncated to a whole number integer.
     *
     *      Examples:
     *        500,000 ALUT → 50%
     *        100,000 ALUT → 10%
     *          1,000 ALUT →  0%  (rounds down — less than 1%)
     *
     * @param wallet The address to check.
     * @return       The ownership percentage as a whole number (0–100).
     */
    function ownershipPercentage(address wallet)
        external
        view
        returns (uint256)
    {
        uint256 balance = balanceOf(wallet);
        return (balance * 100) / totalSupply();
    }
}
