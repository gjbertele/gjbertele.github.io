let user = {
    recording: {
        mediaRecorder: null,
        mediaStream: null,
        mediaOptions: {
            audio: true,
            video: true,
            width: 640,
            height: 360,
            frameRate: {
                ideal: 25,
                max: 30
            }
        },
        dataOptions: {
            fragmentTime: 250
        }
    },
    server: null,
    id: Math.floor(Math.random()*1000000),
    name: "",
    permissions: 0
}


let connectedUsers = [];

const getUserIdxById = (id) => {
    for(let idx in connectedUsers) if(connectedUsers[idx].id == id) return idx;
    return -1;
}

const initializeStreaming = async () => {
    user.server = new ServerConnection();
    await user.server.initialize();
    listenForData();
    await user.server?.updateUserData(user);
    return true;
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


const userJoin = (user) => {
    const videoElement = createVideoElement();
    const mediaSource = new MediaSource();
    videoElement.src = window.URL.createObjectURL(mediaSource);
    document.body.appendChild(videoElement);
    videoElement.autoplay = true;
    videoElement.playsInline = true;

    connectedUsers.push({
        ...user,
        streaming: {
            videoElement,
            mediaSource,
            sourceBuffer: null,
            queue: []
        }
    });



    mediaSource.addEventListener('sourceopen', () => {
        const codec = "video/webm; codecs=vp9,opus";
        const sourceBuffer = mediaSource.addSourceBuffer(codec);
        
        const idx = getUserIdxById(user.id);
        if(idx == -1) return;

        sourceBuffer.addEventListener('updateend', () => {
            const idx = getUserIdxById(user.id);
            if(idx == -1) return;
            let nextChunk = connectedUsers[idx].streaming.queue.shift();
            console.log(nextChunk);
            if(!nextChunk) return;
            connectedUsers[idx].streaming.sourceBuffer.appendBuffer(nextChunk);
        })
        connectedUsers[idx].streaming.sourceBuffer = sourceBuffer;
    });
    
}



const listenForData = () => {
    user.server.addEventListener('userJoin', userJoin);
    user.server.addEventListener('userLeave', (data) => {
        connectedUsers = connectedUsers.filter(i => i.id != data.id);
    });
    user.server.addEventListener('videoData', (data) => {
        const idx = getUserIdxById(data.id);
        if(idx == -1) return;
        const chunk = new Uint8Array(data.buffer.data);
        if(!connectedUsers[idx].streaming.sourceBuffer || connectedUsers[idx].streaming.sourceBuffer.updating){
            connectedUsers[idx].streaming.queue.push(chunk);
            console.log('push chunk',chunk);
        } else {
            connectedUsers[idx].streaming.sourceBuffer.appendBuffer(chunk);
        }
    });
}


document.body.onclick = () => {
    for(let elem of (new Array(...document.querySelectorAll('video')))){
        if(elem) elem.play();
    }
}