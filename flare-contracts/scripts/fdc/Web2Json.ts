import { run, web3 } from "hardhat";
import { PlayerStatsListInstance } from "../../typechain-types";
import { prepareAttestationRequestBase, submitAttestationRequest, retrieveDataAndProofBaseWithRetry } from "./Base";
import * as fs from "fs";
import * as path from "path";

/**
 * Web2Json Script for Player Stats
 * 
 * This script can reuse an existing deployed PlayerStatsList contract in several ways:
 * 
 * 1. Set PLAYER_STATS_LIST_ADDRESS environment variable:
 *    PLAYER_STATS_LIST_ADDRESS=0x1234... npm run script:web2json
 * 
 * 2. The script will automatically load the address from deployments/player-stats-list.json
 *    if no environment variable is set
 * 
 * 3. If neither is available, the script will deploy a new contract and save its address
 * 
 * This prevents unnecessary contract deployments and saves gas costs.
 */

const PlayerStatsList = artifacts.require("PlayerStatsList");

const { WEB2JSON_VERIFIER_URL_TESTNET, VERIFIER_API_KEY_TESTNET, COSTON2_DA_LAYER_URL, PLAYER_STATS_LIST_ADDRESS } = process.env;

const apiUrl = "https://v3.football.api-sports.io/players";
const postProcessJq = `{
  player: (.response[0]).player.id,
  firstname:  ((.response[0]).player).firstname,
  lastname:  ((.response[0]).player).lastname,
  age: (((.response[0]).player).birth).date,
  nationality: ((.response[0]).player).nationality,
  teamname: (((.response[0]).statistics)[0]).team.name,
  position: (((.response[0]).statistics)[0]).games.position,

  goals: (((.response[0]).statistics) | map(.goals.total)[0] // 0),
  assists: (((.response[0]).statistics) | map(.goals.assists)[0] // 0),

  fouls_drawn: (((.response[0]).statistics) | map(.fouls.drawn)[0] // 0),
  fouls_committed: (((.response[0]).statistics) | map(.fouls.committed)[0] // 0),

  yellow_cards: (((.response[0]).statistics) | map(.cards.yellow )[0] // 0),
  yellowred_cards: (((.response[0]).statistics) | map(.cards.yellowred )[0] // 0),
  red_cards: (((.response[0]).statistics) | map(.cards.red )[0] // 0),

  passes_total: (((.response[0]).statistics) | map(.passes.total )[0] // 0),
  passes_key: (((.response[0]).statistics) | map(.passes.key )[0] // 0),
  passes_accuracy: (((.response[0]).statistics) | map(.passes.accuracy )[0] // 0),

  penalties_scored: (((.response[0]).statistics) | map(.penalty.scored )[0] // 0),
  penalties_missed: (((.response[0]).statistics) | map(.penalty.missed )[0] // 0),

  minutes: (((.response[0]).statistics) | map(.games.minutes )[0] // 0),
  appearances: (((.response[0]).statistics) | map(.games.appearences )[0] // 0),

  shots_total: (((.response[0]).statistics) | map(.shots.total )[0] // 0),
  shots_on_target: (((.response[0]).statistics) | map(.shots.on )[0] // 0),

  dribble_attempts: (((.response[0]).statistics) | map(.dribbles.attempts )[0] // 0),
  dribble_success: (((.response[0]).statistics) | map(.dribbles.success )[0] // 0),

  tackles_total: (((.response[0]).statistics) | map(.tackles.total )[0] // 0),
  tackles_blocks: (((.response[0]).statistics) | map(.tackles.blocks )[0] // 0),
  tackles_interceptions: (((.response[0]).statistics) | map(.tackles.interceptions )[0] // 0),

  duels_total: (((.response[0]).statistics) | map(.duels.total )[0] // 0),
  duels_won: (((.response[0]).statistics) | map(.duels.won )[0] // 0),

  substitutes_in: (((.response[0]).statistics) | map(.substitutes.in )[0] // 0),
  substitutes_out: (((.response[0]).statistics) | map(.substitutes.out )[0] // 0),
  substitutes_bench: (((.response[0]).statistics) | map(.substitutes.bench )[0] // 0)
}
`;
const httpMethod = "GET";
// Defaults to "Content-Type": "application/json"
const headers = `{"x-rapidapi-host": "v3.football.api-sports.io","x-rapidapi-key": "${process.env.API_FOOTBALL_KEY}"}`;
const queryParams = JSON.stringify({id : 2, season : 2019});
const body = "{}";
const abiSignature = `{
  "name": "playerStats",
  "type": "tuple",
  "components": [
    { "name": "player", "type": "uint256" },
    { "name": "firstname", "type": "string" },
    { "name": "lastname", "type": "string" },
    { "name": "age", "type": "string" },
    { "name": "nationality", "type": "string" },
    { "name": "teamname", "type": "string" },
    { "name": "position", "type": "string" },

    { "name": "goals", "type": "uint256" },
    { "name": "assists", "type": "uint256" },

    { "name": "fouls_drawn", "type": "uint256" },
    { "name": "fouls_committed", "type": "uint256" },

    { "name": "yellow_cards", "type": "uint256" },
    { "name": "yellowred_cards", "type": "uint256" },
    { "name": "red_cards", "type": "uint256" },

    { "name": "passes_total", "type": "uint256" },
    { "name": "passes_key", "type": "uint256" },
    { "name": "passes_accuracy", "type": "uint256" },

    { "name": "penalties_scored", "type": "uint256" },
    { "name": "penalties_missed", "type": "uint256" },

    { "name": "minutes", "type": "uint256" },
    { "name": "appearances", "type": "uint256" },

    { "name": "shots_total", "type": "uint256" },
    { "name": "shots_on_target", "type": "uint256" },

    { "name": "dribble_attempts", "type": "uint256" },
    { "name": "dribble_success", "type": "uint256" },

    { "name": "tackles_total", "type": "uint256" },
    { "name": "tackles_blocks", "type": "uint256" },
    { "name": "tackles_interceptions", "type": "uint256" },

    { "name": "duels_total", "type": "uint256" },
    { "name": "duels_won", "type": "uint256" },

    { "name": "substitutes_in", "type": "uint256" },
    { "name": "substitutes_out", "type": "uint256" },
    { "name": "substitutes_bench", "type": "uint256" }
  ]
}
`;

// Configuration constants
const attestationTypeBase = "Web2Json";
const sourceIdBase = "PublicWeb2";
const verifierUrlBase = WEB2JSON_VERIFIER_URL_TESTNET;

async function prepareAttestationRequest(apiUrl: string, postProcessJq: string, abiSignature: string) {
    const requestBody = {
        url: apiUrl,
        httpMethod: httpMethod,
        headers: headers,
        queryParams: queryParams,
        body: body,
        postProcessJq: postProcessJq,
        abiSignature: abiSignature,
    };

    const url = `${verifierUrlBase}Web2Json/prepareRequest`;
    const apiKey = VERIFIER_API_KEY_TESTNET;

    return await prepareAttestationRequestBase(url, apiKey, attestationTypeBase, sourceIdBase, requestBody);
}

async function retrieveDataAndProof(abiEncodedRequest: string, roundId: number) {
    const url = `${COSTON2_DA_LAYER_URL}api/v1/fdc/proof-by-request-round-raw`;
    console.log("Url:", url, "n");
    return await retrieveDataAndProofBaseWithRetry(url, abiEncodedRequest, roundId);
}

async function loadContractAddressFromFile(): Promise<string | null> {
    try {
        const filePath = path.join(__dirname, "../../deployments/player-stats-list.json");
        if (fs.existsSync(filePath)) {
            const deploymentInfo = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log("Found saved contract address:", deploymentInfo.address);
            return deploymentInfo.address;
        }
    } catch (error) {
        console.log("Could not load saved contract address:", error);
    }
    return null;
}

async function getDeployedContract(): Promise<PlayerStatsListInstance> {
    if (PLAYER_STATS_LIST_ADDRESS) {
        console.log("Using existing PlayerStatsList contract at:", PLAYER_STATS_LIST_ADDRESS);
        return await PlayerStatsList.at(PLAYER_STATS_LIST_ADDRESS);
    } else {
        // Try to load from saved file
        const savedAddress = await loadContractAddressFromFile();
        if (savedAddress) {
            console.log("Using saved PlayerStatsList contract at:", savedAddress);
            return await PlayerStatsList.at(savedAddress);
        } else {
            console.log("No PLAYER_STATS_LIST_ADDRESS provided and no saved address found, deploying new contract...");
            return await deployAndVerifyContract();
        }
    }
}

async function saveContractAddress(address: string) {
    const deploymentInfo = {
        contractName: "PlayerStatsList",
        address: address,
        deployedAt: new Date().toISOString(),
        network: process.env.NETWORK || "unknown"
    };
    
    const deploymentPath = path.join(__dirname, "../../deployments");
    if (!fs.existsSync(deploymentPath)) {
        fs.mkdirSync(deploymentPath, { recursive: true });
    }
    
    const filePath = path.join(deploymentPath, "player-stats-list.json");
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("Contract address saved to:", filePath);
    console.log("Set PLAYER_STATS_LIST_ADDRESS=" + address + " to reuse this contract");
}

async function deployAndVerifyContract() {
    const args: any[] = [];
    const characterList: PlayerStatsListInstance = await PlayerStatsList.new(...args);
    try {
        await run("verify:verify", {
            address: characterList.address,
            constructorArguments: args,
        });
    } catch (e: any) {
        console.log(e);
    }
    console.log("PlayerStatsList deployed to", characterList.address, "\n");
    
    // Save the contract address for future use
    await saveContractAddress(characterList.address);
    
    return characterList;
}

async function interactWithContract(characterList: PlayerStatsListInstance, proof: any) {
    console.log("Proof hex:", proof.response_hex, "\n");

    // A piece of black magic that allows us to read the response type from an artifact
    const IWeb2JsonVerification = await artifacts.require("IWeb2JsonVerification");
    const responseType = IWeb2JsonVerification._json.abi[0].inputs[0].components[1];
    console.log("Response type:", responseType, "\n");

    const decodedResponse = web3.eth.abi.decodeParameter(responseType, proof.response_hex);
    console.log("Decoded proof:", decodedResponse, "\n");
    const transaction = await characterList.addPlayer({
        merkleProof: proof.proof,
        data: decodedResponse,
    });
    console.log("Transaction:", transaction.tx, "\n");
    console.log("Player Stats:\n", await characterList.getPlayerPerformance(276), "\n");
}

async function main() {
    const data = await prepareAttestationRequest(apiUrl, postProcessJq, abiSignature);
    console.log("Data:", data, "\n");

    const abiEncodedRequest = data.abiEncodedRequest;
    const roundId = await submitAttestationRequest(abiEncodedRequest);

    const proof = await retrieveDataAndProof(abiEncodedRequest, roundId);

    // Use existing deployed contract instead of deploying new one
    const characterList: PlayerStatsListInstance = await getDeployedContract();

    await interactWithContract(characterList, proof);
}

void main().then(() => {
    process.exit(0);
});
