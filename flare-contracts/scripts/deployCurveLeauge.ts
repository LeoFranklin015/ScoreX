import { ethers } from "hardhat";

async function main() {
    // Set the deployed FanBondToken address here
    const fanBondTokenAddress = "0xF37Dbc3ed0E18096d885f7e191BD3845A48c9a64";

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
