const sampleRate = 48000;
const chirpDuration = 0.1;
const chirpsPerSecond = 1;
const chirpFrequencies = [19000, 20000, 21000];
const chirpAmplitudes = [1, 2, 3];

const modDist = (x, y) => {
    const mod = sampleRate / chirpsPerSecond;
    let diff = ((x - y) % mod + mod) % mod;
    return Math.min(diff, mod - diff);
}


class WorkletProcessor extends AudioWorkletProcessor {

    constructor(){
        super();
    
        this.recordingBuffer = new Float32Array(4096);
        this.recordingPointer = 0;
        this.overallPointer = 0;
        this.firstPeak = 0;
        this.totalSamples = 0;
        this.fftWindowSize = 128;
        this.recordingBufferStart = 0;
    }

    process(inputs){
        inputs = inputs[0][0];
        this.totalSamples += inputs.length;

        let minDist = 1000000;
        let bestIdx = 0;

        for(let i = 0; i + this.fftWindowSize <= inputs.length; i++){
            let dist = 0;
            for(let j = 0; j<chirpFrequencies.length; j++){
                let sum = 0;
                for(let k = i; k<i+this.fftWindowSize; k++){
                    sum += inputs[k] *  Math.sin((k * 2 * Math.PI / 48000) * chirpFrequencies[j]);
                }
                dist += (sum - chirpAmplitudes[j])*(sum - chirpAmplitudes[j]);
            }
            if(dist < minDist) {
                minDist = dist;
                bestIdx = i;
            }
        }

        return true;
    }
}
registerProcessor('fftProcessor', WorkletProcessor);