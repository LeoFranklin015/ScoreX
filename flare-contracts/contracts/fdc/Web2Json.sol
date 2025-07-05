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
}
