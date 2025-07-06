// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./FanToken.sol";
import "../fdc/Web2Json.sol";

/**
 * @title FanBondGame
 * @dev Game logic contract for FanBond Fantasy Platform
 */
contract FanBondGame is Ownable, ReentrancyGuard {

    FanBondToken public immutable fanBondToken;

    uint256 public constant BASE_PRICE = 0.01 ether;
    uint256 public constant CURVE_COEFFICIENT = 0.001 ether;
    uint256 public constant MAX_USER_TOKENS = 11;

    mapping(uint256 => uint256) public tokensSold;
    mapping(uint256 => uint256) public liquidity;
    mapping(address => mapping(uint256 => bool)) public hasMintedPlayer;
    mapping(address => uint256) public totalUserTokens;
    mapping(uint256 => bool) public playerClaimed;
    mapping(address => mapping(uint256 => bool)) public userClaimed;
    mapping(address => uint256) public userNullifiers;

    uint256 public currentSeason;
    bool public seasonActive;
    bool public seasonEnded;

    // Events
    event SeasonInitialized(uint256 season, uint256[] playerIds);
    event SeasonEnded(uint256 season);
    event PlayerMinted(address indexed user, uint256 indexed tokenId, uint256 price, uint256 season);
    event PlayerClaimed(uint256 indexed tokenId, address indexed player, uint256 amount, uint256 tokensBurned);
    event UserClaimed(address indexed user, uint256 indexed tokenId, uint256 amount, uint256 tokensBurned);
    event LiquidityWithdrawn(uint256 indexed tokenId, uint256 amount);
    event PriceCalculated(uint256 indexed tokenId, uint256 price, uint256 sold, uint256 multiplier);
    event PlayerStatsListAddressUpdated(address newAddress);
    event NullifierStored(address indexed user, uint256 nullifier);
    event PlayerVerificationProcessed(
        
        uint256 indexed playerId, 
        address indexed playerAddress, 
        string firstName, 
        string lastName, 
        string dateOfBirth,
        uint256 amountSent
    );
    event UserTokensListed(address indexed user, uint256[] tokenIds, uint256[] amounts);

    // Errors
    error PlayerAlreadyMinted();
    error MaxTokensReached();
    error PlayerNotExists();
    error InsufficientPayment();
    error SeasonNotActive();
    error PlayerSoldOut();
    error InsufficientLiquidity();
    error SeasonAlreadyActive();
    error SeasonNotEnded();
    error AlreadyClaimed();
    error NotPlayerAddress();
    error NoTokensOwned();
    error SeasonStillActive();
    error TokenContractNotSet();
    error ZeroAddress();
    error InvalidPlayerStatsListAddress();
    error PlayerVerificationFailed();
    error NoTokensFound();

    constructor(address _fanBondToken)  Ownable(msg.sender){
        if (_fanBondToken == address(0)) revert ZeroAddress();
        fanBondToken = FanBondToken(_fanBondToken);
        currentSeason = 0;
        seasonActive = true;
        seasonEnded = false;

        // Pre-register 2 players
        fanBondToken.addPlayer(1, 0x38b09fF7F662D02402397653766ed795F9FD8f25);
        fanBondToken.addPlayer(2, 0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99);
    }

    function initializeSeason(uint256[] calldata _playerIds) external onlyOwner {
        if (seasonActive) revert SeasonAlreadyActive();
        currentSeason++;
        seasonActive = true;
        seasonEnded = false;

        for (uint256 i = 0; i < _playerIds.length; i++) {
            uint256 tokenId = _playerIds[i];
            if (!fanBondToken.playerTokenExists(tokenId)) revert PlayerNotExists();
            tokensSold[tokenId] = 0;
            playerClaimed[tokenId] = false;
        }

        emit SeasonInitialized(currentSeason, _playerIds);
    }

    function endSeason() external onlyOwner {
        if (!seasonActive) revert SeasonNotActive();
        seasonActive = false;
        seasonEnded = true;
        emit SeasonEnded(currentSeason);
    }

    function getPrice(uint256 tokenId) public view returns (uint256) {
        if (!fanBondToken.playerTokenExists(tokenId)) revert PlayerNotExists();
        uint256 sold = tokensSold[tokenId];
        uint256 performanceMultiplier = getPerformanceMultiplier(tokenId);
        return BASE_PRICE + (CURVE_COEFFICIENT * sold * sold * performanceMultiplier) / 1e18;
    }

    // Address of the PlayerStatsList contract
    address public playerStatsListAddress;

    /**
     * @notice Sets the address of the PlayerStatsList contract
     * @param _playerStatsListAddress Address of the PlayerStatsList contract
     */
    function setPlayerStatsListAddress(address _playerStatsListAddress) external onlyOwner {
        if (_playerStatsListAddress == address(0)) revert InvalidPlayerStatsListAddress();
        playerStatsListAddress = _playerStatsListAddress;
        emit PlayerStatsListAddressUpdated(_playerStatsListAddress);
    }

    /**
     * @notice Gets the performance multiplier for a player based on their stats
     * @param tokenId The ID of the player token
     * @return performanceMultiplier The performance multiplier scaled to 18 decimals (1e18 = 1.0x)
     */
    function getPerformanceMultiplier(uint256 tokenId) public view returns (uint256) {
        if (playerStatsListAddress == address(0)) {
            return 1e18; // Default to 1.0x if no stats contract is set
        }
        
        try PlayerStatsList(playerStatsListAddress)
            .getCalculatedPerformance(tokenId) returns (uint8 performanceScore) {
            // Scale the performance score (1-10) to 18 decimals
            // Example: score of 5 becomes 0.5e18, score of 10 becomes 1.0e18
            return uint256(performanceScore) * 1e17;
        } catch {
            return 1e18; // Fallback to 1.0x if there's an error
        }
    }

    function mintPlayer(uint256 tokenId, uint256 nullifier) external payable nonReentrant {
        if (!seasonActive) revert SeasonNotActive();
        if (!fanBondToken.playerTokenExists(tokenId)) revert PlayerNotExists();
        if (hasMintedPlayer[msg.sender][tokenId]) revert PlayerAlreadyMinted();
        if (totalUserTokens[msg.sender] >= MAX_USER_TOKENS) revert MaxTokensReached();
        if (tokensSold[tokenId] >= fanBondToken.MAX_TOKENS_PER_PLAYER()) revert PlayerSoldOut();

        uint256 price = getPrice(tokenId);
        if (msg.value < price) revert InsufficientPayment();

        tokensSold[tokenId]++;
        hasMintedPlayer[msg.sender][tokenId] = true;
        totalUserTokens[msg.sender]++;
        liquidity[tokenId] += price;
        
        // Store the nullifier for the user
        userNullifiers[msg.sender] = nullifier;

        fanBondToken.mintTokens(msg.sender, tokenId, 1);

        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit PlayerMinted(msg.sender, tokenId, price, currentSeason);
        emit PriceCalculated(tokenId, price, tokensSold[tokenId], getPerformanceMultiplier(tokenId));
        emit NullifierStored(msg.sender, nullifier);
    }

    function playerClaim(uint256 tokenId) external nonReentrant {
        if (!seasonEnded) revert SeasonNotEnded();
        if (!fanBondToken.playerTokenExists(tokenId)) revert PlayerNotExists();
        address playerAddress = fanBondToken.getPlayerAddress(tokenId);
        if (msg.sender != playerAddress) revert NotPlayerAddress();
        if (playerClaimed[tokenId]) revert AlreadyClaimed();

        uint256 totalLiquidity = liquidity[tokenId];
        uint256 playerShare = (totalLiquidity * 20) / 100;

        playerClaimed[tokenId] = true;

        uint256 circulatingSupply = fanBondToken.totalSupply(tokenId);
        uint256 tokensToBurn = (circulatingSupply * 20) / 100;

        if (tokensToBurn > 0) {
            _burnTokensProportionally(tokenId, tokensToBurn);
        }

        if (playerShare > 0) {
            payable(playerAddress).transfer(playerShare);
        }

        emit PlayerClaimed(tokenId, playerAddress, playerShare, tokensToBurn);
    }

    function userClaim(uint256 tokenId) external nonReentrant {
        if (!seasonEnded) revert SeasonNotEnded();
        if (!fanBondToken.playerTokenExists(tokenId)) revert PlayerNotExists();
        if (!hasMintedPlayer[msg.sender][tokenId]) revert PlayerNotExists();
        if (userClaimed[msg.sender][tokenId]) revert AlreadyClaimed();

        uint256 userTokens = fanBondToken.balanceOf(msg.sender, tokenId);
        if (userTokens == 0) revert NoTokensOwned();

        uint256 totalLiquidity = liquidity[tokenId];
        uint256 userPool = (totalLiquidity * 80) / 100;
        uint256 circulatingSupply = fanBondToken.totalSupply(tokenId);
        uint256 userShare = (userPool * userTokens) / circulatingSupply;

        userClaimed[msg.sender][tokenId] = true;
        totalUserTokens[msg.sender] -= userTokens;
        hasMintedPlayer[msg.sender][tokenId] = false;

        fanBondToken.burnTokens(msg.sender, tokenId, userTokens);

        if (userShare > 0) {
            payable(msg.sender).transfer(userShare);
        }

        emit UserClaimed(msg.sender, tokenId, userShare, userTokens);
    }

    /**
     * @notice Lists all tokens and their counts owned by a specific user
     * @param user The address of the user to check
     * @return tokenIds Array of token IDs that the user owns
     * @return amounts Array of amounts for each token ID
     */
    function getAllUserTokens(address user) external view returns (
        uint256[] memory tokenIds, 
        uint256[] memory amounts
    ) {
        if (totalUserTokens[user] == 0) revert NoTokensFound();
        
        uint256[] memory allPlayerIds = fanBondToken.getAllPlayerIds();
        uint256[] memory tempTokenIds = new uint256[](allPlayerIds.length);
        uint256[] memory tempAmounts = new uint256[](allPlayerIds.length);
        uint256 count = 0;
        
        // Collect all tokens the user owns
        for (uint256 i = 0; i < allPlayerIds.length; i++) {
            uint256 tokenId = allPlayerIds[i];
            uint256 balance = fanBondToken.balanceOf(user, tokenId);
            
            if (balance > 0) {
                tempTokenIds[count] = tokenId;
                tempAmounts[count] = balance;
                count++;
            }
        }
        
        if (count == 0) revert NoTokensFound();
        
        // Create properly sized arrays
        tokenIds = new uint256[](count);
        amounts = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = tempTokenIds[i];
            amounts[i] = tempAmounts[i];
        }
    }

    function _burnTokensProportionally(uint256 tokenId, uint256 totalToBurn) internal {
        emit PlayerClaimed(tokenId, fanBondToken.getPlayerAddress(tokenId), 0, totalToBurn);
    }

    function withdrawLiquidity(uint256 tokenId, uint256 amount) external onlyOwner {
        if (!fanBondToken.playerTokenExists(tokenId)) revert PlayerNotExists();
        if (liquidity[tokenId] < amount) revert InsufficientLiquidity();
        liquidity[tokenId] -= amount;
        payable(owner()).transfer(amount);
        emit LiquidityWithdrawn(tokenId, amount);
    }

    function withdrawAllLiquidity(uint256 tokenId) external onlyOwner {
        if (!fanBondToken.playerTokenExists(tokenId)) revert PlayerNotExists();
        uint256 amount = liquidity[tokenId];
        if (amount == 0) return;
        liquidity[tokenId] = 0;
        payable(owner()).transfer(amount);
        emit LiquidityWithdrawn(tokenId, amount);
    }

    function getGameInfo(uint256 tokenId) external view returns (
        uint256 sold,
        uint256 remaining,
        uint256 currentPrice,
        uint256 liquidityPool,
        uint256 circulatingSupply,
        address playerAddress,
        bool hasPlayerClaimed
    ) {
        if (!fanBondToken.playerTokenExists(tokenId)) revert PlayerNotExists();
        sold = tokensSold[tokenId];
        remaining = fanBondToken.MAX_TOKENS_PER_PLAYER() - sold;
        currentPrice = getPrice(tokenId);
        liquidityPool = liquidity[tokenId];
        circulatingSupply = fanBondToken.totalSupply(tokenId);
        playerAddress = fanBondToken.getPlayerAddress(tokenId);
        hasPlayerClaimed = playerClaimed[tokenId];
    }

    function getUserGameInfo(address user) external view returns (
        uint256 totalTokens,
        uint256[] memory playerTokens,
        uint256[] memory tokenBalances
    ) {
        totalTokens = totalUserTokens[user];
        uint256[] memory allPlayerIds = fanBondToken.getAllPlayerIds();
        uint256[] memory tempTokens = new uint256[](allPlayerIds.length);
        uint256[] memory tempBalances = new uint256[](allPlayerIds.length);
        uint256 count = 0;

        for (uint256 i = 0; i < allPlayerIds.length; i++) {
            uint256 tokenId = allPlayerIds[i];
            uint256 balance = fanBondToken.balanceOf(user, tokenId);
            if (balance > 0) {
                tempTokens[count] = tokenId;
                tempBalances[count] = balance;
                count++;
            }
        }

        playerTokens = new uint256[](count);
        tokenBalances = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            playerTokens[i] = tempTokens[i];
            tokenBalances[i] = tempBalances[i];
        }
    }

    function hasUserClaimed(address user, uint256 tokenId) external view returns (bool) {
        return userClaimed[user][tokenId];
    }

    function hasPlayerClaimed(uint256 tokenId) external view returns (bool) {
        return playerClaimed[tokenId];
    }

    function getSeasonInfo() external view returns (uint256 season, bool active, bool ended) {
        return (currentSeason, seasonActive, seasonEnded);
    }

    function getTotalLiquidity() external view returns (uint256) {
        return address(this).balance;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function handleTransfer(address from, address to, uint256 tokenId, uint256 amount) external {
        if (from != address(0) && from != address(this)) {
            totalUserTokens[from] -= amount;
            if (fanBondToken.balanceOf(from, tokenId) == 0) {
                hasMintedPlayer[from][tokenId] = false;
            }
        }

        if (to != address(0) && to != address(this)) {
            totalUserTokens[to] += amount;
            hasMintedPlayer[to][tokenId] = true;
        }
    }

    /**
     * @notice Processes player verification event and sends 20% share to player address
     * @param playerId The player ID from the verification event
     * @param playerAddress The player's wallet address
     * @param firstName Player's first name from verification
     * @param lastName Player's last name from verification  
     * @param dateOfBirth Player's date of birth in format "DD-MM-YY"
     */
    function processPlayerVerification(
        uint256 playerId,
        address playerAddress,
        string calldata firstName,
        string calldata lastName,
        string calldata dateOfBirth
    ) external nonReentrant {
        if (playerStatsListAddress == address(0)) revert InvalidPlayerStatsListAddress();
        if (!fanBondToken.playerTokenExists(playerId)) revert PlayerNotExists();
        
        // Get player stats from Web2Json contract
        PlayerStats[] memory playerStats = PlayerStatsList(playerStatsListAddress).getPlayerStats(playerId);
        if (playerStats.length == 0) revert PlayerVerificationFailed();
        
        
        // Compare first name (case insensitive)
        
        // Compare date of birth
        // Stats format: "1992-02-05", Verification format: "05-02-92"
        
        // Send 20% share regardless of match results (as requested)
        uint256 totalLiquidity = liquidity[playerId];
        uint256 playerShare = (totalLiquidity * 20) / 100;
        
        if (playerShare > 0) {
            payable(playerAddress).transfer(playerShare);
        }
        
        emit PlayerVerificationProcessed(
            playerId, 
            playerAddress, 
            firstName, 
            lastName, 
            dateOfBirth,
            playerShare
        );
    }
    
    /**
     * @notice Converts string to lowercase
     * @param str Input string
     * @return Lowercase string
     */
    function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
    
    /**
     * @notice Compares two strings
     * @param a First string
     * @param b Second string
     * @return True if strings match
     */
    function _compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
    
    /**
     * @notice Compares date of birth formats
     * @param statsDob Stats format: "1992-02-05"
     * @param verificationDob Verification format: "05-02-92"
     * @return True if month, day, and last two digits of year match
     */
    function _compareDateOfBirth(string memory statsDob, string memory verificationDob) internal pure returns (bool) {
        bytes memory statsBytes = bytes(statsDob);
        bytes memory verificationBytes = bytes(verificationDob);
        
        // Check minimum length requirements
        if (statsBytes.length < 10 || verificationBytes.length < 8) return false;
        
        // Compare month: stats[5-6] vs verification[3-4]
        if (statsBytes[5] != verificationBytes[3] || statsBytes[6] != verificationBytes[4]) return false;
        
        // Compare day: stats[8-9] vs verification[0-1]
        if (statsBytes[8] != verificationBytes[0] || statsBytes[9] != verificationBytes[1]) return false;
        
        // Compare last two digits of year: stats[2-3] vs verification[6-7]
        if (statsBytes[2] != verificationBytes[6] || statsBytes[3] != verificationBytes[7]) return false;
        
        return true;
    }

    /**
     * @notice Retrieves the nullifier for a specific user
     * @param user The address of the user
     * @return nullifier The nullifier value stored for the user
     */
    function getUserNullifier(address user) external view returns (uint256 nullifier) {
        return userNullifiers[user];
    }

    receive() external payable {}
}
