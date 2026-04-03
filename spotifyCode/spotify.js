const trackHolder = document.querySelector('.trackHolder')
const goButton = document.querySelector('.goButton');
const joinButton = document.querySelector('.joinButton');
const createButton = document.querySelector('.createButton');
const numInputs = [0, 1, 2, 3].map(i => i = document.querySelector(`.num${i}`));
const waitingRoomPlayerHolder = document.querySelector('.waitingRoomPage > .playerWindow > .playerHolder');
const startButton = document.querySelector('.startButton');
const playbackEmbed = document.querySelector('.playbackEmbed');
const roundPlayerHolder = document.querySelector('.roundPage > .playerWindow > .playerHolder');
const scoresPlayerHolder = document.querySelector('.scoresPage > .playerWindow > .playerHolder');
const searchButton = document.querySelector('.searchButton');
const width = document.querySelector('.displayTracksPage').clientWidth;
const height = document.body.clientHeight;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

let currentPlayers = {};
let user = {
    username:'',
    tracks: [],
    serverConnection: null,
    currentGameCode: '',
    currentSelection: ''
}


const initializeServerConnection = async () => {
    user.serverConnection = new ServerConnection();
    await user.serverConnection.initialize();

    goButton.style.display = 'inline-block';
    initializeServerListeners();
    return;
}

for(let i = 0; i<4; i++){
    numInputs[i].addEventListener('keydown', (e) => {
        e.preventDefault();
    });

    numInputs[i].addEventListener('keyup', (e) => {
        e.preventDefault();
        joinButton.style.display = 'none';

        if(e.key == 'Backspace'){
            if(numInputs[i].value == ''){
                if(i != 0) numInputs[i-1].focus();
            } else {
                numInputs[i].value = '';
            }
        } else {
            numInputs[i].value = e.key;
            if(i != 3) numInputs[i+1].focus();
            else joinButton.style.display = 'inline-block';
        }
    });
}


goButton.addEventListener('click', async () => {
    const username = document.querySelector('.nameInput').value;

    if(user.tracks == [] || username == '') return;
    
    displayLobbyPage();

    user.serverConnection.addPlayer(user.tracks, username);

    return;
});

joinButton.addEventListener('click', () => {
    const gameCode = numInputs.map(i => i = i.value).join('');
    user.serverConnection.joinGame(gameCode);
    displayWaitingRoom(gameCode);

    return;
});

createButton.addEventListener('click', async () => {
    const gameCode = await user.serverConnection.createGame();
    user.serverConnection.joinGame(gameCode);
    displayWaitingRoom(gameCode);
    startButton.style.display = 'inline-block';

    return;
});

startButton.addEventListener('click', () => {
    user.serverConnection.startGame(user.currentGameCode);

    return;
});

searchButton.addEventListener('click', async () => {
    const query = document.querySelector('.searchInput').value;
    const results = await user.serverConnection.search(query);
    const topResult = processTrack(results[0]);
    user.tracks.push(topResult);
    addTrackToTrackPage(topResult);

    return;
});

const getUserInfo = async (token) => {
    const request = await fetch('https://api.spotify.com/v1/me/', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await request.json();

    const username = data.display_name;

    return { username };
}

const processTrack = (track) => {
    const songName = track.name;
    const albumCover = track.album.images[0].url;
    const artists = track.artists.map(i => i = i.name).join(', ');
    const uri = track.uri;

    return {
        songName,
        albumCover,
        artists,
        uri
    };
}


const addTrackToTrackPage = (track) => {
    const {songName, albumCover, artists} = track;

    const songHolder = document.createElement('div');
    songHolder.className = 'song';

    songHolder.innerHTML = `
        <img src="${albumCover}" class="albumCover">
        <div class="songText">
            <span class="songTitle">${songName}</span>
            <span class="songArtist">${artists}</span>
        </div>
    `
    const removeButton = document.createElement('div');
    removeButton.className = 'removeButton';
    removeButton.textContent = 'Remove';

    trackHolder.appendChild(songHolder);
    songHolder.appendChild(removeButton);

    removeButton.addEventListener('click', () => {
        user.tracks = user.tracks.filter(i => i.uri != track.uri);
        songHolder.remove();
    }); 

    if(isIOS) removeButton.style.opacity = 1;

    return;
}

const displayLobbyPage = () => {
    document.querySelector('.displayTracksPage').style.left = '-100%';
    document.querySelector('.lobbyPage').style.left = '0%';
    document.querySelector('.waitingRoomPage').style.left = '100%';
    document.querySelector('.roundPage').style.left = '200%';
    document.querySelector('.scoresPage').style.left = '300%';

    return;
}

const displayWaitingRoom = (gameCode) => {
    user.currentGameCode = gameCode;

    document.querySelector('.displayTracksPage').style.left = '-200%';
    document.querySelector('.lobbyPage').style.left = '-100%';
    document.querySelector('.waitingRoomPage').style.left = '0%';
    document.querySelector('.roundPage').style.left = '100%';
    document.querySelector('.scoresPage').style.left = '200%';
    document.querySelector('.waitingRoomPage > .gameCode').textContent = gameCode;
    return;
}

const playerJoin = (player) => {
    const playerElement = document.createElement('div');
    playerElement.className = 'player';

    playerElement.innerHTML = `
    <span class="username">${player.username}</span>
    `

    waitingRoomPlayerHolder.appendChild(playerElement);

    return;
}

const newTrack = (round) => {
    document.querySelector('.displayTracksPage').style.left = '-300%';
    document.querySelector('.lobbyPage').style.left = '-200%';
    document.querySelector('.waitingRoomPage').style.left = '-100%';
    document.querySelector('.roundPage').style.left = '0%';
    document.querySelector('.scoresPage').style.left = '100%';

    user.currentSelection = '';
    user.serverConnection.updateSelection(user.currentGameCode, '');

    document.querySelector('.roundPage > .title').innerHTML = `Who has listened to <span class="highlightedGreen">${round.track.songName}</span>`

    user.playbackController.loadUri(round.track.uri);

    currentPlayers = round.players;
    fillRoundPlayers(round);
    beginRoundProgessBar();
}

const beginRoundProgessBar = () => {
    const progessBar = document.querySelector('.progressBar');
    progessBar.style.transition = 'width 1s linear';

    let timeLeft = 14;

    setInterval(() => {
        if(timeLeft < 0) return;
        document.querySelector('.countdown').textContent = timeLeft;
        timeLeft--;
        progessBar.style.width = `${100 * timeLeft / 15}%`;
    }, 1000);
}

const roundScores = (scoreData) => {
    const players = scoreData.players.sort((a,b) => scoreData.scores[b.id] - scoreData.scores[a.id]);
    
    scoresPlayerHolder.innerHTML = '';
    for(let player of players){
        const playerElement = document.createElement('div');
        playerElement.className = 'player';

        const emoji = scoreData.correctPlayers[player.id] ? '✅' : '❌';

        playerElement.innerHTML = `
        <span class="username">${player.username}</span>
        <span class="score">${scoreData.scores[player.id]} ${emoji}</span>`;

        scoresPlayerHolder.appendChild(playerElement);
    }

    for(let id of scoreData.correctAnswers){
        const elem = document.getElementById(id);
    
        elem.style.background = 'var(--colorBright)';
        elem.style.color = '#FFF';
    }

    setTimeout(() => {
        displayScoresPage();
    },5*1000);

    return;
}

const displayScoresPage = () => {
    document.querySelector('.displayTracksPage').style.left = '-400%';
    document.querySelector('.lobbyPage').style.left = '-300%';
    document.querySelector('.waitingRoomPage').style.left = '-200%';
    document.querySelector('.roundPage').style.left = '-100%';
    document.querySelector('.scoresPage').style.left = '0%';
    document.querySelector('.progressBar').style.width = '100%';

}

const fillRoundPlayers = (round) => {
    roundPlayerHolder.innerHTML = '';
    for(let player of round.players){
        const playerElement = document.createElement('span');
        playerElement.className = 'player';
        playerElement.setAttribute('selected','false');
        playerElement.textContent = player.username;
        playerElement.id = player.id;

        playerElement.addEventListener('click', () => {
            const selected = playerElement.getAttribute('selected') == 'true';
            deselectAllRoundPlayers();
            if(!selected){
                user.currentSelection = player.id;
                playerElement.setAttribute('selected', 'true');
            } else {
                user.currentSelection = '';
            }
            user.serverConnection.updateSelection(user.currentGameCode, user.currentSelection);
        });

        roundPlayerHolder.appendChild(playerElement);
    }

    return;
}



const deselectAllRoundPlayers = () => {
    const elements = Array.from(document.querySelectorAll('.roundPage > .playerWindow > .playerHolder > .player'));
    for(let elem of elements) elem.setAttribute('selected', 'false');
    return;
}

window.onSpotifyIframeApiReady = (IFrameAPI) => {
    user.IFrameAPI = IFrameAPI;
    user.IFrameAPI.createController(playbackEmbed, {
        width: width * 0.2,
        height: width * 0.2 / 2.5
    }, (controller) => {
        user.playbackController = controller;
    });
}

const initializeServerListeners = () => {
    user.serverConnection.addEventListener('playerJoin', playerJoin);
    user.serverConnection.addEventListener('newTrack', newTrack);
    user.serverConnection.addEventListener('roundScores', roundScores);


    return;
}

initializeServerConnection();