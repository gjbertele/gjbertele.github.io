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
const width = document.querySelector('.displayTracksPage').clientWidth;
const height = document.body.clientHeight;

let currentPlayers = {};
let user = {
    username:'',
    profilePicture:'',
    recentTracks: [],
    serverConnection: null,
    currentGameCode: '',
    currentSelection: ''
}


const initializeServerConnection = async () => {
    user.serverConnection = new ServerConnection();
    await user.serverConnection.initialize();
    user.serverConnection.addPlayer(user.recentTracks, user.username, user.profilePicture);

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

document.body.addEventListener('tokenGranted', async (data) => {
    const token = data.detail.token;
    const userInfo = await getUserInfo(token);

    user.username = userInfo.username;
    user.profilePicture = userInfo.profilePicture;

    const recentTracks = await getRecentTracks(token);
    user.recentTracks = processRecentTracks(recentTracks);
    
    goButton.style.display = 'inline-block';

    displayTracksPage(token);
});

goButton.addEventListener('click', async () => {
    displayLobbyPage();
    await initializeServerConnection();

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

const getUserInfo = async (token) => {
    const request = await fetch('https://api.spotify.com/v1/me/', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await request.json();

    const username = data.display_name;
    const profilePicture = data.images[0].url;

    return { username, profilePicture };
}

const processRecentTracks = (tracks) => {
    let output = [];

    for(let track of tracks){
        const songName = track.track.name;
        const albumCover = track.track.album.images[0].url;
        const timePlayed = new Date(track.played_at);
        const artists = track.track.artists.map(i => i = i.name).join(', ');
        const uri = track.track.uri;

        const timeOfDay = getTimeOfDay(timePlayed);
        const songDay = getSongDay(timePlayed);

        output.push({
            songName,
            albumCover,
            timePlayed,
            artists,
            timeOfDay,
            songDay,
            uri
        });
    }

    return output;
}

const getRecentTracks = async (token) => {
    const request = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await request.json();
    
    return data.items;
}

const getTimeOfDay = (date) => {
    const timeString = date.toLocaleTimeString();
    const PMAM = timeString.split(' ')[1];
    const str = timeString.split(' ')[0].split(':').slice(0,2).join(':');

    return str + ' ' + PMAM;
}

const getSongDay = (date) => {
    const dayString = date.toLocaleDateString();
    const today = (new Date()).toLocaleDateString();

    if(today == dayString) return 'Today';
    if((new Date()) - date < 86400*1000) return 'Yesterday';
    return dayString.split('/').slice(0,2).join('/');
}

const displayTracksPage = () => {
    for(let track of user.recentTracks){
        const {songName, albumCover, timePlayed, artists, timeOfDay, songDay} = track;

        const songHolder = document.createElement('div');
        songHolder.className = 'song';

        songHolder.innerHTML = `
            <img src="${albumCover}" class="albumCover">
            <div class="songText">
                <span class="songTitle">${songName}</span>
                <span class="songArtist">${artists}</span>
            </div>
            <div class="songTime">
            <span class="songDay">${songDay}</span>
                <span class="timeOfDay">${timeOfDay}</span>
            </span>
        `
        

        trackHolder.appendChild(songHolder);
    }
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
    <img src=${player.profilePicture} class="profilePicture">
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

    round.players.push(...[{
        username:'a',
        id:0
    },{
        username:'b',
        id:1
    },{
        username:'c',
        id:2
    }]);
    

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
        <img src=${player.profilePicture} class="profilePicture">
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
        width: width * 0.8,
        height: width * 0.8 / 2.5
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