import { ethers, network, run } from "hardhat";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying ProofOfHuman contract...");

  const mockScope = 1;
  const hubAddress = process.env.IDENTITY_VERIFICATION_HUB;
  const verificationConfigId = process.env.VERIFICATION_CONFIG_ID;

  if (!hubAddress || !verificationConfigId) {
    throw new Error("Missing required environment variables.");
  }

  console.log("Using IdentityVerificationHub at:", hubAddress);
  console.log("Using VerificationConfigId:", verificationConfigId);

  const ProofOfHuman = await ethers.getContractFactory("ProofOfHuman");
  const proofOfHuman = await ProofOfHuman.deploy(
    hubAddress,
    mockScope,
    verificationConfigId
  );

  await proofOfHuman.waitForDeployment();
  const contractAddress = await proofOfHuman.getAddress();

  console.log("ProofOfHuman deployed to:", contractAddress);
  console.log("Network:", network.name);

  // Wait for confirmations
  console.log("Waiting for 5 block confirmations...");
  await (await proofOfHuman.deploymentTransaction())?.wait(5);

  // Verify on Celoscan
  if (network.name === "alfajores" && process.env.CELOSCAN_API_KEY) {
    console.log("Verifying contract on Celoscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [hubAddress, mockScope, verificationConfigId],
      });
      console.log("Contract verified successfully!");
    } catch (error: any) {
      console.error("Verification failed:", error.message);
      if (error.message.includes("already verified")) {
        console.log("Contract was already verified.");
      }
    }
  } else if (!process.env.CELOSCAN_API_KEY) {
    console.log("Skipping verification: CELOSCAN_API_KEY not found in .env");
  }

  // Save deployment info
  const signer = await ethers.provider.getSigner();
  const deploymentInfo = {
    network: network.name,
    contractAddress,
    hubAddress,
    deployedAt: new Date().toISOString(),
    deployer: await signer.getAddress(),
  };

  fs.writeFileSync(
    "./deployments/latest.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment complete!");
  console.log("Contract address:", contractAddress);
  console.log("\nNext steps:");
  console.log("1. Update NEXT_PUBLIC_SELF_ENDPOINT in app/.env");
  console.log(
    "2. Go to https://tools.self.xyz, generate the scope and update it in your contract"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
