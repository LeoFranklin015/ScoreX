// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IWeb2Json} from "@flarenetwork/flare-periphery-contracts/coston2/IWeb2Json.sol";

struct PlayerStats {
    uint256 player;
    string firstname;
    string lastname;
    uint256 age;
    string nationality;
    string teamname;
    string position;
    uint256 goals;
    uint256 assists;
    uint256 fouls_drawn;
    uint256 fouls_committed;
    uint256 yellow_cards;
    uint256 yellowred_cards;
    uint256 red_cards;
    uint256 passes_total;
    uint256 passes_key;
    uint256 passes_accuracy;
    uint256 penalties_scored;
    uint256 penalties_missed;
    uint256 minutesPlayed;
    uint256 appearances;
    uint256 shots_total;
    uint256 shots_on_target;
    uint256 dribble_attempts;
    uint256 dribble_success;
    uint256 tackles_total;
    uint256 tackles_blocks;
    uint256 tackles_interceptions;
    uint256 duels_total;
    uint256 duels_won;
    uint256 substitutes_in;
    uint256 substitutes_out;
    uint256 substitutes_bench;
}

interface IPlayerStatsList {
    function addPlayer(IWeb2Json.Proof calldata data) external;
    function getAllPlayers() external view returns (PlayerStats[] memory);
}

contract PlayerStatsList {
    mapping(uint256 => PlayerStats[]) public players;
    uint256[] public playerIds;
    
    // Constructor to initialize with sample data
    constructor() {
        // Sample player data
        PlayerStats memory samplePlayer = PlayerStats({
            player: 1,
            firstname: "Lionel",
            lastname: "Messi",
            age: 36,
            nationality: "Argentina",
            teamname: "Inter Miami",
            position: "attacker",
            goals: 25,
            assists: 15,
            fouls_drawn: 45,
            fouls_committed: 12,
            yellow_cards: 2,
            yellowred_cards: 0,
            red_cards: 0,
            passes_total: 1200,
            passes_key: 85,
            passes_accuracy: 88, // percentage
            penalties_scored: 5,
            penalties_missed: 1,
            minutesPlayed: 2500,
            appearances: 30,
            shots_total: 110,
            shots_on_target: 55,
            dribble_attempts: 180,
            dribble_success: 120,
            tackles_total: 15,
            tackles_blocks: 8,
            tackles_interceptions: 12,
            duels_total: 200,
            duels_won: 130,
            substitutes_in: 2,
            substitutes_out: 5,
            substitutes_bench: 1
        });
        
        // Add the sample player to storage
        players[1].push(samplePlayer);
        playerIds.push(1);
    }

    function addPlayer(IWeb2Json.Proof calldata data) public {
        require(isJsonApiProofValid(data), "Invalid proof");
        PlayerStats memory stats = abi.decode(
            data.data.responseBody.abiEncodedData,
            (PlayerStats)
        );
        if (players[stats.player].length == 0) {
            playerIds.push(stats.player);
        }
        players[stats.player].push(stats);
    }
    function getPlayerStats(uint256 playerId) public view returns (PlayerStats[] memory) {
        return players[playerId];
    }

    function getAllPlayerIds() public view returns (uint256[] memory) {
        return playerIds;
    }

    function abiSignatureHack(PlayerStats calldata stats) public pure {}

    function isJsonApiProofValid(
        IWeb2Json.Proof calldata _proof
    ) private view returns (bool) {
        return ContractRegistry.getFdcVerification().verifyJsonApi(_proof);
    }
        function getPlayerPerformance(uint256 playerId) public view returns (uint256, uint8) {
        PlayerStats[] storage statsList = players[playerId];
        require(statsList.length > 0, "No stats available for player");

        // FIX: Use memory instead of storage for read-only access
        PlayerStats memory latestStats = statsList[statsList.length - 1];
        uint8 perf = calculatePerformance(latestStats);
        return (playerId, perf);
    }
    function getCalculatedPerformance(uint256 playerId) public view returns (uint8) {
        PlayerStats[] storage statsList = players[playerId];
        require(statsList.length > 0, "No stats for player");
        PlayerStats memory latest = statsList[statsList.length - 1];
        return calculatePerformance(latest);
    }

    function calculatePerformance(PlayerStats memory stats) public pure returns (uint8) {
        uint256 score = 0;
        // Position comparison (this part is correct)
        bytes32 pos = keccak256(abi.encodePacked(toLower(stats.position)));
        if (pos == keccak256(abi.encodePacked("attacker"))) {
            score = 5 * stats.goals +
                    3 * stats.assists +
                    2 * stats.shots_on_target +
                    2 * stats.dribble_success +
                    1 * stats.duels_won +
                    stats.passes_accuracy / 10; // This is fine - integer division
            // Cap and scale
            if (score > 100) score = 100;
            score = score / 10;
        } else if (pos == keccak256(abi.encodePacked("defender"))) {
            // This logic is correct for handling negative values
            int256 tempScore = int256(
                4 * stats.tackles_total +
                3 * stats.tackles_interceptions +
                3 * stats.tackles_blocks +
                2 * stats.duels_won +
                stats.passes_accuracy / 10
            ) - int256(2 * stats.fouls_committed);
            if (tempScore < 0) tempScore = 0;
            if (tempScore > 100) tempScore = 100;
            score = uint256(tempScore) / 10;
        } else if (pos == keccak256(abi.encodePacked("goalkeeper"))) {
            // ISSUE: This goalkeeper logic is problematic
            // Better goalkeeper metrics would include saves, clean sheets, etc.
            uint256 foulsFactor = stats.fouls_committed > 100 ? 0 : 100 - stats.fouls_committed;
            uint256 yellowPenalty = stats.yellow_cards * 10;
            uint256 yellowFactor = yellowPenalty > 100 ? 0 : 100 - yellowPenalty;
            score = (10 * foulsFactor + 5 * yellowFactor) / 100;
            if (score > 100) score = 100;
            score = score / 10;
        } else if (pos == keccak256(abi.encodePacked("midfielder"))) {
            score = 3 * stats.goals +
                    4 * stats.assists +
                    3 * stats.passes_key +
                    1 * stats.passes_accuracy / 10 +
                    1 * stats.duels_won +
                    1 * stats.dribble_success;
            if (score > 100) score = 100;
            score = score / 10;
        } else {
            // Default calculation
            score = (stats.goals + stats.assists + stats.passes_accuracy / 10 + stats.duels_won) / 4;
            if (score < 1) score = 1;
            else if (score > 10) score = 10;
            return uint8(score);
        }
        // Final bounds checking
        if (score < 1) score = 1;
        if (score > 10) score = 10;
        return uint8(score);
    }

    // Helper function to lowercase a string (ASCII only)
    function toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // Uppercase character...
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
} // End of contract
