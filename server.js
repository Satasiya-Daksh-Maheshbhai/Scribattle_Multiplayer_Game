const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true } });
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, game: 'Scribattle' }));

const WORDS = [
  // Animals
  'elephant', 'giraffe', 'kangaroo', 'panda', 'penguin', 'octopus', 'dolphin', 'crocodile', 'hedgehog', 'flamingo',
  'butterfly', 'caterpillar', 'ladybug', 'honeybee', 'peacock', 'parrot', 'owl', 'eagle', 'squirrel', 'raccoon',
  'hamster', 'chameleon', 'seahorse', 'jellyfish', 'starfish', 'lobster', 'crab', 'snail', 'turtle', 'unicorn',
  // Food and drinks
  'pizza', 'hamburger', 'watermelon', 'pineapple', 'strawberry', 'blueberry', 'coconut', 'avocado', 'broccoli', 'carrot',
  'popcorn', 'pancakes', 'ice cream', 'birthday cake', 'cupcake', 'doughnut', 'pretzel', 'taco', 'sushi', 'spaghetti',
  'cheese sandwich', 'french fries', 'lemonade', 'milkshake', 'hot chocolate', 'fortune cookie', 'lollipop', 'chocolate bar', 'waffle', 'pumpkin pie',
  // Objects and household items
  'toothbrush', 'washing machine', 'vacuum cleaner', 'alarm clock', 'flashlight', 'umbrella', 'sunglasses', 'backpack', 'suitcase', 'keychain',
  'coffee cup', 'water bottle', 'frying pan', 'rolling pin', 'flower pot', 'wall clock', 'desk lamp', 'candle', 'pillow', 'blanket',
  'bookshelf', 'refrigerator', 'toaster', 'blender', 'hair dryer', 'remote control', 'computer mouse', 'keyboard', 'headphones', 'camera',
  // Places and buildings
  'castle', 'lighthouse', 'treehouse', 'skyscraper', 'windmill', 'igloo', 'pyramid', 'tent', 'greenhouse', 'library',
  'school bus', 'fire station', 'train station', 'airport', 'museum', 'aquarium', 'hospital', 'playground', 'water park', 'movie theater',
  'campground', 'farmhouse', 'bridge', 'fountain', 'tunnel', 'stadium', 'spaceship', 'submarine', 'sailboat', 'hot air balloon',
  // Nature and weather
  'rainbow', 'volcano', 'snowflake', 'tornado', 'lightning bolt', 'sunflower', 'cactus', 'mushroom', 'palm tree', 'bonsai tree',
  'waterfall', 'mountain', 'desert', 'glacier', 'coral reef', 'campfire', 'sandcastle', 'beehive', 'bird nest', 'acorn',
  'rain cloud', 'crescent moon', 'shooting star', 'planet', 'comet', 'solar eclipse', 'hot spring', 'pond', 'cave', 'leaf pile',
  // Jobs and people
  'firefighter', 'astronaut', 'detective', 'chef', 'dentist', 'teacher', 'photographer', 'magician', 'gardener', 'mail carrier',
  'construction worker', 'scientist', 'lifeguard', 'pilot', 'clown', 'painter', 'musician', 'doctor', 'robot inventor', 'pirate',
  // Sports and activities
  'basketball', 'football', 'skateboard', 'bicycle', 'roller skates', 'tennis racket', 'golf club', 'bowling ball', 'surfboard', 'ice skates',
  'yo-yo', 'jump rope', 'kite', 'trampoline', 'jigsaw puzzle', 'chessboard', 'drum set', 'guitar', 'piano', 'trumpet',
  // Fantasy and fun
  'dragon', 'ghost', 'robot', 'monster', 'vampire', 'witch hat', 'magic wand', 'treasure chest', 'crystal ball', 'fairy wings',
  'superhero cape', 'space helmet', 'golden crown', 'genie lamp', 'time machine', 'invisible cloak', 'giant footprint', 'secret door', 'magic carpet', 'rocket ship',
  // Everyday and miscellaneous
  'toothpaste', 'soap bubble', 'paper airplane', 'traffic light', 'stop sign', 'mailbox', 'shopping cart', 'ticket booth', 'swing set', 'bird feeder',
  'rubber duck', 'teddy bear', 'snowman', 'jack-o-lantern', 'gift box', 'alarm bell', 'music note', 'paint palette', 'hourglass', 'magnifying glass',
  'battery', 'light bulb', 'magnet', 'thermometer', 'binoculars', 'telescope', 'compass', 'safety pin', 'scissors', 'glue stick',
  'rain boots', 'sleeping bag', 'treasure map', 'candy cane', 'party hat', 'soap bar', 'skipping rope', 'garden hose', 'picnic basket', 'lunchbox'
];

const rooms = new Map();
const cleanName = s => String(s || '').trim().replace(/[<>\u0000-\u001f]/g, '').slice(0, 18);
const roomCode = () => { let c; do { c = crypto.randomBytes(3).toString('hex').toUpperCase(); } while (rooms.has(c)); return c; };
const publicPlayer = p => ({ id: p.id, name: p.name, score: p.score, connected: p.connected });

function roomState(room, viewerId) {
  const current = room.players[room.playerOrder[room.drawerIndex]];
  return {
    code: room.code, hostId: room.hostId, phase: room.phase,
    players: room.playerOrder.map(id => room.players[id]).filter(Boolean).map(publicPlayer),
    rounds: room.rounds, round: room.round, turnSeconds: room.turnSeconds,
    drawerId: current ? current.id : null,
    drawerName: current ? current.name : null,
    word: room.phase === 'drawing' && current && current.id === viewerId ? room.word : null,
    wordLength: room.word ? room.word.replace(/\s/g, '').length : 0,
    maskedWord: room.phase === 'drawing' ? [...room.word].map((ch, i) => ch === ' ' ? ' ' : (room.revealed.has(i) ? ch : '_')).join(' ') : '',
    timeLeft: room.timeLeft,
    messages: room.messages.slice(-500),
    strokes: room.strokes,
    winnerId: room.winnerId || null
  };
}

function broadcast(room) { for (const id of room.playerOrder) if (room.players[id]) io.to(id).emit('state', roomState(room, id)); }
function system(room, text) { room.messages.push({ type: 'system', text, at: Date.now() }); room.messages = room.messages.slice(-500); }
function stopTimer(room) { if (room.timer) clearInterval(room.timer); room.timer = null; }

function chooseWord(room) {
  if (!room.usedWords) room.usedWords = new Set();
  let available = WORDS.filter(word => !room.usedWords.has(word));
  if (available.length === 0) {
    room.usedWords.clear();
    available = WORDS.slice();
  }
  const word = available[Math.floor(Math.random() * available.length)];
  room.usedWords.add(word);
  return word;
}

function activePlayers(room) { return room.playerOrder.map(id => room.players[id]).filter(p => p && p.connected); }

function startGame(room) {
  if (activePlayers(room).length < 2) return false;
  stopTimer(room); room.phase = 'drawing'; room.round = 1; room.drawerIndex = -1; room.playerOrder.forEach(id => { if(room.players[id]) room.players[id].score = 0; });
  room.messages = []; room.strokes = []; room.winnerId = null; room.usedWords = new Set(); nextTurn(room); return true;
}

function nextTurn(room) {
  stopTimer(room);
  const alive = room.playerOrder.map(id => room.players[id]).filter(p => p && p.connected);
  if (alive.length < 2) { room.phase = 'lobby'; system(room, 'At least two connected players are needed to play.'); broadcast(room); return; }
  room.drawerIndex++;
  while (room.drawerIndex < room.playerOrder.length && (!room.players[room.playerOrder[room.drawerIndex]] || !room.players[room.playerOrder[room.drawerIndex]].connected)) room.drawerIndex++;
  if (room.drawerIndex >= room.playerOrder.length) { room.drawerIndex = room.playerOrder.findIndex(id => room.players[id] && room.players[id].connected); room.round++; }
  if (room.round > room.rounds) { finishGame(room); return; }
  room.word = chooseWord(room); room.phase = 'drawing'; room.timeLeft = room.turnSeconds; room.revealed = new Set(); room.strokes = []; room.playerOrder.forEach(id => { if (room.players[id]) room.players[id].guessed = false; });
  const drawer = room.players[room.playerOrder[room.drawerIndex]];
  system(room, `Round ${room.round} — ${drawer.name} is drawing!`); broadcast(room);
  room.timer = setInterval(() => {
    room.timeLeft--;
    if (room.timeLeft <= 0) {
      system(room, `Time's up! The word was “${room.word}”.`);
      room.phase = 'reveal';
      broadcast(room);
      setTimeout(() => { if (rooms.has(room.code) && room.phase === 'reveal') nextTurn(room); }, 2500);
      stopTimer(room);
    } else {
      if (room.timeLeft === Math.floor(room.turnSeconds * .65) || room.timeLeft === Math.floor(room.turnSeconds * .35)) {
        const hidden = [...room.word].map((c,i) => c === ' ' || room.revealed.has(i) ? c : i).filter(x => typeof x === 'number');
        if (hidden.length) room.revealed.add(hidden[Math.floor(Math.random()*hidden.length)]);
      }
      broadcast(room);
    }
  }, 1000);
}

function finishGame(room) {
  stopTimer(room); room.phase = 'finished';
  const sorted = activePlayers(room).sort((a,b) => b.score - a.score); room.winnerId = sorted[0]?.id || null;
  system(room, sorted.length ? `Game over! ${sorted[0].name} wins with ${sorted[0].score} points!` : 'Game over.'); broadcast(room);
}

function getRoom(socket) { const code = socket.data.roomCode; return code ? rooms.get(code) : null; }
function fail(socket, message) { socket.emit('notice', message); }

io.on('connection', socket => {
  socket.on('createRoom', ({ name, rounds, turnSeconds } = {}) => {
    name = cleanName(name); if (!name) return fail(socket, 'Enter a player name first.');
    const code = roomCode(); const player = { id: socket.id, name, score: 0, connected: true, guessed: false };
    const room = { code, hostId: socket.id, players: { [socket.id]: player }, playerOrder: [socket.id], phase: 'lobby', rounds: [3,5,10].includes(Number(rounds)) ? Number(rounds) : 3, round: 0, turnSeconds: [45,60,80].includes(Number(turnSeconds)) ? Number(turnSeconds) : 60, drawerIndex: -1, word: '', timeLeft: 0, timer: null, messages: [], strokes: [], revealed: new Set(), winnerId: null };
    rooms.set(code, room); socket.join(code); socket.data.roomCode = code; system(room, `${name} created the room.`); broadcast(room);
  });

  socket.on('joinRoom', ({ name, code } = {}) => {
    name = cleanName(name); code = String(code || '').trim().toUpperCase();
    if (!name) return fail(socket, 'Enter a player name first.');
    const room = rooms.get(code); if (!room) return fail(socket, 'Room not found. Check the code and try again.');
    if (room.phase !== 'lobby') return fail(socket, 'This game has already started. Ask the host for a new room.');
    if (room.playerOrder.length >= 12) return fail(socket, 'This room is full (12 players maximum).');
    if (room.playerOrder.some(id => room.players[id] && room.players[id].name.toLowerCase() === name.toLowerCase())) return fail(socket, 'That name is already in use in this room.');
    const player = { id: socket.id, name, score: 0, connected: true, guessed: false }; room.players[socket.id] = player; room.playerOrder.push(socket.id); socket.join(code); socket.data.roomCode = code; system(room, `${name} joined the room.`); broadcast(room);
  });

  socket.on('startGame', () => {
    const room = getRoom(socket); if (!room) return;
    if (room.hostId !== socket.id) return fail(socket, 'Only the host can start the game.');
    if (!startGame(room)) return fail(socket, 'At least two players must join before starting.');
  });

  socket.on('chooseWord', word => {
    const room = getRoom(socket); if (!room || room.phase !== 'choosing') return;
    if (room.playerOrder[room.drawerIndex] !== socket.id) return;
    if (!room.wordChoices.includes(word)) return;
    room.word = word; room.phase = 'drawing'; room.timeLeft = room.turnSeconds; room.strokes = []; room.revealed = new Set(); broadcast(room);
    room.timer = setInterval(() => {
      room.timeLeft--;
      if (room.timeLeft <= 0) {
        system(room, `Time's up! The word was “${room.word}”.`);
        room.phase='reveal'; broadcast(room); stopTimer(room);
        setTimeout(() => { if (rooms.has(room.code) && room.phase==='reveal') nextTurn(room); }, 2500);
      } else {
        if (room.timeLeft === Math.floor(room.turnSeconds*.65) || room.timeLeft === Math.floor(room.turnSeconds*.35)) {
          const hidden = [...room.word].map((c,i) => c === ' ' || room.revealed.has(i) ? c : i).filter(x => typeof x === 'number');
          if (hidden.length) room.revealed.add(hidden[Math.floor(Math.random()*hidden.length)]);
        }
        broadcast(room);
      }
    }, 1000);
  });

  socket.on('draw', stroke => {
    const room = getRoom(socket); if (!room || room.phase !== 'drawing' || room.playerOrder[room.drawerIndex] !== socket.id) return;
    if (!stroke || !['begin','move','end','clear'].includes(stroke.type)) return;
    if (stroke.type === 'clear') { room.strokes = []; io.to(room.code).emit('clearCanvas'); return; }
    const s = { type: stroke.type, x: Number(stroke.x), y: Number(stroke.y), x0: Number(stroke.x0), y0: Number(stroke.y0), color: /^#[0-9a-f]{6}$/i.test(stroke.color) ? stroke.color : '#202020', size: Math.max(1, Math.min(30, Number(stroke.size)||4)) };
    if (![s.x,s.y,s.x0,s.y0].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) return;
    room.strokes.push(s); if(room.strokes.length>4000)room.strokes.splice(0,room.strokes.length-4000); socket.to(room.code).emit('draw', s);
  });

  socket.on('guess', text => {
    const room = getRoom(socket); if (!room || !['drawing','reveal'].includes(room.phase)) return;
    const player = room.players[socket.id]; if (!player || room.phase !== 'drawing') return;
    text = String(text || '').trim().slice(0,100); if (!text) return;
    const isDrawer = room.playerOrder[room.drawerIndex] === socket.id;
    if (isDrawer || player.guessed) {
      room.messages.push({ type: 'chat', text: `${player.name}: ${text}`, at: Date.now() }); room.messages = room.messages.slice(-500); broadcast(room); return;
    }
    if (text.toLowerCase() === room.word.toLowerCase()) {
      player.guessed = true; const points = Math.max(50, Math.round(100 + room.timeLeft * 5)); player.score += points;
      const drawer = room.players[room.playerOrder[room.drawerIndex]]; if(drawer) drawer.score += 35;
      room.messages.push({ type: 'correct', text: `${player.name} guessed correctly! +${points} points`, at: Date.now() });
      const guessers = activePlayers(room).filter(p => p.id !== drawer?.id);
      if (guessers.every(p => p.guessed)) {
        system(room, `Everyone guessed it! The word was “${room.word}”.`); room.phase = 'reveal'; broadcast(room); stopTimer(room);
        setTimeout(() => { if (rooms.has(room.code) && room.phase==='reveal') nextTurn(room); }, 2200);
      } else {
        broadcast(room);
      }
    } else {
      room.messages.push({ type: 'chat', text: `${player.name}: ${text}`, at: Date.now() }); room.messages = room.messages.slice(-500); broadcast(room);
    }
  });

  socket.on('playAgain', () => {
    const room = getRoom(socket); if (!room || room.hostId !== socket.id || room.phase !== 'finished') return;
    room.phase='lobby'; room.round=0; room.word=''; room.strokes=[]; room.messages=[]; room.playerOrder.forEach(id => { if (room.players[id]) room.players[id].guessed = false; });
    system(room, 'New game lobby is ready.'); broadcast(room);
  });

  socket.on('disconnect', () => {
    const room = getRoom(socket); if (!room) return;
    const player = room.players[socket.id]; if (player) player.connected = false;
    system(room, `${player?.name || 'A player'} disconnected.`);
    if (room.hostId === socket.id) {
      const next = room.playerOrder.find(id => room.players[id] && room.players[id].connected);
      room.hostId = next || null;
    }
    if (room.phase === 'drawing' && room.playerOrder[room.drawerIndex] === socket.id) {
      stopTimer(room); room.phase='reveal'; system(room, 'The drawer disconnected. Moving to the next turn.');
      setTimeout(() => { if (rooms.has(room.code) && room.phase==='reveal') nextTurn(room); }, 1500);
    }
    if (!activePlayers(room).length) { stopTimer(room); rooms.delete(room.code); } else broadcast(room);
  });
});

server.listen(PORT, () => console.log(`Scribattle running on port ${PORT}`));