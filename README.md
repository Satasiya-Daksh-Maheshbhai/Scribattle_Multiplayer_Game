# Scribattle — real-time multiplayer drawing game

A mobile-friendly drawing and guessing game using Node.js, Express, Socket.IO and HTML Canvas. Players join with a room code; no account is required.

## Run locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm start
```

Open http://localhost:3000. For multi-device testing on the same Wi-Fi, open `http://YOUR_COMPUTER_LAN_IP:3000` on the other devices. The host firewall must allow inbound connections on port 3000.

## Deploy publicly

Deploy this folder to a Node.js host that supports persistent WebSocket connections (for example Render, Railway, or a similar service). Use the start command `npm start`; the server reads the `PORT` environment variable. Do not use static-only hosting: the multiplayer server must remain running.

After deployment, share the public application URL and the room code generated in the game. No database or user accounts are required for this prototype. Rooms and scores live in memory and reset when the server restarts.

## Rules

- 2–12 players per room. The host starts the game once at least two players have joined.
- Each player takes a drawing turn. The drawer sees the secret word; other players see a letter hint and send guesses in chat.
- Correct guesses score more points when submitted earlier. The drawer earns a small bonus for each correct guess.
- Each round rotates through the connected players. At the end of the selected number of rounds, the highest score wins.
- The host can create a 3-, 5-, or 10-round game with 45-, 60-, or 80-second turns.

## Notes

This is a working starter implementation, not a hardened production service. It has no persistent database, account system, moderation tools, or distributed multi-instance room storage. Deploy one server instance for consistent in-memory room state.
