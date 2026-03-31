const speedOfSound = 343.14;

class WorkletProcessor extends AudioWorkletProcessor {
    constructor(){
        super();
        this.totalSamples = 0;
        this.sampleRate = 48000;
        this.frequencyTargets = [20000];
        this.frequencyBand = 3000;
    }

    process(inputs){
        inputs = inputs[0][0];

        this.totalSamples += inputs.length;

        let frequenciesObserved = [];

        for(let i = 0; i<this.frequencyTargets.length; i++){
            let maxAmplitude = 0;
            let maxFreq = -1;
            let frequency = this.frequencyTargets[i];

            for(let f = frequency - this.frequencyBand; f <= frequency + this.frequencyBand; f++){
                let sinSum = 0;
                let cosSum = 0;

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
            
            frequenciesObserved.push(maxFreq);
        }   

        let calculatedSpeeds = [];
        

        for(let i = 0; i<this.frequencyTargets.length; i++){
            let v = speedOfSound * (frequenciesObserved[i] / this.frequencyTargets[i] - 1);
            calculatedSpeeds.push(v);
        }

        this.port.postMessage({
            type:'dopplerData',
            frequenciesObserved,
            calculatedSpeeds
        });
        

        return true;
    }
}
registerProcessor('dopplerProcessor', WorkletProcessor);