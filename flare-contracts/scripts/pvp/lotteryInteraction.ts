import { ethers } from "hardhat";
import { formatUnits, parseUnits, Wallet } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// yarn hardhat run scripts/fassets/lotteryInteraction.ts --network coston2

// Contract addresses (update these after deployment)
const LOTTERY_CONTRACT_ADDRESS = "0x7268eAfbb4ACb4E0D862AC5a0f6BFc57c0CcAd9A"; // Replace with deployed address
const FXRP_ADDRESS = "0x8b4abA9C4BD7DD961659b02129beE20c6286e17F"; // Replace with actual FXRP address

// Test parameters
const STAKE_AMOUNT = parseUnits("10", 6); // 10 FXRP
const PLAYER_A_XRP_ADDRESS = "rs73JwN79hC7fHBmWqY9pjpEYMCew4r2Sa";
const PLAYER_B_XRP_ADDRESS = "r3odmxjpqHwqEFRCWAxyPW1pfHP1682GB3";

// Load private keys from environment
const PRIVATE_KEY1 = process.env.PRIVATE_KEY1!;
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2!;

// Create wallet instances
const provider = ethers.provider;
const playerA = new Wallet(PRIVATE_KEY1, provider);
const playerB = new Wallet(PRIVATE_KEY2, provider);

async function approveFXRP(amount: string, wallet: Wallet) {
    console.log(`Approving FXRP for lottery contract with wallet ${wallet.address}...`);
    
    // Use ethers to get the FXRP contract
    const fxrp = await ethers.getContractAt("IERC20", FXRP_ADDRESS, wallet);
    
    const approveTx = await fxrp.approve(LOTTERY_CONTRACT_ADDRESS, amount);
    const receipt = await approveTx.wait();
    
    console.log("FXRP approval transaction:", approveTx.hash);
    console.log("FXRP approval completed");
}

async function createGame() {
    console.log("\n=== Creating Game ===");
    
    // Approve FXRP first for Player A
    await approveFXRP(STAKE_AMOUNT.toString(), playerA);
    
    // Create array A with random numbers
    const arrayA = [100, 200, 300, 400, 500];
    
    const lottery = await ethers.getContractAt("FAssetsLottery", LOTTERY_CONTRACT_ADDRESS, playerA);
    
    const createTx = await lottery.createGame(arrayA, STAKE_AMOUNT, PLAYER_A_XRP_ADDRESS);
    const receipt = await createTx.wait();
    
    console.log("Game created successfully!");
    console.log("Transaction hash:", createTx.hash);
    
    // Get the latest game ID by checking the nextGameId
    const nextGameId = await lottery.nextGameId();
    const gameId = nextGameId - 1n; // The game we just created
    
    console.log("Game ID:", gameId.toString());
    console.log("Stake amount:", formatUnits(STAKE_AMOUNT, 6), "FXRP");
    console.log("Player A address:", playerA.address);
    
    return Number(gameId);
}

async function joinGame(gameId: number) {
    console.log("\n=== Joining Game ===");
    
    // Approve FXRP first for Player B
    await approveFXRP(STAKE_AMOUNT.toString(), playerB);
    
    // Create array B with different random numbers
    const arrayB = [150, 250, 350, 450, 550];
    
    const lottery = await ethers.getContractAt("FAssetsLottery", LOTTERY_CONTRACT_ADDRESS, playerB);
    
    const joinTx = await lottery.joinGame(gameId, arrayB, PLAYER_B_XRP_ADDRESS);
    const receipt = await joinTx.wait();
    
    console.log("Game joined successfully!");
    console.log("Transaction hash:", joinTx.hash);
    console.log("Player B address:", playerB.address);
}

async function settleGame(gameId: number) {
    console.log("\n=== Settling Game ===");
    
    // Anyone can settle the game, so we'll use Player A
    const lottery = await ethers.getContractAt("FAssetsLottery", LOTTERY_CONTRACT_ADDRESS, playerA);
    
    const settleTx = await lottery.settleGame(gameId);
    const receipt = await settleTx.wait();
    
    console.log("Game settled successfully!");
    console.log("Transaction hash:", settleTx.hash);
}

async function processPayout(gameId: number) {
    console.log("\n=== Processing Payout (XRP) ===");
    
    // Anyone can process the payout, so we'll use Player A
    const lottery = await ethers.getContractAt("FAssetsLottery", LOTTERY_CONTRACT_ADDRESS, playerA);
    
    const payoutTx = await lottery.processPayout(gameId);
    const receipt = await payoutTx.wait();
    
    console.log("Payout processed successfully!");
    console.log("Transaction hash:", payoutTx.hash);
    console.log("Note: FXRP was redeemed to XRP and sent to winner's XRPL address");
}

async function processPayoutInFXRP(gameId: number) {
    console.log("\n=== Processing Payout (FXRP) ===");
    
    // Anyone can process the payout, so we'll use Player A
    const lottery = await ethers.getContractAt("FAssetsLottery", LOTTERY_CONTRACT_ADDRESS, playerA);
    
    const payoutTx = await lottery.processPayoutInFXRP(gameId);
    const receipt = await payoutTx.wait();
    
    console.log("FXRP payout processed successfully!");
    console.log("Transaction hash:", payoutTx.hash);
    console.log("Note: FXRP was transferred directly to winner's wallet");
}

async function getGameInfo(gameId: number) {
    console.log("\n=== Game Information ===");
    
    const lottery = await ethers.getContractAt("FAssetsLottery", LOTTERY_CONTRACT_ADDRESS);
    
    const game = await lottery.getGame(gameId);
    
    console.log("Game ID:", game.gameId.toString());
    console.log("Player A:", game.playerA);
    console.log("Player B:", game.playerB);
    console.log("Stake Amount:", formatUnits(game.stakeAmount, 6), "FXRP");
    console.log("Game State:", game.state.toString());
    console.log("Winner:", game.winner.toString());
    console.log("Seed:", game.seed.toString());
    console.log("Payout Processed:", game.payoutProcessed);
    
    console.log("Array A:", game.arrayA.map((n: any) => n.toString()));
    console.log("Array B:", game.arrayB.map((n: any) => n.toString()));
    console.log("Picks A:", game.picksA.map((n: any) => n.toString()));
    console.log("Picks B:", game.picksB.map((n: any) => n.toString()));
}

async function main() {
    console.log("Starting FAssets Lottery interaction...");
    console.log("Network:", process.env.HARDHAT_NETWORK || "unknown");
    
    if (!PRIVATE_KEY1 || !PRIVATE_KEY2) {
        console.error("Please set PRIVATE_KEY1 and PRIVATE_KEY2 in your .env file");
        return;
    }
    
    console.log("Player A address:", playerA.address);
    console.log("Player B address:", playerB.address);
    
    try {
        // Create a new game
        const gameId = await createGame();
        
        // Join the game
        await joinGame(gameId);
        
        // Get game info before settling
        await getGameInfo(gameId);
        
        // Settle the game
        await settleGame(gameId);
        
        // Get game info after settling
        await getGameInfo(gameId);
        
        // Choose payout method:
        // Option 1: XRP payout (redeems FXRP to XRP and sends to XRPL address)
        await processPayout(gameId);
        
        // Option 2: FXRP payout (transfers FXRP directly to winner's wallet)
        // Uncomment the line below and comment out the line above if you want FXRP payouts
        // await processPayoutInFXRP(gameId);
        
        console.log("\n=== Lottery interaction completed successfully! ===");
        console.log("\nPayout Options:");
        console.log("- processPayout(): Redeems FXRP to XRP and sends to winner's XRPL address");
        console.log("- processPayoutInFXRP(): Transfers FXRP directly to winner's wallet");
        
    } catch (error) {
        console.error("Error during lottery interaction:", error);
    }
}

main().catch(error => {
    console.error("Script failed:", error);
    process.exitCode = 1;
}); 