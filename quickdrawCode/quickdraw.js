const startButton = document.querySelector('.startButton')
const nameInput = document.querySelector('.nameInput');
const startPage = document.querySelector('.startPage');
const lobbyPage = document.querySelector('.lobbyPage');
const duelButton = document.querySelector('.duelButton')
const acceptButton = document.querySelector('.acceptDuel');
const declineButton = document.querySelector('.declineDuel');
const incomingDuel = document.querySelector('.incomingDuel');
const duelInput = document.querySelector('.duelInput');
const challengeText = incomingDuel.querySelector('.text');
const alertText = document.querySelector('.alert');
const duelPage = document.querySelector('.duelPage');
const duelingTitle = duelPage.querySelector('.title');

const apiURL = `ws://localhost:3000`
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

    return;
}


startButton.addEventListener('click', () => {
    const username = nameInput.value;
    setUsername(username);

    if(DeviceMotionEvent.requestPermission != null){
        DeviceMotionEvent.requestPermission().then((state) => {
            if (state != 'granted') return;
            startListeningForMovement();
        });
    }

    startPage.style.left = '-100%';
    lobbyPage.style.left = '0%';
    duelPage.style.left = '100%';
});

duelButton.addEventListener('click', () => {
    const opponent = duelInput.value;
    const duelStartData = {
        type: 'sendDuelInvite',
        opponentName: opponent
    }

    user.socket.send(JSON.stringify(duelStartData));
    return;
});



const triggerHaptic = () => {
    const hapticLabel = document.getElementById('haptic-label');
    if (hapticLabel) {
        hapticLabel.click();
    }
}

const startListeningForMovement = () => {
    window.addEventListener('devicemotion', (e) => {
        const a = e.acceleration;
        const mag = a.x * a.x + a.y * a.y + a.z * a.z;

    });

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
    alertText.textContent = 'holstered';
    user.socket.send(JSON.stringify({
        type:'holsterPhone'
    }));
}

const drawPhone = () => {
    user.holstered = false;
    alertText.textContent = 'Fired';
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

    return;
}

const declineDuel = () => {
    user.socket.send(JSON.stringify({
        type:'respondToDuelInvite',
        initiator: currentDuelRequest.initiator,
        response: false
    }));

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
    duelingTitle.textContent = `Dueling ${data.opponent}.`;
    user.dueling = true;

    return;
}

const duelDeclined = (data) => {
    alertText.textContent = `${data.sender} declined your duel.`

    return;
}

const beginDuel = (data) => {
    const timeStart = data.timeStart;

    setTimeout(() => {
        triggerHaptic();
    },timeStart - Date.now());
    
    setTimeout(() => {
        triggerHaptic();
    },timeStart + 1000 - Date.now());


    setTimeout(() => {
        triggerHaptic();
    },timeStart + 3000 - Date.now());

    return;
}

const duelResults = (data) => {

}


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