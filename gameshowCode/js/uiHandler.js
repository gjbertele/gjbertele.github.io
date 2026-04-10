const joinContestantButton = document.querySelector('.joinContestantButton');
const joinSpectatorButton = document.querySelector('.joinSpectatorButton');
const pageNames = ['initialPage', 'mainVideoPage'];
const pages = pageNames.map(i => i = document.querySelector('.'+i));
const priorityMediaHolder = document.querySelector('.priorityMediaHolder');
const contestantMediaHolder = document.querySelector('.contestantMediaHolder');
const crowdMediaHolder = document.querySelector('.crowdMediaHolder');
const balloonToggle = document.querySelector('.balloonToggle');

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
            if(data.user.location == 'priority'){
                priorityMediaHolder.appendChild(connectedUsers[idx].mediaElement);
            } else if(data.user.location == 'contestant'){
                contestantMediaHolder.appendChild(connectedUsers[idx].mediaElement);
            } else if(data.user.location == 'crowd'){
                crowdMediaHolder.appendChild(connectedUsers[idx].mediaElement);
            }
        }


        if(data.user.audio == false){
            connectedUsers[idx].streaming.videoElement.muted = true;
        } else {
            connectedUsers[idx].streaming.videoElement.muted = false;
        }

        if(data.user.video == false){
            connectedUsers[idx].streaming.videoElement.style.display = 'none';
        } else {
            connectedUsers[idx].streaming.videoElement.style.display = 'inline-block';
        }


        for(let key in data.user){
            connectedUsers[idx][key] = data.user[key];
        }

        if(data.user.id == user.id){
            user.recording.mediaOptions.audio = data.user.audio;
            user.recording.mediaOptions.video = data.user.video;
            user.location = data.user.location;
            user.name = data.user.name;
        }
    });

    user.server.addEventListener('forceRefresh', () => {
        window.location.reload();
    });
}

const createUserMediaElement = (targetUser) => {
    const card = document.createElement('div');
    card.className = 'video-card';
    
    card.innerHTML = `
      <div class="video-feed">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#c9707f" stroke-width="1.5" style="opacity:0.2">
          <circle cx="16" cy="12" r="5"></circle><path d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10"></path>
        </svg>
      </div>
      <div class="card-footer">
        <span class="card-name">${targetUser.name}</span>
        <div class="card-actions">
            <button class="act-btn promoteButton">Move Up</button>
            <button class="act-btn demoteButton">Move Down</button>
            <button class="act-btn danger removeButton">Remove</button>
        </div>
      </div>
    `

    const removeButton = card.querySelector('.removeButton');
    const promoteButton = card.querySelector('.promoteButton');
    const demoteButton = card.querySelector('.demoteButton');

    removeButton.addEventListener('click', () => {
        user.server.forceUserRefresh(targetUser);
    });

    promoteButton.addEventListener('click', () => {
        const idx = getUserIdxById(targetUser.id);
        if(idx == -1) return;
        user.server.promoteUser(connectedUsers[idx]);
    });

    demoteButton.addEventListener('click', () => {
        const idx = getUserIdxById(targetUser.id);
        if(idx == -1) return;
        user.server.demoteUser(connectedUsers[idx]);
    });

    if(user.permissions < 2){
        removeButton.style.display = 'none';
        promoteButton.style.display = 'none';
        demoteButton.style.display = 'none';
    }


    const videoContentHolder = card.querySelector('.video-feed');

    videoContentHolder.appendChild(targetUser.streaming.videoElement);
    if(targetUser.audio == false) targetUser.streaming.videoElement.muted = true;
    if(targetUser.video == false) targetUser.streaming.videoElement.style.display = 'none';

    return card;
    
}

document.querySelector('.audioToggle').addEventListener('click', () => {
    const currentAudioState = user.recording.mediaOptions.audio != false;

    if(currentAudioState == true){
        user.recording.mediaOptions.audio = false;
    } else {
        user.recording.mediaOptions.audio = {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    }

    user.server.refreshPreferences(user);

});

document.querySelector('.cameraToggle').addEventListener('click', () => {
    const currentCameraState = user.recording.mediaOptions.video != false;

    if(currentCameraState == true){
        user.recording.mediaOptions.video = false;
    } else {
        user.recording.mediaOptions.video = {
            width:640,
            height:360
        }
    }

    user.server.refreshPreferences(user);

});

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




/*
TODO:
Add a chat?
Phone a friend
Bubble pop icon



*/