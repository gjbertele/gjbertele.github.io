const chirpDuration = 0.1;
const chirpAmplitude = 10;
const sampleRate = 48000;
const chirpBuffer = new Float32Array(sampleRate * chirpDuration);
const minFrequency = 2000;
const maxFrequency = 3000;
const chirpsPerSecond = 1;

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
        this.correlationThreshold = 5;
        this.targetSample = 0;

        this.port.onmessage = (m) => {
            if(m.data.correlationThreshold){
                this.correlationThreshold = m.data.correlationThreshold;
            } else if(m.data.targetSample){
                this.targetSample = m.data.targetSample;
            }
        }
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
            const nearestExpectedEmit = this.targetSample + Math.round((this.overallPointer - this.targetSample) / 48000) * 48000;
            const expectedOffset = nearestExpectedEmit - this.overallPointer;
            const offsetStart = Math.max(0, expectedOffset - chirpBuffer.length);
            const offsetEnd = Math.min(this.recordingBuffer.length - chirpBuffer.length, expectedOffset + chirpBuffer.length);
            let peakCorrelation = -Infinity;
            let peak = -1;

            for(let offset = offsetStart; offset < offsetEnd; offset++){
                let correlation = 0;
                for(let i = 0; i < chirpBuffer.length; i++){
                    correlation += chirpBuffer[i] * this.recordingBuffer[offset + i];
                }
                if(correlation > peakCorrelation){
                    peakCorrelation = correlation;
                    peak = offset;
                }
            }


            if(peakCorrelation > this.correlationThreshold) {
                const absoluteArrival = this.overallPointer + peak;
                const nearestEmit = this.targetSample + Math.round((absoluteArrival - this.targetSample) / sampleRate) * sampleRate;
                const dt = (absoluteArrival - nearestEmit) / sampleRate;

                this.port.postMessage({ dt, peakCorrelation });
            }

            const tail = this.recordingBuffer.slice(peak + chirpBuffer.length);
            this.recordingBuffer = new Float32Array(sampleRate * chirpDuration * 6);
            this.recordingBuffer.set(tail, 0);
            this.recordingPointer = tail.length;
            this.overallPointer += peak + chirpBuffer.length;

        }

        return true;
    }
}
registerProcessor('audioProcessor', WorkletProcessor);