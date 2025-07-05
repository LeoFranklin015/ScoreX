// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {RandomNumberV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/RandomNumberV2Interface.sol";
import {IAssetManager} from "@flarenetwork/flare-periphery-contracts/coston2/IAssetManager.sol";
import {AssetManagerSettings} from "@flarenetwork/flare-periphery-contracts/coston2/data/AssetManagerSettings.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {PlayerStatsList} from "../fdc/Web2Json.sol";

contract FAssetsLottery is ReentrancyGuard, Ownable {
    RandomNumberV2Interface public immutable randomNumberGenerator;
    IAssetManager public immutable assetManager;
    IERC20 public immutable fAssetToken;
    PlayerStatsList public immutable playerStatsList;

    enum Result { Draw, ArrayA, ArrayB }
    enum GameState { Open, Closed, Settled }

    struct Game {
        uint256 gameId;
        address playerA;
        address playerB;
        uint256[5] arrayA;
        uint256[5] arrayB;
        uint256 stakeAmount;
        GameState state;
        Result winner;
        uint256 seed;
        uint256[3] picksA;
        uint256[3] picksB;
        string playerAXrpAddress;
        string playerBXrpAddress;
        bool payoutProcessed;
    }

    mapping(uint256 => Game) public games;
    uint256 public nextGameId = 1;
    uint256 public minStakeAmount;
    uint256 public maxStakeAmount;
    uint256 public feePercentage = 250; // 2.5% fee (in basis points)
    address public feeCollector;

    event GameCreated(uint256 indexed gameId, address indexed playerA, uint256 stakeAmount);
    event GameJoined(uint256 indexed gameId, address indexed playerB);
    event GameSettled(uint256 indexed gameId, Result winner, uint256 seed);
    event PayoutProcessed(uint256 indexed gameId, address winner, uint256 amount);
    event FeeCollected(uint256 indexed gameId, uint256 feeAmount);

    constructor(
        address _randomNumberGenerator,
        address _assetManager,
        address _fAssetToken,
        uint256 _minStakeAmount,
        uint256 _maxStakeAmount,
        address _feeCollector,
        address _playerStatsList
    ) Ownable(msg.sender) {
        randomNumberGenerator = RandomNumberV2Interface(_randomNumberGenerator);
        assetManager = IAssetManager(_assetManager);
        fAssetToken = IERC20(_fAssetToken);
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
        feeCollector = _feeCollector;
        playerStatsList = PlayerStatsList(_playerStatsList);
    }

    modifier onlyGamePlayer(uint256 gameId) {
        require(
            games[gameId].playerA == msg.sender || games[gameId].playerB == msg.sender,
            "Only game players can call this function"
        );
        _;
    }

    modifier gameExists(uint256 gameId) {
        require(games[gameId].gameId != 0, "Game does not exist");
        _;
    }

    modifier gameOpen(uint256 gameId) {
        require(games[gameId].state == GameState.Open, "Game is not open");
        _;
    }

    modifier gameClosed(uint256 gameId) {
        require(games[gameId].state == GameState.Closed, "Game is not closed");
        _;
    }

    function createGame(
        uint256[5] memory arrayA,
        uint256 stakeAmount,
        string memory xrpAddress
    ) external nonReentrant returns (uint256) {
        require(stakeAmount >= minStakeAmount, "Stake amount too low");
        require(stakeAmount <= maxStakeAmount, "Stake amount too high");
        require(bytes(xrpAddress).length > 0, "XRP address required");

        // Transfer FXRP from player A to contract
        require(
            fAssetToken.transferFrom(msg.sender, address(this), stakeAmount),
            "FXRP transfer failed"
        );

        uint256 gameId = nextGameId++;
        games[gameId] = Game({
            gameId: gameId,
            playerA: msg.sender,
            playerB: address(0),
            arrayA: arrayA,
            arrayB: [uint256(0), 0, 0, 0, 0], // Will be set when player B joins
            stakeAmount: stakeAmount,
            state: GameState.Open,
            winner: Result.Draw,
            seed: 0,
            picksA: [uint256(0), 0, 0],
            picksB: [uint256(0), 0, 0],
            playerAXrpAddress: xrpAddress,
            playerBXrpAddress: "",
            payoutProcessed: false
        });

        emit GameCreated(gameId, msg.sender, stakeAmount);
        return gameId;
    }

    function joinGame(
        uint256 gameId,
        uint256[5] memory arrayB,
        string memory xrpAddress
    ) external nonReentrant gameExists(gameId) gameOpen(gameId) {
        require(games[gameId].playerB == address(0), "Game already has two players");
        require(msg.sender != games[gameId].playerA, "Cannot join your own game");
        require(bytes(xrpAddress).length > 0, "XRP address required");

        uint256 stakeAmount = games[gameId].stakeAmount;

        // Transfer FXRP from player B to contract
        require(
            fAssetToken.transferFrom(msg.sender, address(this), stakeAmount),
            "FXRP transfer failed"
        );

        games[gameId].playerB = msg.sender;
        games[gameId].arrayB = arrayB;
        games[gameId].playerBXrpAddress = xrpAddress;
        games[gameId].state = GameState.Closed;

        emit GameJoined(gameId, msg.sender);
    }

    function settleGame(uint256 gameId) external nonReentrant gameExists(gameId) gameClosed(gameId) {
        Game storage game = games[gameId];
        
        // Get random number from Flare's random number generator
        (uint256 randomBase, bool isSecure, ) = randomNumberGenerator.getRandomNumber();
        require(isSecure, "Random number not secure");

        game.seed = randomBase;

        // Select 3 random picks from each array
        uint256[5] memory indices = [uint256(0), 1, 2, 3, 4];

        for (uint256 i = 0; i < 3; i++) {
            uint256 j = i + (uint256(keccak256(abi.encode(game.seed, "A", i))) % (5 - i));
            (indices[i], indices[j]) = (indices[j], indices[i]);
            game.picksA[i] = game.arrayA[indices[i]];
        }

        indices = [uint256(0), 1, 2, 3, 4];
        for (uint256 i = 0; i < 3; i++) {
            uint256 j = i + (uint256(keccak256(abi.encode(game.seed, "B", i))) % (5 - i));
            (indices[i], indices[j]) = (indices[j], indices[i]);
            game.picksB[i] = game.arrayB[indices[i]];
        }

        // Calculate scores using player performance metrics
        uint256 totalScoreA = 0;
        uint256 totalScoreB = 0;

        for (uint256 i = 0; i < 3; i++) {
            // Get performance scores for each selected player ID
            uint8 performanceA = playerStatsList.getCalculatedPerformance(game.picksA[i]);
            uint8 performanceB = playerStatsList.getCalculatedPerformance(game.picksB[i]);
            
            totalScoreA += performanceA;
            totalScoreB += performanceB;
        }

        if (totalScoreA > totalScoreB) {
            game.winner = Result.ArrayA;
        } else if (totalScoreB > totalScoreA) {
            game.winner = Result.ArrayB;
        } else {
            game.winner = Result.Draw;
        }

        game.state = GameState.Settled;

        emit GameSettled(gameId, game.winner, game.seed);
    }

    function processPayout(uint256 gameId) external nonReentrant gameExists(gameId) {
        Game storage game = games[gameId];
        require(game.state == GameState.Settled, "Game not settled");
        require(!game.payoutProcessed, "Payout already processed");

        game.payoutProcessed = true;

        uint256 totalPot = game.stakeAmount * 2;
        uint256 feeAmount = (totalPot * feePercentage) / 10000;
        uint256 payoutAmount = totalPot - feeAmount;

        // Calculate lot size for redemption
        AssetManagerSettings.Data memory settings = assetManager.getSettings();
        uint256 lotSize = settings.lotSizeAMG;
        uint256 lotsToRedeem = payoutAmount / lotSize;

        if (lotsToRedeem > 0) {
            address winner;
            string memory winnerXrpAddress;

            if (game.winner == Result.ArrayA) {
                winner = game.playerA;
                winnerXrpAddress = game.playerAXrpAddress;
            } else if (game.winner == Result.ArrayB) {
                winner = game.playerB;
                winnerXrpAddress = game.playerBXrpAddress;
            } else {
                // Draw - split pot between both players
                uint256 halfPayout = payoutAmount / 2;
                uint256 halfLots = halfPayout / lotSize;
                
                if (halfLots > 0) {
                    // Redeem for player A
                    _redeemFAssets(halfLots, game.playerAXrpAddress);
                    // Redeem for player B
                    _redeemFAssets(halfLots, game.playerBXrpAddress);
                }
                
                emit PayoutProcessed(gameId, game.playerA, halfPayout);
                emit PayoutProcessed(gameId, game.playerB, halfPayout);
                return;
            }

            // Redeem FAssets for the winner
            _redeemFAssets(lotsToRedeem, winnerXrpAddress);
            emit PayoutProcessed(gameId, winner, payoutAmount);
        }

        // Transfer fee to fee collector
        if (feeAmount > 0) {
            require(
                fAssetToken.transfer(feeCollector, feeAmount),
                "Fee transfer failed"
            );
            emit FeeCollected(gameId, feeAmount);
        }
    }

    // Alternative function to pay out in FXRP instead of redeeming to XRP
    function processPayoutInFXRP(uint256 gameId) external nonReentrant gameExists(gameId) {
        Game storage game = games[gameId];
        require(game.state == GameState.Settled, "Game not settled");
        require(!game.payoutProcessed, "Payout already processed");

        game.payoutProcessed = true;

        uint256 totalPot = game.stakeAmount * 2;
        uint256 feeAmount = (totalPot * feePercentage) / 10000;
        uint256 payoutAmount = totalPot - feeAmount;

        address winner;

        if (game.winner == Result.ArrayA) {
            winner = game.playerA;
        } else if (game.winner == Result.ArrayB) {
            winner = game.playerB;
        } else {
            // Draw - split pot between both players
            uint256 halfPayout = payoutAmount / 2;
            
            // Transfer FXRP to player A
            require(
                fAssetToken.transfer(game.playerA, halfPayout),
                "FXRP transfer to player A failed"
            );
            
            // Transfer FXRP to player B
            require(
                fAssetToken.transfer(game.playerB, halfPayout),
                "FXRP transfer to player B failed"
            );
            
            emit PayoutProcessed(gameId, game.playerA, halfPayout);
            emit PayoutProcessed(gameId, game.playerB, halfPayout);
            
            // Transfer fee to fee collector
            if (feeAmount > 0) {
                require(
                    fAssetToken.transfer(feeCollector, feeAmount),
                    "Fee transfer failed"
                );
                emit FeeCollected(gameId, feeAmount);
            }
            return;
        }

        // Transfer FXRP to the winner
        require(
            fAssetToken.transfer(winner, payoutAmount),
            "FXRP transfer to winner failed"
        );
        emit PayoutProcessed(gameId, winner, payoutAmount);

        // Transfer fee to fee collector
        if (feeAmount > 0) {
            require(
                fAssetToken.transfer(feeCollector, feeAmount),
                "Fee transfer failed"
            );
            emit FeeCollected(gameId, feeAmount);
        }
    }

    function _redeemFAssets(uint256 lots, string memory xrpAddress) internal {
        // Approve AssetManager to spend FXRP
        require(
            fAssetToken.approve(address(assetManager), lots * assetManager.getSettings().lotSizeAMG),
            "AssetManager approval failed"
        );

        // Redeem FAssets to XRP
        assetManager.redeem(
            lots,
            xrpAddress,
            payable(address(0))
        );
    }

    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    function getSettings() external view returns (uint256 lotSizeAMG, uint256 assetDecimals) {
        AssetManagerSettings.Data memory settings = assetManager.getSettings();
        return (settings.lotSizeAMG, settings.assetDecimals);
    }

    // Admin functions
    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%");
        feePercentage = _feePercentage;
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
    }

    function setStakeLimits(uint256 _minStakeAmount, uint256 _maxStakeAmount) external onlyOwner {
        require(_minStakeAmount < _maxStakeAmount, "Invalid stake limits");
        minStakeAmount = _minStakeAmount;
        maxStakeAmount = _maxStakeAmount;
    }

    // Emergency function to withdraw stuck FXRP (only owner)
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        IERC20(token).transfer(owner(), amount);
    }
} 