// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// ============================================================
//  ALUAssetRegistry — ERC-721 Logo Registration Contract
//  African Leadership University | Blockchain Assignment
//
//  This contract registers digital assets (e.g., the ALU logo)
//  on the Ethereum blockchain as non-fungible tokens.
//  Each registered asset is given a unique token ID, and its
//  SHA-256 content hash is stored permanently on-chain so that
//  authenticity can be verified by anyone at any time.
// ============================================================

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ALUAssetRegistry is ERC721, Ownable {

    // ──────────────────────────────────────────────────────
    //  State variables
    // ──────────────────────────────────────────────────────

    /// @dev Counter that tracks the latest token ID.
    ///      Starts at 0 and is incremented before each mint,
    ///      so the first token ID is always 1.
    uint256 private _tokenIdCounter;

    // ──────────────────────────────────────────────────────
    //  Data structures
    // ──────────────────────────────────────────────────────

    /**
     * @dev Stores registration details for a single digital asset.
     *
     * Fields:
     *   assetName        — human-readable name (e.g. "ALU Official Logo")
     *   fileType         — file extension in uppercase (e.g. "PNG")
     *   contentHash      — SHA-256 hash of the actual file, stored as bytes32
     *   registeredBy     — wallet address that called registerAsset()
     *   registrationTime — Unix timestamp recorded at the block of registration
     */
    struct AssetMetadata {
        string  assetName;
        string  fileType;
        bytes32 contentHash;
        address registeredBy;
        uint256 registrationTime;
    }

    // ──────────────────────────────────────────────────────
    //  Mappings
    // ──────────────────────────────────────────────────────

    /// @dev Maps each token ID to its stored metadata.
    ///      Anyone can call getAsset() to read this data.
    mapping(uint256 => AssetMetadata) private _assetData;

    /// @dev Maps a content hash to true once it has been registered.
    ///      Prevents the same file from being registered twice.
    mapping(bytes32 => bool) private _registeredHashes;

    // ──────────────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────────────

    /**
     * @dev Emitted when a new asset is successfully registered.
     * @param tokenId      The NFT token ID assigned to this asset.
     * @param assetName    The name of the registered asset.
     * @param contentHash  The SHA-256 hash of the file.
     * @param registeredBy The wallet address that performed the registration.
     */
    event AssetRegistered(
        uint256 indexed tokenId,
        string          assetName,
        bytes32         contentHash,
        address indexed registeredBy
    );

    // ──────────────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────────────

    /**
     * @dev Sets up the ERC-721 token collection.
     *      Token name: "ALU Asset Registry"
     *      Token symbol: "ALUAR"
     *      The deploying wallet becomes the contract owner.
     */
    constructor() ERC721("ALU Asset Registry", "ALUAR") Ownable(msg.sender) {
        _tokenIdCounter = 0;
    }

    // ──────────────────────────────────────────────────────
    //  External functions
    // ──────────────────────────────────────────────────────

    /**
     * @notice Registers a new digital asset and mints an NFT to the caller.
     *
     * @dev Steps performed internally:
     *      1. Reject the transaction if the content hash already exists.
     *      2. Increment the token ID counter.
     *      3. Mint a new ERC-721 token to msg.sender via _safeMint().
     *      4. Save the AssetMetadata struct to storage.
     *      5. Mark the hash as registered to block future duplicates.
     *      6. Emit an AssetRegistered event.
     *      7. Return the new token ID.
     *
     * @param assetName   A human-readable label for the asset.
     * @param fileType    The file type in uppercase (e.g., "PNG").
     * @param contentHash The SHA-256 hash of the asset file as a bytes32 value.
     * @return            The token ID of the newly minted NFT.
     */
    function registerAsset(
        string  memory assetName,
        string  memory fileType,
        bytes32        contentHash
    ) external returns (uint256) {

        // Guard: reject duplicate registrations
        require(
            !_registeredHashes[contentHash],
            "ALUAssetRegistry: asset with this hash is already registered"
        );

        // Increment counter BEFORE minting (token IDs start at 1)
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        // Mint the NFT to the caller
        _safeMint(msg.sender, newTokenId);

        // Persist the metadata on-chain
        _assetData[newTokenId] = AssetMetadata({
            assetName:        assetName,
            fileType:         fileType,
            contentHash:      contentHash,
            registeredBy:     msg.sender,
            registrationTime: block.timestamp
        });

        // Lock the hash so it cannot be registered again
        _registeredHashes[contentHash] = true;

        // Broadcast the registration event
        emit AssetRegistered(newTokenId, assetName, contentHash, msg.sender);

        return newTokenId;
    }

    /**
     * @notice Checks whether a given file hash matches the hash stored for a token.
     *
     * @dev This is a view function — it only reads blockchain state, costs no gas
     *      when called externally (off-chain), and cannot alter any data.
     *
     * @param tokenId     The token ID of the registered asset to verify against.
     * @param contentHash The hash of the file being tested for authenticity.
     * @return isAuthentic True if the hashes match; false otherwise.
     * @return message     A human-readable result string.
     */
    function verifyLogoIntegrity(
        uint256 tokenId,
        bytes32 contentHash
    ) external view returns (bool isAuthentic, string memory message) {

        require(
            tokenId > 0 && tokenId <= _tokenIdCounter,
            "ALUAssetRegistry: token does not exist"
        );

        if (_assetData[tokenId].contentHash == contentHash) {
            return (true, "Logo is authentic.");
        } else {
            return (false, "Warning: logo does not match.");
        }
    }

    /**
     * @notice Returns the full metadata struct for a registered asset.
     *
     * @dev View function — free to call off-chain.
     *      Reverts if the tokenId has not been minted yet.
     *
     * @param tokenId The token ID to look up.
     * @return        The AssetMetadata struct stored for that token ID.
     */
    function getAsset(uint256 tokenId)
        external
        view
        returns (AssetMetadata memory)
    {
        require(
            tokenId > 0 && tokenId <= _tokenIdCounter,
            "ALUAssetRegistry: token does not exist"
        );
        return _assetData[tokenId];
    }

    /**
     * @notice Returns the total number of assets registered so far.
     * @return The current token ID counter value.
     */
    function totalAssets() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
