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
    user.location = 'crowd';
    if(window.location.href.includes('#host')){
        user.permissions = 2;
        user.location = 'priority';
    }

    user.name = document.querySelector('.nameInput').value;
    if(user.name == '') return;
    await initializeStreaming();
    recordVideo();
    displayPage('mainVideoPage');
});

joinSpectatorButton.addEventListener('click', async () => {
    user.permissions = 0;
    user.location = 'crowd';
    user.name = document.querySelector('.nameInput').value;
    if(user.name == '') return;
    await initializeStreaming();
    displayPage('mainVideoPage');
});

const attachStreamingListeners = () => {
    user.server.addEventListener('userUpdate', (data) => {
        const idx = getUserIdxById(data.id);
        if(idx == -1) return;

        if(data.user.location != connectedUsers[idx].location){
            if(data.user.location == 'top'){
                priorityMediaHolder.appendChild(connectedUsers[idx].mediaElement);
            } else {
                crowdMediaHolder.appendChild(connectedUsers[idx].mediaElement);
            }
        }

        for(let key in data.user){
            connectedUsers[idx][key] = data.user[key];
        }
        //todo: make it actually do something
    });

    user.server.addEventListener('forceRefresh', () => {
        window.location.reload();
    });
}

const createUserMediaElement = (targetUser) => {
    const card = document.createElement('div');
    card.className = 'userCard';

    const username = document.createElement('span');
    username.textContent = targetUser.name;
    username.className = 'username';

    const userOperations = document.createElement('div');
    userOperations.className = 'userOperations';
    if(user.permissions < 2) userOperations.style.display = 'none';

    const isolateButton = document.createElement('div');
    isolateButton.className = 'isolateButton button';
    isolateButton.textContent = '🔴';
    userOperations.appendChild(isolateButton);

    const removeButton = document.createElement('div');
    removeButton.className = 'removeButton button';
    removeButton.textContent = '❌';
    userOperations.appendChild(removeButton);

    removeButton.addEventListener('click', () => {
        user.server.forceUserRefresh(targetUser);
    });

    isolateButton.addEventListener('click', () => {
        user.server.promoteUser(targetUser);
    })

    card.appendChild(targetUser.streaming.videoElement);
    card.appendChild(username);
    card.appendChild(userOperations);

    return card;
    
}

document.body.addEventListener('userJoin', (event) => {
    const user = event.detail;
    if(user.permissions == 0) return;
    
    const videoElement = createUserMediaElement(user);

    const idx = getUserIdxById(user.id);
    console.log(connectedUsers);
    connectedUsers[idx].mediaElement = videoElement;

    if(user.location == 'crowd'){
        crowdMediaHolder.appendChild(videoElement);
    } else {
        priorityMediaHolder.appendChild(videoElement);
    }

    document.body.addEventListener('userLeave', (event) => {
        if(event.detail.id == user.id){
            console.log(videoElement);
            videoElement.remove();
        }
    });

});
