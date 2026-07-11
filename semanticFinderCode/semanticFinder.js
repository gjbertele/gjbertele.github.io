const loadButton = document.querySelector('.loadButton');
const textInput = document.querySelector('.sampleInput');
const loadInputPage = document.querySelector('.loadInputPage');
const inputSearchPage = document.querySelector('.inputSearchPage');
const searchButton = document.querySelector('.searchButton');
const queryInput = document.querySelector('.queryInput');
const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');
const width = document.body.clientWidth * 0.64;
const height = document.body.clientHeight * 0.3;

canvas.width = width;
canvas.height = height;
ctx.font = '20px Arial';
let canvasScrollHeight = 0;
let boxesToRender = [];
canvas.addEventListener('wheel', (e) => {
    canvasScrollHeight += e.deltaY / 20;
});


loadButton.onclick = () => {
    loadInputPage.style.display = 'none';
    inputSearchPage.style.display = 'inline-block';

    /*textInput.value = `McDonald's Corporation is an American multinational fast food restaurant chain. As of 2024, it is the second-largest by number of locations in the world, behind the Chinese chain Mixue Ice Cream & Tea.[9]

    Brothers Richard and Maurice McDonald founded McDonald's in San Bernardino, California, in 1940 as a hamburger stand. They soon franchised the company.[10] The Golden Arches logo was introduced in 1953.[11] In 1955, the businessman Ray Kroc joined McDonald's as a franchise agent; he bought the company in 1961. In the years since, it has expanded internationally. Today, McDonald's has more than 40,000 restaurant locations worldwide, with around one-quarter in the US.`;
*/


    const words = textInput.value.split(' ');
    const boundingBoxes = getWordBoundingBoxes(words, ctx, width);
    boxesToRender = boundingBoxes;

}

const getLineHeight = (ctx) => {
    const metrics = ctx.measureText('A');
    return 2*(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
}

const getWordBoundingBoxes = (words, ctx, maxWidth) => {
    const spaceWidth = ctx.measureText(' ').width;
    const lineHeight = getLineHeight(ctx);

    let wordBoxes = [];
    let currentLine = [];
    let currentLineWidth = 0;
    let currentLineNumber = 0.5;

    for(let i = 0; i<words.length; i++){
        let wordWidth = ctx.measureText(words[i]).width;
        let wordAddedWidth = wordWidth;
        if(currentLine.length > 0) wordAddedWidth += spaceWidth;

        if(currentLineWidth + wordAddedWidth > maxWidth) {
            wordBoxes.push(...currentLine);

            currentLineNumber += 1;

            currentLine = [{
                word: words[i],
                x: 0,
                y: currentLineNumber * lineHeight,
                width: wordWidth,
                color: '#FFF'
            }];

            currentLineWidth = wordWidth;
        } else {
            currentLine.push({word:
                words[i],
                x: currentLineWidth + (currentLine.length == 0 ? '' : spaceWidth),
                y: currentLineNumber * lineHeight,
                width: wordWidth,
                color: '#FFF'
            });

            currentLineWidth += wordAddedWidth;
        }
    }

    wordBoxes.push(...currentLine);

    return wordBoxes;
}


const drawFrame = () => {
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(0,0,width,height);
    ctx.fillStyle = '#000';

    const lineHeight = getLineHeight(ctx);

    for(let  box of boxesToRender){
        ctx.fillStyle = box.color;
        ctx.fillRect(box.x, box.y - lineHeight / 2 - canvasScrollHeight, box.width, lineHeight / 2);

        ctx.fillStyle = '#000';
        ctx.fillText(box.word, box.x, box.y - canvasScrollHeight);
    }

    requestAnimationFrame(drawFrame);
}

drawFrame();

const interpolate = (r1, g1, b1, r2, g2, b2, t) => {
    return [r1 + (r2 - r1)*t, g1 + (g2 - g1)*t, b1 + (b2 - b1)*t]
}


searchButton.addEventListener('click', () => {
    const query = queryInput.value;
    const queryEmbedding = normalize(embedSentence(query));
    const queryWords = query.split(' ').length;
    const windowWidth = Math.floor((queryWords - 1)/2);
    const mainTextBody = textInput.value.split(' ');

    for(let i = 0; i < mainTextBody.length; i++){
        let windowSentence = '';
        for(let j = Math.max(0, i - windowWidth); j <= Math.min(mainTextBody.length - 1, i + windowWidth); j++){
            windowSentence += (windowSentence.length > 0 ? ' ' : '') + mainTextBody[j];
        }

        let windowEmbedding = normalize(embedSentence(windowSentence));

        console.log(windowSentence, windowEmbedding, queryEmbedding);

        const similarity = (dot(queryEmbedding, windowEmbedding) + 1)/2;
        const interpolatedColor = interpolate(255, 0, 0, 0, 255, 0, similarity);
        boxesToRender[i].color = `rgb(${interpolatedColor[0]},${interpolatedColor[1]},${interpolatedColor[2]})`;
    }
});