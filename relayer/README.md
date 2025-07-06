# Event Watcher Server

This Express server listens for `playerVerified` events from a smart contract and filters them based on the message value.

## Features

- **Event Filtering**: Only stores events where `message` parsed as integer is > 0
- **Automatic Cleanup**: Removes events older than 1 minute
- **REST API**: Provides endpoints to access filtered events
- **Real-time Processing**: Continues to process events on Flare network regardless of filtering

## Installation

```bash
npm install
```

## Usage

### Start the server
```bash
npm start
```

### Development mode (with auto-restart)
```bash
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Get All Events
```
GET /events
```
Returns all currently stored filtered events with count and timestamp.

### Get Event Count
```
GET /events/count
```
Returns only the count of stored events.

### Get Event Statistics
```
GET /events/stats
```
Returns detailed statistics including total, recent, and old events.

### Clear All Events
```
DELETE /events
```
Clears all stored events.

### Get Event by Player Address
```
GET /events/player/:playerAddress
```
Returns the event data for a specific player address if it exists in the filtered list.

**Parameters:**
- `playerAddress` (path parameter): The Ethereum address of the player

**Response:**
- `200 OK`: Event found and returned
- `400 Bad Request`: Player address not provided
- `404 Not Found`: No event found for the given player address

**Example:**
```
GET /events/player/0x4b4b30e2E7c6463b03CdFFD6c42329D357205334
```

**Success Response:**
```json
{
  "found": true,
  "event": {
    "message": "276",
    "playerAddress": "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
    "firstName": "NEYMAR",
    "lastName": "JUNIOR",
    "nationality": "USA",
    "dateOfBirth": "05-02-92",
    "gender": "M",
    "timestamp": 1703123456789
  },
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

**Error Response:**
```json
{
  "error": "Player not found",
  "message": "No event found for player address: 0x1234567890abcdef",
  "playerAddress": "0x1234567890abcdef"
}
```

## Environment Variables

Create a `.env` file with:
```
CELO_ALFAJORES_RPC=your_celo_rpc_url
PRIVATE_KEY=your_private_key
PORT=3001 (optional, defaults to 3001)
```

## Event Filtering Logic

- Events with `message` value ≤ 0 are logged but not stored
- Events with `message` value > 0 are stored in the global list
- Stored events are automatically removed after 1 minute
- All events are processed on the Flare network regardless of filtering

## Example Response

```json
{
  "count": 2,
  "events": [
    {
      "message": "276",
      "playerAddress": "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
      "firstName": "NEYMAR",
      "lastName": "JUNIOR",
      "nationality": "USA",
      "dateOfBirth": "05-02-92",
      "gender": "M",
      "timestamp": 1703123456789
    }
  ],
  "timestamp": "2023-12-21T10:30:56.789Z"
}
``` 