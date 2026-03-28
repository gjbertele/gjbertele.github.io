const chirpDuration = 0.1;
const chirpAmplitude = 10;
const sampleRate = 48000;
const chirpBuffer = new Float32Array(sampleRate * chirpDuration);
const minFrequency = 2000;
const maxFrequency = 3000;
const chirpsPerSecond = 1;

const chirpFrequencies = [19000, 20000, 21000];
const chirpAmplitudes = [1, 2, 3];

const modDist = (x, y) => {
    const mod = sampleRate / chirpsPerSecond;
    let diff = ((x - y) % mod + mod) % mod;
    return Math.min(diff, mod - diff);
}
const generateRisingChirp = () => {
    for(let i in chirpBuffer){
        const t = i / sampleRate;
        const phase = 2 * Math.PI * (minFrequency * t + (maxFrequency - minFrequency) * (t * t) / (2 * chirpDuration));
        chirpBuffer[i] = chirpAmplitude * Math.sin(phase);
    }
}

generateRisingChirp();


class WorkletProcessor extends AudioWorkletProcessor {

    constructor(){
        super();
    
        this.recordingBuffer = new Float32Array(sampleRate * chirpDuration * 6);
        this.recordingPointer = 0;
        this.overallPointer = 0;
        this.firstPeak = 0;
        this.totalSamples = 0;

        
    }

    process(inputs){
        inputs = inputs[0][0];

        this.totalSamples += inputs.length;

        const newInputs = inputs.length;
        for(let i = 0; i<newInputs; i++){
            this.recordingBuffer[this.recordingPointer] = inputs[i];
            this.recordingPointer++;
        }

        

        if(this.recordingPointer > sampleRate * chirpDuration * 3) {
            const chirpCandidates = this.recordingBuffer.slice(0, this.recordingPointer);
            const correlation = new Array(sampleRate * chirpDuration * 2);

            let peak = 0;
            for(let offset = 0; offset < correlation.length; offset++){
                let sum = 0;
                for (let i = 0; i < chirpBuffer.length; i++) {
                    sum += chirpCandidates[i + offset] * chirpBuffer[i];
                }
                correlation[offset] = sum;
                if(correlation[offset] >= correlation[peak]) peak = offset;
            }


            const dt = modDist(this.overallPointer + peak, this.firstPeak) / (sampleRate / chirpsPerSecond);


            if(correlation[peak] > 2) {
                if(this.firstPeak == 0) this.firstPeak = this.overallPointer + peak;
                this.port.postMessage({
                    dt
                })
            }


            this.overallPointer += this.recordingPointer;
            this.recordingPointer = 0;
            this.recordingBuffer = new Float32Array(sampleRate * chirpDuration * 6);
        }

        return true;
    }
}
registerProcessor('audioProcessor', WorkletProcessor);