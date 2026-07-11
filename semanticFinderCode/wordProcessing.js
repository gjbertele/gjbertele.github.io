const dimensions = embeddingData['hello'].length;

//Embed sentence by v = sigma (1/frequency(word))*embedding(word) / sigma (1/frequency(word))

const embedSentence = (sentence) => {
    const words = sentence.toLowerCase().split(' ').filter(word => frequencyData[word] && embeddingData[word]);
    const sentenceFrequencies = words.map(word => word = frequencyData[word]);
    const sentenceEmbeddings = words.map(word => word = embeddingData[word]);

    for(let i = sentenceEmbeddings.length - 1; i >= 0; i--){
        if(sentenceFrequencies[i] == -1 || sentenceEmbeddings[i] == -1){
            sentenceEmbeddings.splice(i, 1);
            sentenceFrequencies.splice(i, 1);
        }
    }

    let output = new Array(dimensions);
    for(let i = 0; i<dimensions; i++) output[i] = 0;

    if(words.length == 0) return output;
    
    let totalFrequencies = 0;

    for(let i = 0; i<sentenceFrequencies.length; i++){
        totalFrequencies += 1 / sentenceFrequencies[i];

        for(let j = 0; j<dimensions; j++){
            output[j] += sentenceEmbeddings[i][j] / sentenceFrequencies[i];
        }
    }

    for(let i = 0; i<dimensions; i++) output[i] /= totalFrequencies;

    return output;
}

const dot = (u, v) => {
    let output = 0;
    for(let i = 0; i<dimensions; i++) output += u[i] * v[i];
    return output;
}

const normalize = (u) => {
    const mag = Math.sqrt(dot(u,u));

    const output = [];
    for(let i = 0; i<dimensions; i++) output.push(u[i] / mag);

    return output;
}


