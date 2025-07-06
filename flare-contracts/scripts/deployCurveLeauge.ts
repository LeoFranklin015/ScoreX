import { ethers } from "hardhat";

async function main() {
    // Set the deployed FanBondToken address here
    const fanBondTokenAddress = "0xC6d1390BA3C99ac4d83b19F898ecf396Aa868C29";

    // Get the contract factory for FanBondGame (from fanTokenInteractions.sol)
    const FanBondGame = await ethers.getContractFactory("FanBondGame");

    // Deploy the contract
    const fanBondGame = await FanBondGame.deploy(fanBondTokenAddress);
    await fanBondGame.waitForDeployment();

    console.log("FanBondGame deployed to:", await fanBondGame.getAddress());
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
