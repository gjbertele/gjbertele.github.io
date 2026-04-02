const trackHolder = document.querySelector('.trackHolder')
const goButton = document.querySelector('.goButton');
const joinButton = document.querySelector('.joinButton');
const createButton = document.querySelector('.createButton');
const numInputs = [0, 1, 2, 3].map(i => i = document.querySelector(`.num${i}`));
const waitingRoomPlayerHolder = document.querySelector('.waitingRoomPage > .playerWindow > .playerHolder');
const startButton = document.querySelector('.startButton');
const playbackEmbed = document.querySelector('.playbackEmbed');
const roundPlayerHolder = document.querySelector('.roundPage > .playerWindow > .playerHolder');
const width = document.querySelector('.displayTracksPage').clientWidth;
const height = document.body.clientHeight;

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

    console.log(token);

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
    console.log(tracks);
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

    return;
}

const displayWaitingRoom = (gameCode) => {
    user.currentGameCode = gameCode;

    document.querySelector('.displayTracksPage').style.left = '-200%';
    document.querySelector('.lobbyPage').style.left = '-100%';
    document.querySelector('.waitingRoomPage').style.left = '0%';
    document.querySelector('.roundPage').style.left = '100%';
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

    user.currentSelection = '';
    user.serverConnection.updateSelection(user.currentGameCode, '');

    updateColorScheme(round.track);

    document.querySelector('.roundPage > .title').innerHTML = `Who has listened to <span class="highlightedGreen">${round.track.songName}</span>`
    

    user.playbackController.loadUri(round.track.uri);

    round.players = [{
        username:'a',
        id:0
    },{
        username:'b',
        id:1
    },{
        username:'c',
        id:2
    }];

    fillRoundPlayers(round);
}

const updateColorScheme = async (track) => {
    const colorScheme = await computeColorScheme(track);
    document.documentElement.style.setProperty('--colorSongBG',colorScheme.backgroundColor);
    document.documentElement.style.setProperty('--colorSongText',colorScheme.textColor);
    console.log(colorScheme);
}

const convertToHSL = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / (2 * 255);

    let hPrime = 0;
    if(r == max) hPrime = ((g - b) / (max - min));
    else if(g == max) hPrime = 2 + (b - r) / (max - min);
    else hPrime = 4 + (r - g) / (max - min);

    hPrime %= 6;

    let hue = 60 * hPrime;

    let saturation = 0;
    if(lightness != 0 && lightness != 1) saturation = (max - min) / (255 * (1 - Math.abs(2 * lightness - 1)));

    if(hue < 0) hue += 360;

    return [hue, saturation, lightness];
}

const scoreColor = (color) => {
    const [r, g, b] = [color._r, color._g, color._b];
    const luminance = convertToHSL(r, g, b)[2];

    const rgness = (r - g) / 255;
    const ybness = ((r + g) / 2 - b) / 255;

    const chroma = Math.sqrt(rgness ** 2 + ybness ** 2)

    const darkness = 1 - luminance;

    const score = chroma * 5 + 0.7 * darkness + 0.9 * color.proportion;

    return score;
}

let p;

const computeColorScheme = async (track) => {
    const newImg = document.createElement('img');
    newImg.src = track.albumCover;
    newImg.crossOrigin = 'anonymous';
    
    const promise = new Promise(async (resolve) => {
        newImg.addEventListener('load', async () => {
            const colorPalette = await ColorThief.getPalette(newImg, {
                ignoreWhite: true,
                whiteThreshold: 230,
                colorCount: 5
            });
            console.log(colorPalette);
            p = colorPalette;

            const color = colorPalette.sort((a,b) => scoreColor(b) - scoreColor(a))[0];
            const [r, g, b] = [color._r, color._g, color._b];
        
            console.log(color.textColor);

            resolve({
                backgroundColor: `rgb(${r},${g},${b})`,
                textColor: '#FFF'
            });

        });
    });

    return promise;
}

const fillRoundPlayers = (round) => {
    for(let player of round.players){
        const playerElement = document.createElement('span');
        playerElement.className = 'player';
        playerElement.setAttribute('selected','false');
        playerElement.textContent = player.username;

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
        width: width * 0.25,
        height: width * 0.1
    }, (controller) => {
        user.playbackController = controller;
    });
}

const initializeServerListeners = () => {
    user.serverConnection.addEventListener('playerJoin', playerJoin);
    user.serverConnection.addEventListener('newTrack', newTrack);



    return;
}