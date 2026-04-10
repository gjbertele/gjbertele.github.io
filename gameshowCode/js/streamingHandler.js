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
    mediaElement: null
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
    attachStreamingListeners();
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
    videoElement.autoplay = true;
    videoElement.playsInline = true;

    mediaSource.addEventListener('sourceclose', () => {
        console.log('MediaSource CLOSED');
      });
      
      videoElement.addEventListener('error', e => {
        console.log('Video error:', videoElement.error);
      });


    const newUser = {
        ...user,
        streaming: {
            videoElement,
            mediaSource,
            sourceBuffer: null,
            queue: []
        }
    };

    const userJoinEvent = new CustomEvent('userJoin', {
        detail: newUser
    });


    connectedUsers.push(newUser);

    document.body.dispatchEvent(userJoinEvent);




    mediaSource.addEventListener('sourceopen', () => {
        const codec = "video/webm; codecs=vp8,opus";
        const sourceBuffer = mediaSource.addSourceBuffer(codec);
        sourceBuffer.mode = 'sequence';
        sourceBuffer.timestampOffset = 0;

        const idx = getUserIdxById(user.id);
        if(idx == -1) return;
    
        connectedUsers[idx].streaming.sourceBuffer = sourceBuffer;


        const queue = connectedUsers[idx].streaming.queue;
        if(queue.length > 0){
            appendToBuffer(mediaSource, sourceBuffer, queue.shift());
        }
    
        sourceBuffer.addEventListener('updateend', () => {
            const idx = getUserIdxById(user.id);
            if(idx == -1) return;
            const nextChunk = connectedUsers[idx].streaming.queue.shift();
            if(!nextChunk) return;
            appendToBuffer(connectedUsers[idx].streaming.mediaSource, connectedUsers[idx].streaming.sourceBuffer, nextChunk);
        });
    });
    
}

const appendToBuffer = (mediaSource, sourceBuffer, chunk) => {

    console.log('mediaSource state:', mediaSource.readyState);
    console.log('sourceBuffer mode:', sourceBuffer.mode);
    console.log('sourceBuffer updating:', sourceBuffer.updating);
    console.log('timestampOffset:', sourceBuffer.timestampOffset);
    console.log('chunk size:', chunk.byteLength);
    console.log('chunk first 4 bytes:', Array.from(chunk.slice(0,4)).map(b => b.toString(16)));
    
    sourceBuffer.appendBuffer(chunk);
}




const listenForData = () => {
    user.server.addEventListener('userJoin', userJoin);
    user.server.addEventListener('userLeave', (data) => {
        const idx = getUserIdxById(data.id);
        const user = connectedUsers[idx];
        const customEvent = new CustomEvent('userLeave', {
            detail: {
                id: data.id
            }
        });
        document.body.dispatchEvent(customEvent);

        connectedUsers = connectedUsers.filter(i => i.id != data.id);
    });
    user.server.addEventListener('videoData', (data) => {
        const idx = getUserIdxById(data.id);
        if(idx == -1) return;
        const chunk = new Uint8Array(data.buffer.data);
        const streaming = connectedUsers[idx].streaming;
    
        if(!streaming.sourceBuffer || streaming.sourceBuffer.updating){
            streaming.queue.push(chunk);
        } else {
            appendToBuffer(streaming.mediaSource, streaming.sourceBuffer, chunk);
        }
    });

    
}

/*
document.body.onclick = () => {
    for(let elem of (new Array(...document.querySelectorAll('video')))){
        if(elem) elem.play();
    }
}*/