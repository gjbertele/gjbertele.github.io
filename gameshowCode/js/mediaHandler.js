const recordVideo = async () => {
    if(user.recording.mediaRecorder != null) user.recording.mediaRecorder.stop();
    user.recording.mediaStream = await navigator.mediaDevices.getUserMedia(user.recording.mediaOptions);
    user.recording.mediaRecorder = new MediaRecorder(user.recording.mediaStream, { mimeType: 'video/webm; codecs=vp8,opus' });

    let initCaptured = false;

    user.recording.mediaRecorder.addEventListener('dataavailable', async (event) => {
        if(!event.data || event.data.size == 0) return;
        const buffer = await event.data.arrayBuffer();

        if(!initCaptured){
            initCaptured = true;
            user.recording.initChunk = buffer;
        }

        user.server?.sendVideoChunkToServer(event.data);
    });

    user.recording.mediaRecorder.start(user.recording.dataOptions.fragmentTime);
}

