import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Setting scope for ProofOfPlayer contract...");

  // Check if deployment info exists
  const deploymentPath = "./deployments/latest.json";
  if (!fs.existsSync(deploymentPath)) {
    console.error("No deployment found. Please deploy the contract first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress: string = deploymentInfo.contractAddress;

  console.log("Using contract at:", contractAddress);
  console.log("Network:", network.name);

  // Get the new scope value (here hardcoded, but can be used from env if needed)
  const newScope =
    "7282779693492194468387993662276240863177516151288046636303223484978333529593"; // replace with `process.env.NEW_SCOPE` if required

  if (!newScope) {
    console.error("Please provide the new scope value:");
    console.error("Set NEW_SCOPE environment variable:");
    console.error(
      "  NEW_SCOPE=<scope_value> npx hardhat run scripts/set-scope.ts --network <network>"
    );
    process.exit(1);
  }

  console.log("Setting scope to:", newScope);

  // Attach to deployed contract
  const proofOfPlayer = await ethers.getContractFactory("ProofOfPlayer");
  const ProofOfPlayer = proofOfPlayer.attach(contractAddress);

  // Read current scope
  try {
    const currentScope = await ProofOfPlayer.scope();
    console.log("Current scope:", currentScope.toString());
  } catch (error: any) {
    console.warn("Could not read current scope:", error.message);
  }

  // Call setScope
  try {
    console.log("Calling setScope...");
    const tx = await ProofOfPlayer.setScope(newScope);
    console.log("Transaction hash:", tx.hash);

    console.log("Waiting for confirmation...");
    const receipt = await tx.wait();
    console.log("Confirmed in block:", receipt.blockNumber);

    const updatedScope = await ProofOfPlayer.scope();
    console.log("Updated scope:", updatedScope.toString());

    console.log("\n✅ Scope update complete!");
  } catch (error: any) {
    console.error("❌ Failed to set scope:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
