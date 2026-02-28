let removeSVG = `<svg class="removeButtonSVG" width="${document.body.clientHeight*0.04}" height="${document.body.clientHeight*0.04}" viewBox="0 0 118 118" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M78.6666 59H39.3333" stroke="#FFF" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.2917 59C12.2917 36.9815 12.2917 25.9723 19.1319 19.1319C25.9723 12.2917 36.9815 12.2917 59 12.2917C81.0183 12.2917 92.0277 12.2917 98.8683 19.1319C105.708 25.9723 105.708 36.9815 105.708 59C105.708 81.0183 105.708 92.0277 98.8683 98.8683C92.0277 105.708 81.0183 105.708 59 105.708C36.9815 105.708 25.9723 105.708 19.1319 98.8683C12.2917 92.0277 12.2917 81.0183 12.2917 59Z" stroke="#FFF" stroke-width="8.5"/>
</svg>`;

if(!isIOS) removeSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
<path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
<line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line>
</svg>`;

const addPlayerButton = document.querySelector('.addPlayer');
const playerElementHolder = document.querySelector('.playerHolder');
const afterPlayerHolder = document.querySelector('.afterPlayerHolder');
const impostorCountInput = document.querySelector('.impostorCount > .editableLabel');
const wordElementHolder = document.querySelector('.wordHolder');
const afterWordHolder = document.querySelector('.afterWordHolder');
const addWordButton = document.querySelector('.addWord');
const startGameButton = document.querySelector('.startGame');

impostorCountInput.value = 1;

let afterPlayerHolderTop = 30;
let afterWordHolderTop = 30;

let players = [];
let words = [];
let impostorCount = 1;

const addPlayer = () => {
    let newPlayerElement = document.createElement('div');
    newPlayerElement.className = 'card playerCard';

    let playerName = document.createElement('input');
    playerName.type = 'text';
    playerName.className = 'editableLabel'
    playerName.value = 'Player '+(players.length + 1);

    let removeButton = document.createElement('div');
    let svgRemoveChild = document.createElement('svg');
    removeButton.appendChild(svgRemoveChild);
    svgRemoveChild.outerHTML = removeSVG;
    removeButton.className = 'removeButton';


    let playerID = Math.floor(Math.random()*1000000);
    newPlayerElement.id = playerID;

    newPlayerElement.appendChild(playerName);
    newPlayerElement.appendChild(removeButton);


    playerElementHolder.appendChild(newPlayerElement);


    if(isIOS) newPlayerElement.style.top = (players.length * 10)+"vh";
    else newPlayerElement.style.top = (players.length * 7)+"dvh";

    afterPlayerHolderTop+=10;
    afterPlayerHolder.style.top = afterPlayerHolderTop+'vh';


    players.push({
        name: 'Player '+(players.length + 1),
        isImpostor:null,
        id: playerID
    });


    playerName.onchange = () => {
        for(let i = 0; i<players.length; i++){
            if(players[i].id != playerID) continue;
            players[i].name = playerName.value;
        }
        
        return;
    }

    removeButton.addEventListener('click',() => {
        afterPlayerHolderTop -= 10;
        afterPlayerHolder.style.top = afterPlayerHolderTop+'vh';
        

        for(let i = 0; i<players.length; i++){
            if(players[i].id == playerID) players.splice(i, 1);
        }

        let seenRemoval = false;

        for(let i in playerElementHolder.childNodes){
            let elem = playerElementHolder.childNodes[i];
            if(elem.id == playerID) playerElementHolder.removeChild(elem);
        }

        for(let i in playerElementHolder.childNodes){
            let elem = playerElementHolder.childNodes[i];
            if(!elem.style) continue;
            if(isIOS) elem.style.top = (i * 10) + "vh";
            else elem.style.top = (i * 7) + "dvh";
        }
        
        return;
    });

    return;
}

const addWord = (wordValue = '') => {
    let newWordElement = document.createElement('div');
    newWordElement.className = 'card wordCard';

    let wordContent = document.createElement('input');
    wordContent.type = 'text';
    wordContent.className = 'editableLabel'
    wordContent.placeholder = "Type Here";
    if(typeof wordValue == 'string') wordContent.value = wordValue;

    let removeButton = document.createElement('div');
    removeButton.className = 'removeButton';
    let svgRemoveChild = document.createElement('svg');
    removeButton.appendChild(svgRemoveChild);
    svgRemoveChild.outerHTML = removeSVG;

    newWordElement.appendChild(wordContent);
    newWordElement.appendChild(removeButton);

    wordElementHolder.appendChild(newWordElement);

    if(isIOS) newWordElement.style.top = (words.length * 10)+"vh";
    else newWordElement.style.top = (words.length * 7)+"dvh";
    
    afterWordHolderTop+=10;
    afterWordHolder.style.top = afterWordHolderTop+'vh';


    let wordID = Math.floor(Math.random()*1000000);
    newWordElement.id = wordID;

    words.push({
        word: wordValue,
        id: wordID
    });


    wordContent.onchange = () => {
        for(let i = 0; i<players.length; i++){
            if(words[i].id == wordID) words[i].word = wordContent.value;
        }
        return;
    }

    removeButton.addEventListener('click',() => {
        afterWordHolderTop -= 10;
        afterWordHolder.style.top = afterWordHolderTop+'vh';

        for(let i = 0; i<words.length; i++){
            if(words[i].id == wordID) words.splice(i, 1);
        }

        for(let i in wordElementHolder.childNodes){
            let elem = wordElementHolder.childNodes[i];
            if(elem.id == wordID) wordElementHolder.removeChild(elem);
        }

        for(let i in wordElementHolder.childNodes){
            let elem = wordElementHolder.childNodes[i];
            if(elem.style){
                if(isIOS) elem.style.top = (i * 10) + "vh";
                else elem.style.top = (i * 7) + "dvh";
            }
        }
        
        return;
    });

    return;
}

document.addEventListener('paste', (event) => {
    if(getComputedStyle(document.querySelector('.settingsPage')).display == 'none') return;
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text/plain');
    const words = pastedText.split('\n');
    for(let i = 0; i<words.length; i++) addWord(words[i]);
});



impostorCountInput.onchange = () => {
    impostorCount = impostorCountInput.value;
}

if(document.querySelector('.impostorCount > .addIcon')){
    document.querySelector('.impostorCount > .addIcon').onclick = () => {
    impostorCount++;
    impostorCountInput.value = impostorCount;
    }

    document.querySelector('.impostorCount > .subtractIcon').onclick = () => {
        impostorCount = Math.max(1, impostorCount - 1);
        impostorCountInput.value = impostorCount;
    }
}


addPlayerButton.onclick = addPlayer;
addPlayer();

addWordButton.onclick = addWord;
startGameButton.onclick = startGame;



