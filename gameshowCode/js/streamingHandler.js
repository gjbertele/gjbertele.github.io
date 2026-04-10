let user = {
    recording: {
        mediaRecorder: null,
        mediaStream: null,
        mediaOptions: {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            },
            video: {
                width: 640,
                height:360
            },
            frameRate: {
                ideal: 25,
                max: 30
            }
        },
        dataOptions: {
            fragmentTime: 100
        }
    },
    server: null,
    id: Math.floor(Math.random()*1000000),
    name: "",
    permissions: 0,
    location: 'crowd',
    mediaElement: null,
    heartState: true
}


let connectedUsers = [];

const getUserIdxById = (id) => {
    for(let idx in connectedUsers) if(connectedUsers[idx].id == id) return idx;
    return -1;
}

const initializeStreaming = async () => {
    user.server = new ServerConnection();
    await user.server.initialize();
    await user.server?.updateUserData(user);
    attachStreamingMediaListeners();
    attachStreamingListeners();
    return true;
}

const attachStreamingMediaListeners = () => {
    user.server.addEventListener('userJoin', userJoin);

    user.server.addEventListener('userLeave', (data) => {
        const customEvent = new CustomEvent('userLeave', {
            detail: {
                id: data.id
            }
        });
        document.body.dispatchEvent(customEvent);

        connectedUsers = connectedUsers.filter(i => i.id != data.id);
    });

    user.server.addEventListener('offer', onOffer);
    user.server.addEventListener('ice', onIce);
    user.server.addEventListener('answer', onAnswer);
}

const videoElementStorage = document.querySelector('.videoElementStorage');
const videoElementBuffer = 10;
const videoElements = [];
for(let i = 0; i<videoElementBuffer; i++){
    const videoElement = document.createElement('video');
    videoElementStorage.appendChild(videoElement);
    videoElements.push(videoElement);
}

const createVideoElement = () => {
    const videoElement = document.createElement('video');
    videoElementStorage.appendChild(videoElement);
    videoElements.push(videoElement);
    return videoElements.shift();
}

const establishPeerConnection = async (targetUser) => {
    if(user.server.openConnections[targetUser.id] != null) return;
    if(targetUser.id <= user.id) return;

    const newConnection = user.server.createPeerConnection(targetUser.id);
    console.log(newConnection);
    const offer = await newConnection.createOffer();
    await newConnection.setLocalDescription(offer);

    user.server.send(JSON.stringify({
        type:'offer',
        data: {
            to: targetUser.id,
            from: user.id,
            offer
        }
    }));

    return;
}

const onOffer = async (data) => {
    const newConnection = user.server.createPeerConnection(data.from);

    await newConnection.setRemoteDescription(data.offer);

    const answer = await newConnection.createAnswer();
    await newConnection.setLocalDescription(answer);

    user.server.send(JSON.stringify({
        type:'answer',
        data: {
            from:user.id,
            to:data.from,
            answer
        }
    }));
}

const onAnswer = async (data) => {
    const newConnection = user.server.openConnections[data.from];
    if(!newConnection) return;
    await newConnection.setRemoteDescription(data.answer);
}

const onIce = async (data) => {
    const newConnection = user.server.openConnections[data.from];
    if(!newConnection) return;
    await newConnection.addIceCandidate(data.candidate);
}

const userJoin = (joinedUser) => {
    const videoElement = createVideoElement();

    const newUser = {
        ...joinedUser,
        streaming: {
            videoElement
        }
    };

    const userJoinEvent = new CustomEvent('userJoin', {
        detail: newUser
    });

    if(user.id == joinedUser.id){
        videoElement.srcObject = user.recording.mediaStream;
        videoElement.play();
        videoElement.volume = 0;
    } else {
        establishPeerConnection(joinedUser);
    }
    


    connectedUsers.push(newUser);

    document.body.dispatchEvent(userJoinEvent);


}