class WorkletProcessor extends AudioWorkletProcessor {
    constructor(){
        super();
        this.totalSamples = 0;
        this.sampleRate = 48000;
        this.frequencyRange = [19900, 20100];
        this.frequencySize = this.frequencyRange[1] - this.frequencyRange[0] + 1;
    }

    process(inputs){
        inputs = inputs[0][0];

        this.totalSamples += inputs.length;
        let maxAmplitude = 0;
        let maxFreq = -1;

        for(let i = 0; i<this.frequencySize; i++){
            let sinSum = 0;
            let cosSum = 0;
            let f = i + this.frequencyRange[0];

            for(let j = 0; j<inputs.length; j++){
                let t = j / this.sampleRate;
                sinSum += Math.sin(f*t)*inputs[j];
                cosSum += Math.cos(f*t)*inputs[j];
            }

            let amplitude = Math.sqrt(sinSum*sinSum + cosSum*cosSum);
            if(amplitude > maxAmplitude) {
                maxAmplitude = amplitude;
                maxFreq = f;
            }
        }

        this.port.postMessage({
            type:'dopplerData',
            maxFrequency: maxFreq
        });
        

        return true;
    }
}
registerProcessor('dopplerProcessor', WorkletProcessor);