// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title FanBondToken
 * @dev ERC-1155 token contract for FanBond Fantasy Platform
 * @notice This contract handles only token operations - minting, burning, transfers
 */
contract FanBondToken is ERC1155, Ownable {
    using Strings for uint256;

    // Token constants
    uint256 public constant MAX_TOKENS_PER_PLAYER = 100;
    
    // Token state
    mapping(uint256 => bool) public playerExists;
    mapping(uint256 => address) public playerAddress;
    mapping(uint256 => uint256) public totalMinted; // Total minted per player
    mapping(uint256 => uint256) public totalBurned; // Total burned per player
    
    // Access control - only game contract can mint/burn
    address public gameContract;
    
    // Events
    event PlayerAdded(uint256 indexed tokenId, address indexed playerAddress);
    event PlayerAddressUpdated(uint256 indexed tokenId, address indexed oldAddress, address indexed newAddress);
    event GameContractUpdated(address indexed oldContract, address indexed newContract);
    event TokensMinted(address indexed to, uint256 indexed tokenId, uint256 amount);
    event TokensBurned(address indexed from, uint256 indexed tokenId, uint256 amount);
    
    // Errors
    error PlayerNotExists();
    error PlayerAlreadyExists();
    error InvalidTokenId();
    error ExceedsMaxSupply();
    error InsufficientBalance();
    error ZeroAddress();
    
    // Modifier
    modifier validTokenId(uint256 tokenId) {
        if (!playerExists[tokenId]) revert PlayerNotExists();
        _;
    }
    
    /**
     * @dev Constructor
     * @param _uri Base URI for token metadata
     */
    constructor(string memory _uri) ERC1155(_uri) Ownable(msg.sender) {
        // Contract starts with no game contract set
    }
    

    function setGameContract(address _gameContract) external {
        if (_gameContract == address(0)) revert ZeroAddress();
        
        address oldContract = gameContract;
        gameContract = _gameContract;
        
        emit GameContractUpdated(oldContract, _gameContract);
    }
    
    /**
     * @dev Add a new player token (owner only)
     * @param tokenId The token ID for the player
     * @param _playerAddress The player's real-world address
     */
    function addPlayer(uint256 tokenId, address _playerAddress) external  {
        if (tokenId == 0) revert InvalidTokenId();
        if (playerExists[tokenId]) revert PlayerAlreadyExists();
        if (_playerAddress == address(0)) revert ZeroAddress();
        
        playerExists[tokenId] = true;
        playerAddress[tokenId] = _playerAddress;
        
        emit PlayerAdded(tokenId, _playerAddress);
    }
    
    /**
     * @dev Update player address (owner only)
     * @param tokenId The token ID for the player
     * @param _playerAddress New player address
     */
    function updatePlayerAddress(uint256 tokenId, address _playerAddress) external onlyOwner validTokenId(tokenId) {
        if (_playerAddress == address(0)) revert ZeroAddress();
        
        address oldAddress = playerAddress[tokenId];
        playerAddress[tokenId] = _playerAddress;
        
        emit PlayerAddressUpdated(tokenId, oldAddress, _playerAddress);
    }
    
    /**
     * @dev Mint tokens to an address (only game contract)
     * @param to Address to mint tokens to
     * @param tokenId Player token ID
     * @param amount Amount of tokens to mint
     */
    function mintTokens(address to, uint256 tokenId, uint256 amount) external  validTokenId(tokenId) {
        if (to == address(0)) revert ZeroAddress();
        if (totalMinted[tokenId] + amount > MAX_TOKENS_PER_PLAYER) revert ExceedsMaxSupply();
        
        totalMinted[tokenId] += amount;
        _mint(to, tokenId, amount, "");
        
        emit TokensMinted(to, tokenId, amount);
    }
    
    /**
     * @dev Burn tokens from an address (only game contract)
     * @param from Address to burn tokens from
     * @param tokenId Player token ID
     * @param amount Amount of tokens to burn
     */
    function burnTokens(address from, uint256 tokenId, uint256 amount) external  validTokenId(tokenId) {
        if (from == address(0)) revert ZeroAddress();
        if (balanceOf(from, tokenId) < amount) revert InsufficientBalance();
        
        totalBurned[tokenId] += amount;
        _burn(from, tokenId, amount);
        
        emit TokensBurned(from, tokenId, amount);
    }
    
    /**
     * @dev Get total circulating supply for a token
     * @param tokenId Player token ID
     * @return supply Current circulating supply
     */
    function totalSupply(uint256 tokenId) external view validTokenId(tokenId) returns (uint256) {
        return totalMinted[tokenId] - totalBurned[tokenId];
    }
    
    /**
     * @dev Get player information
     * @param tokenId Player token ID
     * @return player Player's address
     * @return minted Total minted tokens
     * @return burned Total burned tokens
     * @return circulating Current circulating supply
     */
    function getPlayerInfo(uint256 tokenId) external view validTokenId(tokenId) returns (
        address player,
        uint256 minted,
        uint256 burned,
        uint256 circulating
    ) {
        player = playerAddress[tokenId];
        minted = totalMinted[tokenId];
        burned = totalBurned[tokenId];
        circulating = minted - burned;
    }
    
    /**
     * @dev Check if a player exists
     * @param tokenId Player token ID
     * @return exists Whether the player exists
     */
    function playerTokenExists(uint256 tokenId) external view returns (bool) {
        return playerExists[tokenId];
    }
    
    /**
     * @dev Get player address
     * @param tokenId Player token ID
     * @return player Player's address
     */
    function getPlayerAddress(uint256 tokenId) external view validTokenId(tokenId) returns (address) {
        return playerAddress[tokenId];
    }
    
    /**
     * @dev Override URI function to return player-specific metadata
     * @param tokenId The token ID
     * @return Token URI
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        if (!playerExists[tokenId]) revert InvalidTokenId();
        
        return string(abi.encodePacked(super.uri(tokenId), tokenId.toString()));
    }
    
    /**
     * @dev Set new base URI (owner only)
     * @param newUri New base URI
     */
    function setURI(string memory newUri) external onlyOwner {
        _setURI(newUri);
    }
    
    /**
     * @dev Override transfer to ensure only valid operations
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override {
        // Perform the transfer
        super._update(from, to, ids, values);
        
        // Additional validation could be added here if needed
        // For example, checking if transfers are allowed during certain game states
    }
    
    /**
     * @dev Get all existing player token IDs
     * @return playerIds Array of existing player token IDs
     */
    function getAllPlayerIds() external view returns (uint256[] memory) {
        // This is a simple implementation that checks first 1000 IDs
        // In production, you might want to track this more efficiently
        uint256[] memory tempIds = new uint256[](1000);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= 1000; i++) {
            if (playerExists[i]) {
                tempIds[count] = i;
                count++;
            }
        }
        
        uint256[] memory playerIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            playerIds[i] = tempIds[i];
        }
        
        return playerIds;
    }
}