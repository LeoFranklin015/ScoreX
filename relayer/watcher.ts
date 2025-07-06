import {
  createPublicClient,
  http,
  parseAbi,
  Address,
  createWalletClient,
} from "viem";
import dotenv from "dotenv";
import { privateKeyToAccount } from "viem/accounts";
import { flareTestnet } from "viem/chains";
import express from "express";
import cors from "cors";

dotenv.config();

const CELO_ALFAJORES_RPC = process.env.CELO_ALFAJORES_RPC as string;

const CONTRACT_ADDRESS = "0xBe7c6B96092156F7C6DcD576E042af3E6cE817b5";
const PLAYER_VERIFIED_ABI = parseAbi([
  "event playerVerified(string message, address playerAddress, string firstName, string lastName, string nationality, string dateOfBirth, string gender, uint256 nullifier)",
]);

interface FilteredEvent {
  message: string;
  playerAddress: string;
  firstName: string;
  lastName: string;
  nationality: string;
  dateOfBirth: string;
  gender: string;
  nullifier: any;
  timestamp: number;
}

let filteredEvents: FilteredEvent[] = [];

// Cleanup function to remove events older than 1 minute
function cleanupOldEvents() {
  const oneMinuteAgo = Date.now() - 60000; // 60 seconds
  filteredEvents = filteredEvents.filter(
    (event) => event.timestamp > oneMinuteAgo
  );
}

// Run cleanup every 30 seconds
setInterval(cleanupOldEvents, 30000);

async function startWatcher() {
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

  const privateKey = process.env.PRIVATE_KEY as string;
  const formattedPrivateKey = (
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  ) as `0x${string}`;

  const flarecoston2Client = createWalletClient({
    account: privateKeyToAccount(formattedPrivateKey),
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
        console.log("playerVerified event:", log.args);

        // Parse message as integer
        const messageValue = parseInt(log.args.message);

        // Only store if message value is greater than 0
        if (messageValue) {
          try {
            flarecoston2Client.writeContract({
              address: CONTRACT_ADDRESS as Address,
              abi: PLAYER_VERIFIED_ABI,
              functionName: "processPlayerVerification",
              args: [
                log.args.message,
                log.args.playerAddress,
                log.args.firstName,
                log.args.lastName,
                log.args.dateOfBirth,
              ],
            });
          } catch (error) {
            console.error("Error processing on Flare network:", error);
          }
        } else {
          const event: FilteredEvent = {
            message: log.args.message,
            playerAddress: log.args.playerAddress,
            firstName: log.args.firstName,
            lastName: log.args.lastName,
            nationality: log.args.nationality,
            dateOfBirth: log.args.dateOfBirth,
            gender: log.args.gender,
            nullifier: log.args.nullifier,
            timestamp: Date.now(),
          };

          filteredEvents.push(event);
          console.log(`✅ Stored event with message value: ${messageValue}`);
        }

        // // Process on Flare network regardless of filtering
        // try {
        //   flarecoston2Client.writeContract({
        //     address: CONTRACT_ADDRESS as Address,
        //     abi: PLAYER_VERIFIED_ABI,
        //     functionName: "processPlayerVerification",
        //     args: [log.args.message, log.args.playerAddress, log.args.firstName, log.args.lastName, log.args.dateOfBirth],
        //   });
        // } catch (error) {
        //   console.error("Error processing on Flare network:", error);
        // }
      }
    },
    onError: (err: any) => {
      console.error("Error watching event:", err);
    },
  });
}

// Express server setup
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/events/player/:playerAddress", (req, res) => {
  cleanupOldEvents();

  const { playerAddress } = req.params;

  if (!playerAddress) {
    return res.status(400).json({
      error: "Player address is required",
      message: "Please provide a valid player address",
    });
  }

  // Find event with matching player address
  const event = filteredEvents.find(
    (event) => event.playerAddress.toLowerCase() === playerAddress.toLowerCase()
  );

  if (!event) {
    return res.status(404).json({
      error: "Player not found",
      message: `No event found for player address: ${playerAddress}`,
      playerAddress: playerAddress,
    });
  }

  res.json({
    found: true,
    event: event,
    timestamp: new Date().toISOString(),
  });
});

// Start the server and watcher
async function main() {
  try {
    // Start the watcher
    await startWatcher();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 Express server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Error in main:", err);
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
