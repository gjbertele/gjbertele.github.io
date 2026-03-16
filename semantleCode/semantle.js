const mainInput = document.querySelector('.mainInput');
const guessHolder = document.querySelector('.guessHolder');
const submitButton = document.querySelector('.submitButton');
const autocomplete = document.querySelector('.autocomplete');
const guessableWords = ["dormio", "frater", "hora", "insula", "laboro", "lego", "meus", "pater", "rideo", "servus", "turba", "via", "cado", "cibus", "duco", "filia", "filius", "forum", "habeo", "habito", "intro", "magnus", "pecunia", "quaero", "quoque", "saluto", "specto", "video", "vinum", "voco", "ambulo", "amicus", "ancilla", "clamo", "clamor", "cum", "curro", "dico", "equus", "festino", "gladius", "laetus", "multus", "omnis", "per", "primus", "senator", "urbs", "vinco", "deus", "dominus", "donum", "laudo", "parvus", "periculum", "perterritus", "puella", "rex", "subito", "templum", "teneo", "tollo", "venio", "aqua", "audio", "cupio", "custos", "debeo", "do", "effugio", "iuvenis", "maneo", "nemo", "nolo", "nox", "porto", "possum", "pulcher", "respondeo", "taceo", "timeo", "vendo", "volo", "capio", "dies", "discedo", "exspecto", "facio", "iam", "in", "inquit", "maritus", "mater", "prope", "rogo", "sedeo", "sto", "totus", "tristis", "tuus", "uxor", "appropinquo", "epistula", "homo", "insula", "miles", "minime", "narro", "nauta", "nunc", "olim", "pars", "puer", "pugno", "res", "saepe", "silva", "tum", "vehementer", "ago", "bibo", "conspicio",  "domus", "gero", "iaceo", "incendo", "mox", "nihil", "noster", "porta", "postquam", "procedo", "senex", "surgo", "tandem", "trans", "coepi", "consumo", "intellego", "inter", "ita", "labor", "longus", "murus", "nomen", "paro", "post", "praemium", "quamquam", "qui", "semper", "summus", "suus", "tamen", "vivo", "amo", "amor", "cogito", "conficio", "consilium", "constituo", "dirus", "eos", "femina", "mons", "mors", "nec", "neco", "nescio", "numquam", "ostendo", "tempus", "terreo", "verbum", "antea", "bellum", "cena", "ceteri", "cognosco", "etiam", "hortus", "interea", "iubeo", "libertus", "multum", "nuntio", "puto", "simulatque", "villa", "aufero", "brevis", "celo", "hic", "ille", "imperium", "lego", "lux", "oro", "princeps", "rapio", "regina", "resisto", "revenio", "scio", "sentio"]

let latinEmbeddings = {};
for(let word in latinEmbeddingData) latinEmbeddings[word.toLowerCase()] = latinEmbeddingData[word];
const randomWord = guessableWords[Math.floor(Math.random()*guessableWords.length)];




let guessHistory = [];
let guessElements = [];
let autocompleteWords = Object.keys(latinEmbeddings);

const translateToEnglish = (word) => {
    for(let i = 0; i<latinDB.length; i++){
        if(latinDB[i][0].map(j => j = j.toLowerCase()).includes(word)) return latinDB[i][1];
    }
    return word;
}


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

    return Math.max(0,out/Math.sqrt(magA*magB));
}

let wordOrder = Object.keys(latinEmbeddings).sort((a,b) => similarity(b, randomWord) - similarity(a,randomWord));

const elemSimilarity = (elem) => {
    return parseFloat(elem.getAttribute('similarity'));
}

const getOptimalOrder = (word) => {
    let order = wordOrder.indexOf(word);
    while(order > 0 && similarity(wordOrder[order], randomWord) == similarity(wordOrder[order - 1], randomWord)) order--;
    return order;
}

const getWordOrder = (word) => {
    let order = getOptimalOrder(word) + 1;
    if(order > 100) return '';
    return order+"/100";
}

const guessWord = () => {
    let word = mainInput.value.toLowerCase();
    if(wordOrder.indexOf(word) == -1) return;

    let idx = guessHistory.indexOf(word);
    if(idx != -1){
        guessElements[idx].scrollIntoView();
        return;
    }

    mainInput.value = '';

    let similarityScore = Math.floor(similarity(word, randomWord)*100)+'%';

    const wordElement = document.createElement('div');
    guessHolder.appendChild(wordElement);
    wordElement.setAttribute('similarity',similarity(word, randomWord));
    wordElement.className = 'guess';
    wordElement.innerHTML = `
        <span class="guessWord">${word}</span>
        <span class="guessSimilarity">${similarityScore}</span>
        <span class="guessRanking">${getWordOrder(word)}</span>
    `

    guessHistory.push(word);
    guessElements.push(wordElement);

    guessHistory.sort((a,b) => similarity(b, randomWord) - similarity(a, randomWord));
    guessElements.sort((a,b) => elemSimilarity(b) - elemSimilarity(a));

    const guessWordElement = wordElement.querySelector('.guessWord');
    guessWordElement.onmouseover = () => {
        guessWordElement.textContent = translateToEnglish(word);
        setTimeout(() => {
            guessWordElement.textContent = word;
        },1000);
    }


    for(let i = 0; i<guessElements.length; i++){
        guessHolder.appendChild(guessElements[i]);
        guessElements[i].style.top = (4*i)+'%';
    }
    
    return;
}

autocomplete.onclick = () => {
    if(autocompleteWords.length > 0) mainInput.value = autocompleteWords[0];

    return;
}

mainInput.onkeyup = (e) => {
    if(e.key == 'Enter'){
        e.preventDefault();
        guessWord();
    } else if(e.key == 'Tab'){
        e.preventDefault();
        if(autocompleteWords.length > 0) mainInput.value = autocompleteWords[0];

        return;
    }

    if(e.key == 'Backspace' || e.key == 'Enter'){
        autocompleteWords = Object.keys(latinEmbeddings).filter(i => i.startsWith(mainInput.value.toLowerCase())).sort((a,b) => a.length - b.length);
    } else {
        autocompleteWords = autocompleteWords.filter(i => i.startsWith(mainInput.value.toLowerCase())); 
    }

    if (mainInput.value == '' || autocompleteWords[0] == mainInput.value || autocompleteWords.length == 0) {
        autocomplete.textContent = '';
    } else {
        autocomplete.textContent = 'Do you mean '+autocompleteWords[0]+'?'
    }
}

document.querySelector('.hintButton').onclick = () => {
    let bestGuess = "";
    if(guessHistory.length == 0) {
        bestGuess = wordOrder[200];
    } else {
        bestGuess = guessHistory[0];
    }

    let idx = getOptimalOrder(bestGuess);

    mainInput.value = wordOrder[Math.floor(idx / 2)];
    guessWord();

    console.log(idx, bestGuess);

    return;
}

submitButton.onclick = guessWord;