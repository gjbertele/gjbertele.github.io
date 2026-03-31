const startButton = document.querySelector('.startButton')
const nameInput = document.querySelector('.nameInput');
const startPage = document.querySelector('.startPage');
const lobbyPage = document.querySelector('.lobbyPage');
const duelButton = document.querySelector('.duelButton')
const acceptButton = document.querySelector('.acceptDuel');
const declineButton = document.querySelector('.declineDuel');
const incomingDuel = document.querySelector('.incomingDuel');
const duelInput = document.querySelector('.duelInput');
const challengeText = document.querySelector('.challengeText')
const alertText = document.querySelector('.alert');
const duelPage = document.querySelector('.duelPage');
const duelingTitle = document.querySelector('.duelPage > .title');
const duelingInstructions = document.querySelector('.instructions');
const resultsPage = document.querySelector('.resultsPage');
const resultsText = document.querySelector('.results');
const restartButton = document.querySelector('.restartButton');
const warningText = document.querySelector('.warning');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
let tapSoundContext = new AudioContext();
let tapSoundBuffer;
let tapSoundElem;


fetch('/duelsCode/tap.mp3')
  .then(res => res.arrayBuffer())
  .then(data => tapSoundContext.decodeAudioData(data))
  .then(decoded => tapSoundBuffer = decoded);


let apiURL = `ws://localhost:3000`
if(window.location.href.includes('gjb.one')) apiURL = `wss://gjb.one`;

let user = {
    socket: null,
    username: null,
    holstered: false,
    dueling:false
}

let currentDuelRequest = {
    initiator: null
}


const initializeVisibility = () => {
    startPage.style.left = '0%';
    lobbyPage.style.left = '100%';
    duelPage.style.left = '200%';
    resultsPage.style.left = '300%';
    warningText.style.display = isIOS ? 'none' : 'inline-block';
    return;
}


startButton.addEventListener('click', async () => {
    const username = nameInput.value;
    if(username == '') return;

    setUsername(username);

    nameInput.style.display = 'none';

    if(DeviceMotionEvent.requestPermission != null){
        DeviceMotionEvent.requestPermission().then((state) => {
            if (state != 'granted') return;
            startListeningForMovement();
        });
    }

    startPage.style.left = '-100%';
    lobbyPage.style.left = '0%';
    duelPage.style.left = '100%';
    resultsPage.style.left = '200%';

    

});

duelButton.addEventListener('click', () => {
    const opponent = duelInput.value;
    const duelStartData = {
        type: 'sendDuelInvite',
        opponentName: opponent
    }

    tapSoundElem = new Audio('./duelsCode/tap.mp3');
    tapSoundElem.play().then(() => {
        tapSoundElem.pause();
        tapSoundElem.currentTime = 0;
    })

    user.socket.send(JSON.stringify(duelStartData));

    return;
});


const triggerTap = (timeDelay) => {
    /*const source = tapSoundContext.createBufferSource();
    source.buffer = tapSoundBuffer;

    const now = tapSoundContext.currentTime;
    source.connect(tapSoundContext.destination);

    source.start(now + timeDelay / 1000);*/


    setTimeout(() => {
        tapSoundElem.play();
        duelPage.style.backgroundColor = '#EC4E20';
        setTimeout(() => {
            duelPage.style.backgroundColor = '#000';
        },100);
        console.log('triggered');
    },timeDelay);

    return;
}

const startListeningForMovement = () => {
    window.addEventListener('deviceorientation', (e) => {
        checkOrientation(e);
    });

    return;
}

const checkOrientation = (e) => {
    if(!user.dueling) return;

    const down = -Math.sin(e.beta * Math.PI / 180);
    if(!user.holstered && down > 0.7) {
        holsterPhone();
    } else if(user.holstered && down < 0.5){
        drawPhone();
    }
}

const holsterPhone = () => {
    user.holstered = true;
    user.socket.send(JSON.stringify({
        type:'holsterPhone'
    }));
}

const drawPhone = () => {
    user.holstered = false;
    user.socket.send(JSON.stringify({
        type:'drawPhone',
        timeSent: Date.now()
    }));
}

const setUsername = (username) => {
    user.username = username;
    user.socket.send(JSON.stringify({
        type:'setUsername',
        username
    }));
}

const acceptDuel = () => {
    user.socket.send(JSON.stringify({
        type:'respondToDuelInvite',
        initiator: currentDuelRequest.initiator,
        response: true
    }));
    currentDuelRequest.initiator = null;
    

    return;
}

const declineDuel = () => {
    user.socket.send(JSON.stringify({
        type:'respondToDuelInvite',
        initiator: currentDuelRequest.initiator,
        response: false
    }));
    incomingDuel.style.display = 'none';
    currentDuelRequest.initiator = null;
    return;
}

acceptButton.addEventListener('click', acceptDuel);
declineButton.addEventListener('click', declineDuel);


const receiveDuelInvite = (data) => {
    const opponent = data.senderName;

    currentDuelRequest.initiator = opponent;

    incomingDuel.style.display = 'inline-block';

    challengeText.textContent = `${opponent} is challenging you`;

    return;
}

const opponentNotFound = (data) => {
    alertText.textContent = 'Opponent not found.';
}

const duelInviteSent = (data) => {
    alertText.textContent = 'Duel invite sent.';
}

const joinDuel = (data) => {
    startPage.style.left = '-200%';
    lobbyPage.style.left = '-100%';
    duelPage.style.left = '0%';
    resultsPage.style.left = '100%';

    duelingTitle.textContent = `Dueling ${data.opponent}.`;
    duelingInstructions.textContent = `Turn your volume up. When you hear the sound, raise your phone to fire. Both players must lower their phone to start`;
    duelInput.style.display = 'none';
    user.dueling = true;

    return;
}

const duelDeclined = (data) => {
    alertText.textContent = `${data.sender} declined your duel.`

    return;
}

const beginDuel = (data) => {
    const timing = data.timing;

    triggerTap(timing[2] - Date.now());

    return;
}

const duelResults = (data) => {
    startPage.style.left = '-300%';
    lobbyPage.style.left = '-200%';
    duelPage.style.left = '-100%';
    resultsPage.style.left = '0%';

    const result = data.won ? 'won' : 'lost';
    const exclaim = data.won ? '!' : '';

  
    resultsPage.style.background = data.won ? '#EC4E20' : 'transparent';

    if(data.timeDiff > 0) resultsText.textContent = `You ${result} by ${data.timeDiff/1000} seconds${exclaim}`;
    else resultsText.textContent = `You ${result}${exclaim}`;
    
    return;
}

const playAgain = () => {
    user.holstered = false;
    user.dueling = false;
    currentDuelRequest.initiator = null;
    startPage.style.left = '-100%';
    lobbyPage.style.left = '0%';
    duelPage.style.left = '100%';
    resultsPage.style.left = '200%';
    incomingDuel.style.display = 'none';
    alertText.textContent = '';
    nameInput.style.display = 'inline-block';
    duelInput.style.display = 'inline-block';

    tapSound = new Audio('./duelsCode/tap.mp3');
    tapSound.play().then(() => tapSound.pause());

    
    return;
}

restartButton.addEventListener('click', playAgain);

const connectToWebSocket = () => {
    user.socket = new WebSocket(apiURL);

    user.socket.addEventListener("open", () => {
        console.log("Connected to server");
        user.socket.send('quickDraw');
    });

    user.socket.addEventListener("message", (event) => {
        if(event.data == 'Success'){
            console.log('Success');
            return;
        }
        const data = JSON.parse(event.data);
        const functions = [receiveDuelInvite, joinDuel, beginDuel, opponentNotFound, duelInviteSent, duelDeclined, duelResults];
        functions[functions.map(i => i = i.name).indexOf(data.type)](data);
    });

    user.socket.addEventListener("close", () => {
        console.log("Disconnected");
    });

    user.socket.addEventListener("error", (err) => {
        console.error("WebSocket error:", err);
    });
}



connectToWebSocket();
initializeVisibility();