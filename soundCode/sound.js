let tapSoundContext;
let tapSoundBuffer;
let audioCtx;
let audioSource;
let processorNode;
let minFrequency = 2000;
let maxFrequency = 3000;

const timeDisplay = document.querySelector('.timeDisplay');
const distDisplay = document.querySelector('.distDisplay');

const generateRisingTapBuffer = () => {
    const chirpDuration = 0.1;
    const chirpAmplitude = 1;
    const sampleRate = 48000;
    const chirpBuffer = new Float32Array(sampleRate);

    for(let i = 0; i<chirpDuration * sampleRate; i++){
        const t = i / sampleRate;
        const phase = 2 * Math.PI * (minFrequency * t + (maxFrequency - minFrequency) * (t * t) / (2 * chirpDuration));
        chirpBuffer[i] = chirpAmplitude * Math.sin(phase);
    }

    tapSoundBuffer = tapSoundContext.createBuffer(1, chirpBuffer.length, sampleRate);

    const channelData = tapSoundBuffer.getChannelData(0);
    channelData.set(chirpBuffer); 

    return;
}


const generateMultitonalChirp = () => {
    const chirpDuration = 0.1;
    const sampleRate = 48000;
    const chirpBuffer = new Float32Array(sampleRate);
    const chirpFrequencies = [19000, 20000, 21000];
    const chirpAmplitudes = [1, 2, 3];

    for(let i = 0; i<chirpDuration * sampleRate; i++){
        chirpBuffer[i] = 0;
        for(let j = 0; j<chirpFrequencies.length; j++){
            chirpBuffer[i] += chirpAmplitudes[j] * Math.sin((i * 2 * Math.PI / 48000) * chirpFrequencies[j]);
        }
    }

    tapSoundBuffer = tapSoundContext.createBuffer(1, chirpBuffer.length, sampleRate);

    const channelData = tapSoundBuffer.getChannelData(0);
    channelData.set(chirpBuffer); 

}


const emitSound = () => {
    const source = tapSoundContext.createBufferSource();
    source.buffer = tapSoundBuffer;

    const now = tapSoundContext.currentTime;
    source.connect(tapSoundContext.destination);

    const timeToSecond = (1000 - (performance.now() % 1000)) % 1000;
    source.start(now + timeToSecond / 1000);
}

let isListener = false;

document.querySelector('.beacon').addEventListener('click', async () => {
    tapSoundContext = new AudioContext({ sampleRate: 48000 });
    generateRisingTapBuffer();
    await tapSoundContext.resume();
    document.querySelector('.buttons').style.display = 'none';

    setInterval(() => {
        emitSound();
    }, 1000)
});

const takeAudioStream = async (stream) => {
    audioCtx = new AudioContext({ sampleRate: 48000});
    audioSource = audioCtx.createMediaStreamSource(stream);
    await audioCtx.audioWorklet.addModule('./soundCode/audioProcessor.js');

    processorNode = new AudioWorkletNode(audioCtx, 'audioProcessor');

    audioSource.connect(processorNode);
    processorNode.connect(audioCtx.destination);

    let lastChirp = {
        dt:0,
        timeReceived: 0
    }

    processorNode.port.onmessage = (e) => {
        if(Date.now() - lastChirp.timeReceived < 0.8 && e.data.dt > lastChirp.dt) return;
        lastChirp.timeReceived = Date.now();
        lastChirp.dt = e.data.dt;

        updateDisplays(lastChirp)
    };
}

const updateDisplays = (chirp) => {
    //if(chirp.dt * 343.14 > 15) return;
    timeDisplay.innerHTML = `${chirp.dt.toFixed(4)}<span class="small">sec</span>`
    distDisplay.innerHTML = `${(chirp.dt * 343.14).toFixed(2)}<span class="small">m</span>`
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
