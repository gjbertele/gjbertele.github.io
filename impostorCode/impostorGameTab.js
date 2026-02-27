const playerStartElement = document.querySelector('.gamePage > .playerStart');
const playerGrid = document.querySelector('.gamePage > .playerGrid');
const backButtons = document.querySelectorAll('.backButton');
const displayTextArea = document.querySelector('.textDisplay');

let chosenWord = '';
let chosenCategory = '';

let chosenImpostors = [];
let seenWords = [];

const startGame = () => {
    document.querySelector('.settingsPage').style.display = 'none';
    document.querySelector('.gamePage').style.display = 'inline-block';

    chooseWord();
    chooseImpostors();
    choosePlayerStart();

    playerGrid.innerHTML = '';
    for(let i = 0; i<players.length; i++) addPlayerToGrid(players[i], i);

    return;
}

const addPlayerToGrid = (player, i) => {
    const newPlayerElement = document.createElement('div');
    newPlayerElement.className = 'card gridCard';
    
    const playerNameElement = document.createElement('span');
    playerNameElement.textContent = player.name;
    playerNameElement.className = 'playerName';

    const playerProfilePicture = document.createElement('div');
    playerProfilePicture.textContent = player.name.charAt(0);
    playerProfilePicture.className = 'playerProfile';

    newPlayerElement.appendChild(playerNameElement);
    newPlayerElement.appendChild(playerProfilePicture);

    playerGrid.appendChild(newPlayerElement);

    if(isIOS){
        if(i % 2 == 0) newPlayerElement.style.left = '10%';
        else newPlayerElement.style.right = '10%';

        newPlayerElement.style.top = (Math.floor(i/2)*42.5)+'vw';
        playerGrid.style.height = ((Math.floor(i/2)+1)*42.5)+'vw';
    } else {
        newPlayerElement.style.left = ((i%5)*90/5)+"dvw";
        newPlayerElement.style.top = (Math.floor(i/5)*17.5)+'dvw';

    }

    newPlayerElement.onclick = () => {
        displayPlayer(player, newPlayerElement);

        return;
    };


    return;
}

const getRandomWord = () => {
    if(words.length > 0 && Math.random() < 0.4){
        let randomIdx = Math.floor(Math.random()*words.length);
        return [words[randomIdx].word, 'customWord'];
    } else {
        let randomCategoryIdx = Math.floor(Math.random()*Object.keys(wordData).length);
        let category = Object.keys(wordData)[randomCategoryIdx];
        let randomIdx = Math.floor(Math.random()*wordData[category].length)
        return [wordData[category][randomIdx], category];
    }
}

const chooseWord = () => {
    let [randomWord, randomCategory] = getRandomWord();

    while(seenWords.includes(randomWord)) [randomWord, randomCategory] = getRandomWord();

    seenWords.push(randomWord);
    chosenWord = randomWord;
    chosenCategory = randomCategory;
    return;
}

const choosePlayerStart = () => {
    let randomIdx = Math.floor(Math.random()*players.length);
    playerStartElement.textContent = players[randomIdx].name+" Starts";

    return;
}

const chooseImpostors = () => {
    let playersClone = [];
    chosenImpostors = [];
    for(let i = 0; i<players.length; i++){
        players[i].isImpostor = false;
        playersClone.push(players[i]);
    }

    for(let i = 0; i<Math.min(impostorCount,playersClone.length); i++){
        let randomIdx = Math.floor(Math.random()*playersClone.length);
        chosenImpostors.push(playersClone[randomIdx]);
        playersClone.splice(randomIdx, 1);
    }

    for(let i = 0; i<chosenImpostors.length; i++){
        for(let j = 0; j<players.length; j++){
            if(chosenImpostors[i].id == players[j].id){
                players[j].isImpostor = true;
            }
        }
    }

    return;
}

const displayPlayer = (player, element) => {
    element.style.filter = 'brightness(75%)';
    element.style.boxShadow = 'none';
    element.onclick = null;
    
    if(!player.isImpostor){
        displayTextArea.innerHTML = `
        <span class="default">The word for </span>
        <span class="highlighted">${player.name}</span>
        <span class="default"> is </span>
        <span class="highlighted">${chosenWord}</span> 
        <span class="default"> and the category is </span>
        <span class="highlighted">${chosenCategory}</span>
        `
    } else {
        displayTextArea.innerHTML = `
        <span class="highlighted">${player.name}</span>
        <span class="default"> is an </span>
        <span class="highlightedRed">Impostor</span> 
        <span class="default"> and the category is </span>
        <span class="highlighted">${chosenCategory}</span>
        `
    }

    document.querySelector('.gamePage').style.display = 'none';
    document.querySelector('.playerDisplay').style.display = 'inline-block';
}


let lastBackTime = 0;

document.querySelector('.playerDisplay > .backButton').addEventListener('click', () => {
    if(Date.now() - lastBackTime < 1000) return;
    lastBackTime = Date.now();

    document.querySelector('.gamePage').style.display = 'inline-block';
    document.querySelector('.playerDisplay').style.display = 'none';
});

document.querySelector('.gamePage > .backButton').addEventListener('click', () => {
    if(Date.now() - lastBackTime < 1000) return;
    lastBackTime = Date.now();

    document.querySelector('.settingsPage').style.display = 'inline-block';
    document.querySelector('.gamePage').style.display = 'none';
});
