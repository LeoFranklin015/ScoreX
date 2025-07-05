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

    // Events
    event PlayerStatsListAddressUpdated(address newAddress);

    // Errors
    error InvalidPlayerStatsListAddress();

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
        
        try PlayerStatsList(playerStatsListAddress).getCalculatedPerformance(tokenId) returns (uint8 performanceScore) {
            // Scale the performance score (1-10) to 18 decimals
            // Example: score of 5 becomes 0.5e18, score of 10 becomes 1.0e18
            return uint256(performanceScore) * 1e17;
        } catch {
            return 1e18; // Fallback to 1.0x if there's an error
        }
    }

    function mintPlayer(uint256 tokenId) external payable nonReentrant {
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

        fanBondToken.mintTokens(msg.sender, tokenId, 1);

        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit PlayerMinted(msg.sender, tokenId, price, currentSeason);
        emit PriceCalculated(tokenId, price, tokensSold[tokenId], getPerformanceMultiplier(tokenId));
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

    receive() external payable {}
}
