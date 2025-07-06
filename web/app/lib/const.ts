export const CURVE_LEAGUE_CONTRACT_ADDRESS =
  "0x53D10537022E898543F56f0e96Ca90c8389992C5";
export const FAN_TOKEN_CONTRACT_ADDRESS =
  "0x2a1948F3BF214779ee7F76d3Eb982dd12D088683";

export const PLAYER_LIST_CONTRACT_ADDRESS =
  "0x9Da89E6D518EeD1e368f1882c7645aF7BF0D08f8";

export const PLAYER_LIST_CONTRACT_ABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "player",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "firstname",
            type: "string",
          },
          {
            internalType: "string",
            name: "lastname",
            type: "string",
          },
          {
            internalType: "string",
            name: "age",
            type: "string",
          },
          {
            internalType: "string",
            name: "nationality",
            type: "string",
          },
          {
            internalType: "string",
            name: "teamname",
            type: "string",
          },
          {
            internalType: "string",
            name: "position",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "goals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "assists",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "fouls_drawn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "fouls_committed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "yellow_cards",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "yellowred_cards",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "red_cards",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "passes_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "passes_key",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "passes_accuracy",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "penalties_scored",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "penalties_missed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minutesPlayed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "appearances",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "shots_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "shots_on_target",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dribble_attempts",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dribble_success",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tackles_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tackles_blocks",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tackles_interceptions",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "duels_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "duels_won",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "substitutes_in",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "substitutes_out",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "substitutes_bench",
            type: "uint256",
          },
        ],
        internalType: "struct PlayerStats",
        name: "stats",
        type: "tuple",
      },
    ],
    name: "abiSignatureHack",
    outputs: [],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes32[]",
            name: "merkleProof",
            type: "bytes32[]",
          },
          {
            components: [
              {
                internalType: "bytes32",
                name: "attestationType",
                type: "bytes32",
              },
              {
                internalType: "bytes32",
                name: "sourceId",
                type: "bytes32",
              },
              {
                internalType: "uint64",
                name: "votingRound",
                type: "uint64",
              },
              {
                internalType: "uint64",
                name: "lowestUsedTimestamp",
                type: "uint64",
              },
              {
                components: [
                  {
                    internalType: "string",
                    name: "url",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "httpMethod",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "headers",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "queryParams",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "body",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "postProcessJq",
                    type: "string",
                  },
                  {
                    internalType: "string",
                    name: "abiSignature",
                    type: "string",
                  },
                ],
                internalType: "struct IWeb2Json.RequestBody",
                name: "requestBody",
                type: "tuple",
              },
              {
                components: [
                  {
                    internalType: "bytes",
                    name: "abiEncodedData",
                    type: "bytes",
                  },
                ],
                internalType: "struct IWeb2Json.ResponseBody",
                name: "responseBody",
                type: "tuple",
              },
            ],
            internalType: "struct IWeb2Json.Response",
            name: "data",
            type: "tuple",
          },
        ],
        internalType: "struct IWeb2Json.Proof",
        name: "data",
        type: "tuple",
      },
    ],
    name: "addPlayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "player",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "firstname",
            type: "string",
          },
          {
            internalType: "string",
            name: "lastname",
            type: "string",
          },
          {
            internalType: "string",
            name: "age",
            type: "string",
          },
          {
            internalType: "string",
            name: "nationality",
            type: "string",
          },
          {
            internalType: "string",
            name: "teamname",
            type: "string",
          },
          {
            internalType: "string",
            name: "position",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "goals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "assists",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "fouls_drawn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "fouls_committed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "yellow_cards",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "yellowred_cards",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "red_cards",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "passes_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "passes_key",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "passes_accuracy",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "penalties_scored",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "penalties_missed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minutesPlayed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "appearances",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "shots_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "shots_on_target",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dribble_attempts",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dribble_success",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tackles_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tackles_blocks",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tackles_interceptions",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "duels_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "duels_won",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "substitutes_in",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "substitutes_out",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "substitutes_bench",
            type: "uint256",
          },
        ],
        internalType: "struct PlayerStats",
        name: "stats",
        type: "tuple",
      },
    ],
    name: "calculatePerformance",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPlayerIds",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "playerId",
        type: "uint256",
      },
    ],
    name: "getCalculatedPerformance",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "playerId",
        type: "uint256",
      },
    ],
    name: "getPlayerPerformance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "playerId",
        type: "uint256",
      },
    ],
    name: "getPlayerStats",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "player",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "firstname",
            type: "string",
          },
          {
            internalType: "string",
            name: "lastname",
            type: "string",
          },
          {
            internalType: "string",
            name: "age",
            type: "string",
          },
          {
            internalType: "string",
            name: "nationality",
            type: "string",
          },
          {
            internalType: "string",
            name: "teamname",
            type: "string",
          },
          {
            internalType: "string",
            name: "position",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "goals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "assists",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "fouls_drawn",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "fouls_committed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "yellow_cards",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "yellowred_cards",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "red_cards",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "passes_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "passes_key",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "passes_accuracy",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "penalties_scored",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "penalties_missed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minutesPlayed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "appearances",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "shots_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "shots_on_target",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dribble_attempts",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dribble_success",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tackles_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tackles_blocks",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tackles_interceptions",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "duels_total",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "duels_won",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "substitutes_in",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "substitutes_out",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "substitutes_bench",
            type: "uint256",
          },
        ],
        internalType: "struct PlayerStats[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "playerIds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "players",
    outputs: [
      {
        internalType: "uint256",
        name: "player",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "firstname",
        type: "string",
      },
      {
        internalType: "string",
        name: "lastname",
        type: "string",
      },
      {
        internalType: "string",
        name: "age",
        type: "string",
      },
      {
        internalType: "string",
        name: "nationality",
        type: "string",
      },
      {
        internalType: "string",
        name: "teamname",
        type: "string",
      },
      {
        internalType: "string",
        name: "position",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "goals",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "assists",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fouls_drawn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "fouls_committed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "yellow_cards",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "yellowred_cards",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "red_cards",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "passes_total",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "passes_key",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "passes_accuracy",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "penalties_scored",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "penalties_missed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minutesPlayed",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "appearances",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "shots_total",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "shots_on_target",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "dribble_attempts",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "dribble_success",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tackles_total",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tackles_blocks",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tackles_interceptions",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "duels_total",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "duels_won",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "substitutes_in",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "substitutes_out",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "substitutes_bench",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const CURVE_LEAGUE_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_fanBondToken",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AlreadyClaimed",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientLiquidity",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientPayment",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPlayerStatsListAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "MaxTokensReached",
    type: "error",
  },
  {
    inputs: [],
    name: "NoTokensFound",
    type: "error",
  },
  {
    inputs: [],
    name: "NoTokensOwned",
    type: "error",
  },
  {
    inputs: [],
    name: "NotPlayerAddress",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "PlayerAlreadyMinted",
    type: "error",
  },
  {
    inputs: [],
    name: "PlayerNotExists",
    type: "error",
  },
  {
    inputs: [],
    name: "PlayerSoldOut",
    type: "error",
  },
  {
    inputs: [],
    name: "PlayerVerificationFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [],
    name: "SeasonAlreadyActive",
    type: "error",
  },
  {
    inputs: [],
    name: "SeasonNotActive",
    type: "error",
  },
  {
    inputs: [],
    name: "SeasonNotEnded",
    type: "error",
  },
  {
    inputs: [],
    name: "SeasonStillActive",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenContractNotSet",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "LiquidityWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "nullifier",
        type: "uint256",
      },
    ],
    name: "NullifierStored",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokensBurned",
        type: "uint256",
      },
    ],
    name: "PlayerClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "season",
        type: "uint256",
      },
    ],
    name: "PlayerMinted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "PlayerStatsListAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "playerId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "playerAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "firstName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "lastName",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "dateOfBirth",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountSent",
        type: "uint256",
      },
    ],
    name: "PlayerVerificationProcessed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sold",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "multiplier",
        type: "uint256",
      },
    ],
    name: "PriceCalculated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "season",
        type: "uint256",
      },
    ],
    name: "SeasonEnded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "season",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "playerIds",
        type: "uint256[]",
      },
    ],
    name: "SeasonInitialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokensBurned",
        type: "uint256",
      },
    ],
    name: "UserClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
    ],
    name: "UserTokensListed",
    type: "event",
  },
  {
    inputs: [],
    name: "BASE_PRICE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CURVE_COEFFICIENT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_USER_TOKENS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "currentSeason",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "endSeason",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "fanBondToken",
    outputs: [
      {
        internalType: "contract FanBondToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getAllUserTokens",
    outputs: [
      {
        internalType: "uint256[]",
        name: "tokenIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getGameInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "sold",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "remaining",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currentPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "liquidityPool",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "circulatingSupply",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "playerAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "hasPlayerClaimed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getPerformanceMultiplier",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSeasonInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "season",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "active",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "ended",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserGameInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "totalTokens",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "playerTokens",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "tokenBalances",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserNullifier",
    outputs: [
      {
        internalType: "uint256",
        name: "nullifier",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "handleTransfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "hasMintedPlayer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "hasPlayerClaimed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "hasUserClaimed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_playerIds",
        type: "uint256[]",
      },
    ],
    name: "initializeSeason",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "liquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "mintPlayer",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "playerClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "playerClaimed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "playerStatsListAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "playerId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "playerAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "firstName",
        type: "string",
      },
      {
        internalType: "string",
        name: "lastName",
        type: "string",
      },
      {
        internalType: "string",
        name: "dateOfBirth",
        type: "string",
      },
    ],
    name: "processPlayerVerification",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "seasonActive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "seasonEnded",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_playerStatsListAddress",
        type: "address",
      },
    ],
    name: "setPlayerStatsListAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tokensSold",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "totalUserTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "userClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userClaimed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userNullifiers",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "withdrawAllLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdrawLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
