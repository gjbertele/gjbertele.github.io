const mainInput = document.querySelector('.mainInput');
const guessHolder = document.querySelector('.guessHolder');
const submitButton = document.querySelector('.submitButton');
const autocomplete = document.querySelector('.autocomplete');

let randomWord = Object.keys(latinEmbeddings)[Math.floor(Math.random()*Object.keys(latinEmbeddings).length)];

let guessHistory = [];
let guessElements = [];
let autocompleteWords = Object.keys(latinEmbeddings);

const similarity = (A, B) => {
    A = latinEmbeddings[A];
    B = latinEmbeddings[B];

    let out = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i<25; i++) {
        out += A[i]*B[i];
        magA += A[i]*A[i];
        magB += B[i]*B[i];
    }

    return out/Math.sqrt(magA*magB);
}

let wordOrder = Object.keys(latinEmbeddings).sort((a,b) => similarity(b, randomWord) - similarity(a,randomWord));

const elemSimilarity = (elem) => {
    return parseFloat(elem.getAttribute('similarity'));
}

const getWordOrder = (word) => {
    let order = wordOrder.indexOf(word) + 1;
    if(order > 100) return '';
    return order+"/100";
}

const guessWord = () => {
    word = mainInput.value.toLowerCase();
    if(wordOrder.indexOf(word) == -1) return;

    let idx = guessHistory.indexOf(word);
    if(idx != -1){
        guessElements[idx].scrollIntoView();
        return;
    }

    mainInput.value = '';

    const wordElement = document.createElement('div');
    guessHolder.appendChild(wordElement);
    wordElement.setAttribute('similarity',similarity(word, randomWord));
    wordElement.className = 'guess';
    wordElement.innerHTML = `
        <span class="guessWord">${word}</span>
        <span class="guessSimilarity">${similarity(word, randomWord)}</span>
        <span class="guessRanking">${getWordOrder(word)}</span>
    `

    guessHistory.push(word);
    guessElements.push(wordElement);

    guessHistory.sort((a,b) => similarity(b, randomWord) - similarity(a, randomWord));
    guessElements.sort((a,b) => elemSimilarity(b) - elemSimilarity(a));

    for(let elem of guessElements) guessHolder.appendChild(elem);
    
    return;
}

mainInput.onkeyup = (e) => {
    if(e.key == 'Enter'){
        e.preventDefault();
        guessWord();
    }

    console.log(autocompleteWords);

    if(e.key == 'Backspace' || e.key == 'Enter'){
        autocompleteWords = Object.keys(latinEmbeddings).filter(i => i.startsWith(mainInput.value.toLowerCase())).sort((a,b) => a.length - b.length);
    } else {
        autocompleteWords = autocompleteWords.filter(i => i.startsWith(mainInput.value.toLowerCase()));
    }

    console.log(autocompleteWords, mainInput.value);

    if (mainInput.value == '') {
        autocomplete.textContent = '';
    } else {
        autocomplete.textContent = 'Do you mean '+autocompleteWords[0]+'?';
    }
}

submitButton.onclick = guessWord;