const joinButton = document.querySelector('.joinButton');
const createButton = document.querySelector('.createButton');
const initialPage = document.querySelector('.initialPage');
const lobbyPage = document.querySelector('.lobbyPage');
const testPage = document.querySelector('.testPage');
const scoresPage = document.querySelector('.scoresPage');
const guessPage = document.querySelector('.guessPage');
const numInputs = [1, 2, 3, 4].map(i => i = document.querySelector('.num'+i));
const questionHolder = document.querySelector('.testPage .questionHolder');
const nameHolder = document.querySelector('.testPage .nameHolder');
const nameLabel = document.querySelector('.testPage .nameLabel');
const confessHolder = document.querySelector('.testPage .confessHolder');
const confessLabel = document.querySelector('.testPage .confessLabel');
const submitTestButton = document.querySelector('.testPage .submitTestButton');
const playerHolder = document.querySelector('.lobbyPage > .playerHolder');
const startButton = document.querySelector('.lobbyPage > .startGame');
const scoresHolder = document.querySelector('.scoresPage > .playerHolder');
const questionText = document.querySelector('.guessPage > .question > .questionText');
const playerSelection = document.querySelector('.guessPage > .playerHolder');
const submitResponsesButton = document.querySelector('.guessPage > .submitSelectionButton');

let serverConnection;
let gameData;
let currentRoundSelections = [];

const checkToDisplayJoinButton = () => {
    let allFull = true;
    for(let i = 0; i<4; i++) allFull &= (numInputs[i].value != '');

    if(allFull){
        document.querySelector('.joinButton').style.display = 'inline-block';
    } else {
        document.querySelector('.joinButton').style.display = 'none';
    }

    return;
}

for(let i = 0; i<4; i++){
    numInputs[i].addEventListener('keyup', (e) => {
        if(e.key == 'Backspace') {
            numInputs[i].value = '';
            if(i != 0) numInputs[i-1].focus();
        } else if(!isNaN(parseInt(e.key))){
            numInputs[i].value = e.key;
            if(i != 3) numInputs[i+1].focus();
        } else {
           numInputs[i].value = '';
        }
        checkToDisplayJoinButton();
    });
}

joinButton.addEventListener('click', async () => {
    let gameCode = '';
    for(let i = 0; i<4; i++) gameCode += numInputs[i].value;

    const successfulJoin = await joinGameServer(gameCode);
    if(successfulJoin == false) return;

    initialPage.style.display = 'none';
    lobbyPage.style.display = 'inline-block';

    return;
});

createButton.addEventListener('click', async () => {
    const serverData = await serverConnection.createGame();

    await joinGameServer(serverData.gameCode);

    document.querySelector('.waitingText').style.display = 'none';
    initialPage.style.display = 'none';
    startButton.style.display = 'inline-block';
    lobbyPage.style.display = 'inline-block';

    return;
});

startButton.addEventListener('click', async () => {
    await serverConnection.startGame(gameData.gameCode);
    return;
});

const addQuestion = (text, number) => {
    const questionContainer = document.createElement('div');
    questionContainer.className = "question";

    questionContainer.innerHTML = `
        <span class="questionText">${text}</span>
        <div class="questionCheckbox">
            <svg class="interior" viewBox="0 0 14 14"><polyline points="2,7 6,11 12,3"/></svg>
        </div>
    `

    questionContainer.setAttribute('checked','false');
    
    questionContainer.onclick = () => {
        if(questionContainer.getAttribute('checked') == 'false') questionContainer.setAttribute('checked','true');
        else questionContainer.setAttribute('checked','false');
    };
    
    questionHolder.insertBefore(questionContainer, confessLabel);

    return;
}

for(let i in questionList) addQuestion(questionList[i], i);

submitTestButton.addEventListener('click', async () => {
    let answerString = '';

    for(let elem of questionHolder.querySelectorAll('.question')){
        let checked = elem.getAttribute('checked') == 'true';
        answerString += checked ? '1' : '0';
    }
    
    document.cookie = 'answers='+answerString;

    let username = nameHolder.value;
    let confession = confessHolder.value;

    if(username.length == 0) return;

    serverConnection = await submitTestToServer(answerString, username, confession)
    initializeEventListeners();
    serverConnection.updateQuestionsList(questionList);

    testPage.style.display = 'none';
    initialPage.style.display = 'flex';
});

const initializeEventListeners = () => {
    serverConnection.on('playerJoin', addPlayerToHolder);
    serverConnection.on('playerLeave', removePlayerFromHolder);
    serverConnection.on('newRound', newRound);

    return;
}

const addPlayerToHolder = (player) => {
    const newElement = document.createElement('span');
    newElement.className = 'playerName';
    newElement.textContent = player.username;
    
    playerHolder.appendChild(newElement);

    return;
}

const removePlayerFromHolder = (player) => {
    console.log('remove event',player);
    for(let elem of playerHolder.childNodes){
        if(elem.textContent == player.username) elem.remove();
    }

    let counter = 0;
    
    for(let i in playerHolder.childNodes){
        if(playerHolder.childNodes[i].style != undefined){
            playerHolder.childNodes[i].style.top = (-5 + 5*counter)+'dvh';
            counter++;
        }
    }

    return;
}


const joinGameServer = async (gameCode) => {
    gameData = await serverConnection.joinGame(gameCode);
    if(gameData == false) return false;

    for(let i in gameData.players){
        addPlayerToHolder(gameData.players[i], i);
    }

    document.querySelector('.gameCode').textContent = gameCode;

    return true;
}

const submitTestToServer = async (answerString, username, confession) => {
    let playerData = {
        playerID:Math.floor(Math.random()*1000000),
        username,
        responses:answerString.split(''),
        netScore:0,
        confession
    };

    return new ServerConnection(playerData);
}

const newRound = async (roundData) => {
    console.log('new round',roundData);
    currentRoundSelections = [];
    displayScores(roundData.scores, roundData.players);
    setTimeout(() => {
       displayQuestion(roundData.question, roundData.players);
       submitResponsesButton.style.opacity = 1;
    },5000);
}

const addScoreBox = (playerName, scoreData, maxScore, index) => {
    const scoreContainer = document.createElement('div');
    scoreContainer.className = 'scoreContainer';

    const playerText = document.createElement('span');
    playerText.className = 'playerName';
    playerText.textContent = playerName;
    scoreContainer.appendChild(playerText);

    const scoreBox = document.createElement('div');
    scoreBox.className = 'scoreBox';
    scoreContainer.appendChild(scoreBox);

    scoreBox.style.width = Math.floor(15 + Math.max(0, scoreData.netScore * 40 / maxScore)) + '%';

    let diffText = scoreData.diff >= 0 ? '+'+scoreData.diff : scoreData.diff;

    const scoreText = document.createElement('div');
    scoreText.className = 'scoreText';
    scoreText.textContent = scoreData.netScore + ' ' + diffText;
    scoreBox.appendChild(scoreText);

    scoresHolder.appendChild(scoreContainer);
    scoreContainer.style.top = (1+6*index) + 'dvh';

    return;
}

const displayScores = (scoreData, players) => {
    players.sort((a,b) => {
        return scoreData[b].netScore - scoreData[a].netScore
    });

    let maxScore = 0;
    for(let i in scoreData) maxScore = Math.max(scoreData[i].netScore, maxScore);
    if(maxScore == 0) maxScore = 10;

    scoresHolder.innerHTML = '';

    for(let i in players){
        addScoreBox(players[i], scoreData[players[i]], maxScore, i);
    }


    lobbyPage.style.display = 'none';
    guessPage.style.display = 'none';
    scoresPage.style.display = 'inline-block';

    return;
}

const displayQuestion = (question, players) => {
    let replacePairs = [['think','thinks'],['pick ','picks '],['would','would']]
    let replaced = false;
    
    for(let pair of replacePairs){
        replaced |= question.startsWith(pair[0]);
        question = question.replaceAll(pair[0], pair[1]);
    }

    document.querySelector('.questionPrefix').textContent = 'Someone '+(!replaced ? 'has ' : '');

    questionText.textContent = question;

    playerSelection.innerHTML = '';

    setTimeout(() => {
        for(let i in players){
            addPlayerSelectionBox(players[i]);
        }
    }, 50);

    lobbyPage.style.display = 'none';
    guessPage.style.display = 'inline-block';
    scoresPage.style.display = 'none';

    return;
}

const addPlayerSelectionBox = (playerName) => {
    const newElement = document.createElement('div');
    newElement.className = 'selectionBox';
    newElement.textContent = playerName;
    newElement.setAttribute('selected','false');
    playerSelection.appendChild(newElement);
    

    newElement.style.top = (6*playerSelection.childNodes.length - 5)+'dvh';

    newElement.addEventListener('click', () => {
        if(newElement.getAttribute('selected') == 'true'){
            newElement.setAttribute('selected','false');
            currentRoundSelections = currentRoundSelections.filter(i => i != playerName);
        } else {
            newElement.setAttribute('selected','true');
            currentRoundSelections.push(playerName);
        }
    });

    return;
}

submitResponsesButton.addEventListener('click', async () => {
    await serverConnection.submitResponses(currentRoundSelections);
    submitResponsesButton.style.opacity = '0.6';
    return;
});

for(let cookie of document.cookie.split('; ')){
    if(cookie.startsWith('answers=')){
        let responses = cookie.substring(8).split('');
        for(let i = 0; i<responses.length; i++){
            document.querySelector(`.questionHolder > div:nth-child(${i+1})`)?.setAttribute('checked',responses[i] == '1' ? 'true' : 'false');
        }   
    }
}