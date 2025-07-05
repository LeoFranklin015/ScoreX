import { ethers } from "hardhat";

async function main() {
    // Set your base URI here
    const baseURI = "https://example.com/metadata/";

    // Get the contract factory
    const FanBondToken = await ethers.getContractFactory("FanBondToken");

    // Deploy the contract
    const fanBondToken = await FanBondToken.deploy(baseURI);
    await fanBondToken.waitForDeployment();

    console.log("FanBondToken deployed to:", await fanBondToken.getAddress());
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
