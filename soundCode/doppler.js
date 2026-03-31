let tapSoundContext;
let tapSoundBuffer;
let audioCtx;
let audioSource;
let processorNode;
let toneFrequency = 20000;

const generateSolidSound = () => {
    const chirpAmplitude = 1;
    const sampleRate = 48000;
    const chirpBuffer = new Float32Array(sampleRate);

    for(let i = 0; i<sampleRate; i++){
        const t = i / sampleRate;
        const phase = t * toneFrequency;
        chirpBuffer[i] = chirpAmplitude * Math.sin(phase);
    }

    tapSoundBuffer = tapSoundContext.createBuffer(1, chirpBuffer.length, sampleRate);

    const channelData = tapSoundBuffer.getChannelData(0);
    channelData.set(chirpBuffer); 

    return;
}


const emitSound = () => {
    const source = tapSoundContext.createBufferSource();
    source.buffer = tapSoundBuffer;

    source.connect(tapSoundContext.destination);
    source.loop = true;

    source.start();

}

let isListener = false;

document.querySelector('.beacon').addEventListener('click', async () => {
    tapSoundContext = new AudioContext({ sampleRate: 48000 });
    generateSolidSound();
    await tapSoundContext.resume();
    document.querySelector('.buttons').style.display = 'none';

    emitSound();
});

const takeAudioStream = async (stream) => {
    audioCtx = new AudioContext({ sampleRate: 48000});
    audioSource = audioCtx.createMediaStreamSource(stream);
    await audioCtx.audioWorklet.addModule('./dopplerDetector.js');

    processorNode = new AudioWorkletNode(audioCtx, 'dopplerProcessor');

    audioSource.connect(processorNode);
    processorNode.connect(audioCtx.destination);

    processorNode.port.onmessage = (e) => {
       console.log(e.data);
    };
}


document.querySelector('.listener').addEventListener('click', async () => {
    navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: false,  
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 48000
    }})
    .then(takeAudioStream);
    document.querySelector('.buttons').style.display = 'none';
    isListener = true;
});
