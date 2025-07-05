import {
  createPublicClient,
  http,
  parseAbi,
  getContractAddress,
  Address,
  createWalletClient,
} from "viem";
import dotenv from "dotenv";
import { privateKeyToAccount } from "viem/accounts";
import { flareTestnet } from "viem/chains";

dotenv.config();

// Celo Alfajores RPC endpoint
const CELO_ALFAJORES_RPC = process.env.CELO_ALFAJORES_RPC as string;

const CONTRACT_ADDRESS = "0xF9E87DfBab897c4B73caF8CafECd94B1c11EFe5F";
const PLAYER_VERIFIED_ABI = parseAbi([
  "event playerVerified(string message, address playerAddress, string firstName, string lastName, string nationality, string dateOfBirth, string gender)",
]);

async function main() {
  const client = createPublicClient({
    chain: {
      id: 44787,
      name: "Celo Alfajores",
      nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
      rpcUrls: { default: { http: [CELO_ALFAJORES_RPC] } },
      blockExplorers: {
        default: { name: "Celoscan", url: "https://alfajores.celoscan.io" },
      },
    },
    transport: http(CELO_ALFAJORES_RPC),
  });

  const flarecoston2Client = createWalletClient({
    account: privateKeyToAccount(
      process.env.PRIVATE_KEY as string
    ),
    chain: flareTestnet,
    transport: http("https://coston2-api.flare.network/ext/C/rpc"),
  });

  console.log(
    "Listening for playerVerified events on contract:",
    CONTRACT_ADDRESS
  );

  client.watchContractEvent({
    address: CONTRACT_ADDRESS as Address,
    abi: PLAYER_VERIFIED_ABI,
    eventName: "playerVerified",
    pollingInterval: 5000, // poll every 5 seconds
    onLogs: (logs: any) => {
      for (const log of logs) {
        // log.args is always present for conforming logs
        console.log("playerVerified event:", log.args);
        flarecoston2Client.writeContract({
          address: CONTRACT_ADDRESS as Address,
          abi: PLAYER_VERIFIED_ABI,
          functionName: "processPlayerVerification",
          args: [log.args.message, log.args.playerAddress, log.args.firstName, log.args.lastName, log.args.dateOfBirth],
        });
      }
    },
    onError: (err: any) => {
      console.error("Error watching event:", err);
    },
  });
}

main().catch((err) => {
  console.error("Error in watcher:", err);
  process.exit(1);
});

// playerVerified event: {
//   message: '276',
//   playerAddress: '0x4b4b30e2E7c6463b03CdFFD6c42329D357205334',
//   firstName: 'NEYMAR',
//   lastName: 'JUNIOR',
//   nationality: 'USA',
//   dateOfBirth: '05-02-92',
//   gender: 'M'
// }
