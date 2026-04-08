const recordVideo = async () => {
    if(user.recording.mediaRecorder != null) user.recording.mediaRecorder.stop();
    user.recording.mediaStream = await navigator.mediaDevices.getUserMedia(user.recording.mediaOptions);
    user.recording.mediaRecorder = new MediaRecorder(user.recording.mediaStream, { mimeType: 'video/webm; codecs=vp9,opus' });
    user.recording.mediaRecorder.addEventListener('dataavailable',videoChunkRecorded);
    user.recording.mediaRecorder.start(user.recording.dataOptions.fragmentTime);

    return;
}

const videoChunkRecorded = async (event) => {
    if(!event.data || event.data.size == 0) return;
    console.log(await event.data.arrayBuffer());
    user.server?.sendVideoChunkToServer(event.data);
}