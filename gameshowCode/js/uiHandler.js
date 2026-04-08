const joinContestantButton = document.querySelector('.joinContestantButton');
const joinSpectatorButton = document.querySelector('.joinSpectatorButton');
const pageNames = ['initialPage', 'mainVideoPage'];
const pages = pageNames.map(i => i = document.querySelector('.'+i));
const priorityMediaHolder = document.querySelector('.priorityMediaHolder');
const crowdMediaHolder = document.querySelector('.crowdMediaHolder');

const displayPage = (pageName) => {
    const idx = pageNames.indexOf(pageName);
    for(let i = 0; i < pageNames.length; i++){
        if(pages[i]) pages[i].style.left = `${(i - idx)*100}%`;
    }

    return;
}

joinContestantButton.addEventListener('click', async () => {
    user.permissions = 1;
    user.name = document.querySelector('.nameInput').value;
    if(user.name == '') return;
    await initializeStreaming();
    recordVideo();
    displayPage('mainVideoPage');
});

joinSpectatorButton.addEventListener('click', async () => {
    user.permissions = 0;
    user.name = document.querySelector('.nameInput').value;
    if(user.name == '') return;
    await initializeStreaming();
    displayPage('mainVideoPage');
});

const attachStreamingListeners = () => {
    user.server.addEventListener('userUpdate', (data) => {
        const idx = getUserIdxById(data.id);
        if(idx == -1) return;
        for(let key in data.user){
            connectedUsers[idx][key] = data.user[key];
        }
        connectedUsers[idx].streaming.videoElement.style.display = data.user.showVideo ? 'inline-block' : 'none';
        connectedUsers[idx].streaming.videoElement.muted = data.user.showAudio;
    });
}

const createUserMediaElement = (user) => {
    const card = document.createElement('div');
    card.className = 'userCard';

    const username = document.createElement('span');
    username.textContent = user.name;
    username.className = 'username';

    const userOperations = document.createElement('div');

    const userBalloon = document.createElement('div');
    //TODO

    card.appendChild(user.streaming.videoElement);
    card.appendChild(username);
    card.appendChild(userOperations);
    card.appendChild(userBalloon);

    return card;
    
}

document.body.addEventListener('userJoin', (event) => {
    const user = event.detail;
    if(user.permissions == 0){
        return;
    } else if(user.permissions == 1){
        const videoElement = createUserMediaElement(user);
        crowdMediaHolder.appendChild(videoElement);
    } else {
        const videoElement = createUserMediaElement(user);
        priorityMediaHolder.appendChild(videoElement);
    }
});

