const recordVideo = async () => {
    if(user.recording.mediaRecorder != null) user.recording.mediaRecorder.stop();
    user.recording.mediaStream = await navigator.mediaDevices.getUserMedia(user.recording.mediaOptions);
}

