import { ethers, run } from "hardhat";
import { formatUnits } from "ethers";

// yarn hardhat run scripts/fassets/deployLottery.ts --network coston2

// Coston2 Testnet Addresses
const RANDOM_NUMBER_GENERATOR_ADDRESS = "0x97702e350CaEda540935d92aAf213307e9069784"; // Replace with actual address
const ASSET_MANAGER_ADDRESS = "0xDeD50DA9C3492Bee44560a4B35cFe0e778F41eC5";
const FEE_COLLECTOR_ADDRESS = "0x38b09fF7F662D02402397653766ed795F9FD8f25"; // Replace with actual address

// Game parameters (in FXRP base units)
const MIN_STAKE_AMOUNT = ethers.parseUnits("10", 6); // 10 FXRP minimum
const MAX_STAKE_AMOUNT = ethers.parseUnits("1000", 6); // 1000 FXRP maximum

async function getFXRPAddress() {
    const IAssetManager = artifacts.require("IAssetManager");
    const assetManager = await IAssetManager.at(ASSET_MANAGER_ADDRESS);
    const fasset = await assetManager.fAsset();
    return fasset;
}

async function deployAndVerifyContract() {
    console.log("Deploying FAssets Lottery contract...");
    
    // Get FXRP address first
    const fxrpAddress = await getFXRPAddress();
    console.log("FXRP address:", fxrpAddress);

    const args = [
        RANDOM_NUMBER_GENERATOR_ADDRESS,
        ASSET_MANAGER_ADDRESS,
        fxrpAddress,
        MIN_STAKE_AMOUNT.toString(),
        MAX_STAKE_AMOUNT.toString(),
        FEE_COLLECTOR_ADDRESS
    ];

    const FAssetsLottery = await ethers.getContractFactory("FAssetsLottery");
    const fAssetsLottery = await FAssetsLottery.deploy(...args);
    await fAssetsLottery.waitForDeployment();
    const fAssetsLotteryAddress = await fAssetsLottery.getAddress();

    console.log("FAssets Lottery deployed to:", fAssetsLotteryAddress);
    console.log("Constructor arguments:", args);

    // Verify contract on block explorer
    try {
        await run("verify:verify", {
            address: fAssetsLotteryAddress,
            constructorArguments: args,
        });
        console.log("Contract verified successfully");
    } catch (e: any) {
        console.log("Verification failed:", e.message);
    }

    return fAssetsLottery;
}

async function main() {
    console.log("Starting FAssets Lottery deployment...");
    console.log("Network:", process.env.HARDHAT_NETWORK || "unknown");
    
    // Deploy and verify the contract
    const fAssetsLottery = await deployAndVerifyContract();

    // Get contract settings
    const settings = await fAssetsLottery.getSettings();
    console.log("\nContract Settings:");
    console.log("Lot size AMG:", settings[0].toString());
    console.log("Asset decimals:", settings[1].toString());
    console.log("Min stake amount:", formatUnits(MIN_STAKE_AMOUNT, 6), "FXRP");
    console.log("Max stake amount:", formatUnits(MAX_STAKE_AMOUNT, 6), "FXRP");
    console.log("Fee percentage: 2.5%");

    console.log("\nDeployment completed successfully!");
    console.log("Contract address:", await fAssetsLottery.getAddress());
}

main().catch(error => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
}); 