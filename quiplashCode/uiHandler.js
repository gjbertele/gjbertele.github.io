const pageNames = ['initialPage', 'waitingRoomPage', 'questionPage', 'answerPage']
const pageElements = pageNames.map(i => i = document.querySelector('.'+i));
const joinButton = document.querySelector('.joinButton');
const nameInput = document.querySelector('.nameInput');
const playerHolder = document.querySelector('.playerHolder');
const startButton = document.querySelector('.startButton');
const submitButton = document.querySelector('.submitButton');
const answerInput = document.querySelector('.questionAnswer');

let user = {
    name: '',
    id: 0
}

let server;


answerInput.addEventListener('keydown', (e) => {
    if(e.key == 'Enter') e.preventDefault();
});

joinButton.addEventListener('click', async () => {
    if(nameInput.value == '') return;

    user.name = nameInput.value;
    user.id = Math.floor(Math.random()*1000000);
    server = new ServerConnection();

    await server.initialize();
    initializeServerListeners();
    await server.emitEvent('addUser', user);
    
    displayPage('waitingRoomPage');
    return;
});

startButton.addEventListener('click', async () => {
    await server.emitEvent('gameStart');
    return;
});

submitButton.addEventListener('click', async () => {
    const answerText = answerInput.value;
    answerInput.value = '';

    if(answerText == '') return;

    await server.emitEvent('submitAnswer', {
        text: answerText
    });

    document.querySelector('.questionPage > .contentHolder').style.display = 'none';
    document.querySelector('.waiting').style.display = 'inline-block';
});

const initializeServerListeners = () => {
    server.addEventListener('userJoin', userJoin); 
    server.addEventListener('questionData', questionReceived);
    server.addEventListener('answerData', answersReceived);
}

const userJoin = (user) => {
    const elem = document.createElement('span');
    elem.textContent = user.name;
    playerHolder.appendChild(elem);

    server.addEventListener('userLeave', (leaveData) => {
        if(leaveData.id == user.id && elem) elem.remove();
    });
}

const questionReceived = (question) => {
    const questionTexts = [...document.querySelectorAll('.questionText')];
    questionTexts.forEach(i => i.textContent = question.question + ' ');

    displayPage('questionPage');

    return;
}

const answersReceived = (answers) => {
    const answerHolder = document.querySelector('.answerHolder');
    answerHolder.innerHTML = '';

    for(let answer of answers.answers){
        const answerElement = document.createElement('span');
        answerElement.textContent = answer.text;
        answerElement.className = 'answerElement';

        answerElement.addEventListener('click', async () => {
            await server.emitEvent('submitVote', {
                for: answer.userid
            });

            for(let elem of [...document.querySelectorAll('.answerElement')]) elem.style.background = 'transparent';
            answerElement.style.background  = 'var(--colorDark)';

            return;
        });

        let listenerID = server.addEventListener('voteData', (votes) => {
            server.removeEventListener(listenerID);

            const answerInfo = votes.counts.filter(i => i.id == answer.userid)[0];
            if(!answerInfo) return;

            console.log(answerInfo);

            answerElement.style.background = 'transparent';
            answerElement.innerHTML = `
                <span class="username">${answerInfo.name}</span>
                <span class="question">${answer.text}</span>
                <span class="count">${answerInfo.count} Vote${answerInfo.count != 1 ? 's' : ''}</span>
            `;
        });

        answerHolder.appendChild(answerElement);
    }

    displayPage('answerPage');

    return;
}


const displayPage = (pageName) => {
    const offset = pageNames.indexOf(pageName);
    for(let i = 0; i<pageElements.length; i++){
        if(pageElements[i]) pageElements[i].style.left = ((i - offset)*100)+'%';
    }

    if(pageName == 'questionPage'){
        document.querySelector('.questionPage > .contentHolder').style.display = 'inline-block';
        document.querySelector('.waiting').style.display = 'none';
    }

    return;
}
