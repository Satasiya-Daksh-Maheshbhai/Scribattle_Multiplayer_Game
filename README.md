<<<<<<< HEAD
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
=======
# 🎨 Scribattle – Draw, Guess & Battle! 🚀
<img width="867" height="752" alt="image" src="https://github.com/user-attachments/assets/15eae017-aef7-4c8b-8598-97b8ce99c9ad" />

### 🖌️ Turn your creativity into a multiplayer battle!

**Scribattle** is a fun and interactive real-time multiplayer drawing and guessing game where creativity meets competition! Challenge your friends, showcase your drawing skills, guess hidden words, and compete to become the ultimate Scribattle champion. 🏆

No downloads. No registration. Just create a room, invite your friends, and start playing!

---

## ✨ Features

🎮 **Real-Time Multiplayer** – Play with 2–12 players simultaneously.

🏠 **Private Game Rooms** – Create your own room and invite friends using a unique room code.

🖌️ **Interactive Drawing Canvas** – Express your creativity with an interactive drawing board.

💬 **Live Chat & Guessing** – Chat with players and guess the hidden words in real time.

🏆 **Scoring System** – Earn points by guessing words correctly and drawing successfully.

⏱️ **Timed Challenges** – Enjoy exciting rounds with limited drawing time.

👑 **Live Leaderboard** – Track scores and compete to become the winner.

🌙 **Dark Mode** – Switch to a comfortable dark interface.

📱 **Responsive Design** – Enjoy the game across different screen sizes.

⚡ **No Registration Required** – Jump straight into the game without creating an account.

---

## 🛠️ Tech Stack

| Technology       | Purpose                             |
| ---------------- | ----------------------------------- |
| 🟢 Node.js       | Backend Runtime                     |
| 🚀 Express.js    | Web Server                          |
| 🔌 Socket.IO     | Real-Time Multiplayer Communication |
| 🌐 HTML5         | Frontend Structure                  |
| 🎨 CSS3          | Styling & Responsive UI             |
| ⚡ JavaScript     | Game Logic & Interactivity          |
| 🖌️ HTML5 Canvas | Drawing Functionality               |

---

## 🚀 Getting Started

Follow these steps to run Scribattle locally.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/scribattle-multiplayer.git
```

### 2️⃣ Navigate to Project Directory

```bash
cd scribattle-multiplayer
```

### 3️⃣ Install Dependencies

```bash
npm install
```

### 4️⃣ Start the Server

```bash
npm start
```

### 5️⃣ Open in Browser

Visit:

```text
http://localhost:3000
```

🎉 That's it! Create a room and invite your friends!

---

## 🎯 How to Play

1. 👤 Enter your player name.
2. 🏠 Create a new room or join an existing room.
3. 🔗 Share the room code with your friends.
4. 🖌️ Take turns drawing the assigned words.
5. 💡 Guess what other players are drawing.
6. 🏆 Earn points and climb the leaderboard.
7. 👑 Become the ultimate Scribattle champion!

---

## 🎮 Game Highlights

* Supports multiple players in a single room.
* Real-time drawing synchronization.
* Interactive guessing and chat experience.
* Competitive scoring and leaderboard.
* Fun multiplayer experience with friends.

---

## Sample Output 
<img width="1176" height="910" alt="image" src="https://github.com/user-attachments/assets/e51f42df-bef4-4803-bb9b-997dc8f5911d" />
<img width="1197" height="642" alt="image" src="https://github.com/user-attachments/assets/ef1f151e-757e-47d9-95d5-ff521591d3dc" />
<img width="867" height="752" alt="image" src="https://github.com/user-attachments/assets/57b4eebd-db40-43b7-a420-eb96ccdbbf17" />
<img width="1182" height="642" alt="image" src="https://github.com/user-attachments/assets/5e2cdd98-a63a-4019-9e8c-765243ce8275" />
<img width="1191" height="888" alt="image" src="https://github.com/user-attachments/assets/5263a25c-8826-4b03-bde2-5bf4e31a7c02" />
<img width="1188" height="888" alt="image" src="https://github.com/user-attachments/assets/8b9f4aee-1225-48ad-a133-e55707a1c256" />
<img width="324" height="592" alt="image" src="https://github.com/user-attachments/assets/e344603a-01c2-40dc-9f4d-ab941df47fb8" />
<img width="1221" height="603" alt="image" src="https://github.com/user-attachments/assets/4c00b395-be73-4289-88b9-bc0df64f5b4c" />


## 👨‍💻 Developer

Developed with ❤️ and creativity.

**Project:** Scribattle – Multiplayer Drawing & Guessing Game

---

### ⭐ Enjoying Scribattle?

If you like this project, don't forget to give it a ⭐ on GitHub!

**Draw it. Guess it. Win it. That's Scribattle! 🎨🏆**
>>>>>>> 80d494f2a2d79644faa81abd53bc28407097bff4
