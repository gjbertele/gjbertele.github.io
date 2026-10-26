const $ = document.querySelector.bind(document);
const analysisButton = $('#analyze');

const E = (L, P) => {
    let output = [];
    for(let i of L){
        output.push(Math.hypot(P.x - i.x, P.y - i.y) / 520);
    }
    return output;
}

const truncate = (x) => {
    return Math.min(100, Math.ceil(x * 100)) + '%';
}

const FourierFrequency = (E, ω) => {
    const N = E.length;
    let Re = 0;
    let Im = 0;

    for(let n in E){
        Re += E[n] * Math.cos(2 * Math.PI * n * ω / N);
        Im += E[n] * Math.sin(2 * Math.PI * n * ω / N);
    }

    return Math.hypot(Re,Im);
}

const Fourier = (E, min, max) => {
    let range = Array.from({ length: max - min + 1 }, (_, index) => (index + min));
    return range.map(i => i = [FourierFrequency(E, i), i]);
}

const mean = (L) => {
    const N = L.length;

    if(N == 0) return 0;

    let μ = 0;
    for(let x of L) μ += x;
    μ /= N;

    return μ;
}

const stdDev = (L) => {
    const N = L.length;

    if(N == 0) return 0;

    let μ = mean(L);

    let stdDev = 0;
    for(let x of L) stdDev += (x - μ)*(x - μ);
    stdDev = Math.sqrt(stdDev / N);

    return stdDev;
}

const bary = (L) => {
    return L.map(i => i = barycentric(i));
}

const outliers = (L) => {
    const N = L.length;

    if(N == 0) return 0;

    let μ = mean(L.map(i => i = i[0]));
    let σ = stdDev(L.map(i => i = i[0]));

    const output = L.filter(i => (i[0] - μ)/σ > 1);
    
    if(output.length > 0) return output;

    let maxPair = [-1000000, 0];
    for(let pair of L){
        if(pair[0] > maxPair[0]) maxPair = pair;
    }
    return [maxPair];
}

const cov = (A, B) => {
    let output = 0;

    let μA = mean(A);
    let μB = mean(B);

    for(let i in A) output += (A[i] - μA) * (B[i] - μB);

    output /= A.length;

    return output;
}

const corr = (X, Y) => {
    return cov(X, Y)/(stdDev(X) * stdDev(Y));
}

const corrM = (L) => {
    let N = L.length;
    let M = [];
    for(let i = 0; i<N; i++){
        M.push([])
        for(let j = 0; j<N; j++){
            M[i].push(corr(L[i], L[j]));
        }
    }
    return M;
}

const generateGraph = (elem, E, color, type) => {
    const N = E.length;

    let points = [];

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    path.style.fill = 'none';
    path.style.stroke = color;
    path.style.strokeWidth = 2;

    elem.appendChild(path);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    elem.appendChild(g);

    for(let i = 0; i < N; i++) {
        let translatedX = 400 * (i / N) + 100;
        let translatedY = 500 - 400 * E[i];

        const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        point.setAttribute('r', 13);
        point.setAttribute('tabindex', '0');
        point.setAttribute('cx', translatedX);
        point.setAttribute('cy', translatedY);
        point.style.fill = color;
        point.style.stroke = 'var(--bg)';

        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('class', 'lbl');
        label.textContent = i+1;
        label.setAttribute('x', translatedX);
        label.setAttribute('y', translatedY);
        label.style.fill = 'var(--bg)';
        label.style.font = '600 13px system-ui, sans-serif';
        label.style.textAnchor = 'middle';
        label.style.dominantBaseline = 'central';
        
        g.appendChild(point);
        g.appendChild(label);

        points.push([translatedX, translatedY]);

        path.setAttribute('points', points.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '));
    }

    const lastPoint = points[points.length - 1];

    const lineLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lineLabel.setAttribute('class', 'lbl');
    lineLabel.style.fill = 'var(--ink)'
    lineLabel.style.textAnchor = 'left';
    lineLabel.textContent = type;
    lineLabel.setAttribute('x', lastPoint[0] + 60);
    lineLabel.setAttribute('y', lastPoint[1]);

    elem.appendChild(lineLabel);

}

const D = (E) => {
    let L = [];
    for(let i = 1; i < E.length; i++) L.push(E[i] - E[i-1]);
    return L;
}

const oneHotClassify = (A, B, C) => {
    let out = new Array(A.length);
    for(let i = 0; i < A.length; i++){
        out[i] = [A[i], B[i], C[i]].indexOf(Math.min(A[i], B[i], C[i]));
    }
    return out;
}

const insertArrayIntoTable = (elem, arr) => {
    elem.innerHTML = '';
    for(let i = 0; i < arr.length; i++){
        const row = document.createElement('tr');
        for(let j = 0; j < arr[i].length; j++){
            const td = document.createElement('td');
            td.textContent = arr[i][j];
            row.appendChild(td);
        }
        elem.appendChild(row);
    }

    return;
}

const generateMarkov = (oneHot) => {
    let counts = [new Float64Array([0,0,0]), new Float64Array([0,0,0]), new Float64Array([0,0,0])];
    let totalFrom = [0,0,0];

    for(let i = 1; i<oneHot.length; i++) {
        totalFrom[oneHot[i-1]]++;
        counts[oneHot[i-1]][oneHot[i]]++;
    }
    
    for(let i = 0; i < 3; i++){
        if(totalFrom[i] == 0) continue;
        for(let j = 0; j < 3; j++){
            counts[i][j] /= totalFrom[i];
        }
    }

    let output = new Matrix(3, 3);
    output.arr = counts;

    return output;
}

const analyze = () => {
    const EE = E(points, A);
    const EP = E(points, B);
    const EF = E(points, C);

    const FE = Fourier(EE, 1, Math.floor(points.length / 2));
    const FP = Fourier(EP, 1, Math.floor(points.length / 2));
    const FF = Fourier(EF, 1, Math.floor(points.length / 2));

    const OE = FE.map(i => i = [...i, 'emotional']);
    const OP = FP.map(i => i = [...i, 'physical']);
    const OF = FF.map(i => i = [...i, 'friendly']);

    const OO = outliers([...OE,...OP,...OF]);

    const BLT = bary(points);
    let BL = [];
    for(let i = 0; i<3; i++){
        let x = [];
        for(let j = 0; j<points.length; j++) x.push(BLT[j][i]);
        BL.push(x);
    }

    const Mtemp = corrM(BL);
    const M = new Matrix(3, 3);
    M.arr = Mtemp.map(i => i = new Float64Array(i));


    const DEE = D(EE);
    const DEF = D(EF);
    const DEP = D(EP);

    const PM = new Matrix(points.length, 3);
    for(let i = 0; i < points.length - 1; i++){
        for(let j = 0; j < 3; j++){
            PM.arr[i][j] = [DEE, DEP, DEF][j][i];
        }
    }

    const σ = computeEigenvaluesWithQR(PM.multiply(PM.transpose()));
    const Σσ = σ.reduce((a,b) => a + b, 0);
    const ρ = σ.map(i => i = i / Σσ);

    const effectiveRank = Math.exp(-ρ[0]*Math.log(ρ[0]) - ρ[1]*Math.log(ρ[1]));
    let complexityScore = effectiveRank - 1;
    if(isNaN(complexityScore)) complexityScore = 0;


    $('.complexityNumber').textContent = Math.ceil(100 * complexityScore);

    const σE = stdDev(EE);
    const σF = stdDev(EF);
    const σP = stdDev(EP);
    
    const classifiedPoints = oneHotClassify(EE, EP, EF);
    const markovMatrix = generateMarkov(classifiedPoints);
    const steadyState = findNullVector(markovMatrix.minus(getIdentity(3)));

    if(steadyState) {
        const steadyStateRatio = [...steadyState.scalarMultiply(100/steadyState.dot(new Float64Array([1,1,1])))].map(i => i = i.toFixed(0));
        $('.equilibrium').innerHTML = `The equilibrium of your relationship is <b>${steadyStateRatio[0]}%</b> emotional, <b>${steadyStateRatio[1]}%</b> physical, and <b>${steadyStateRatio[2]}%</b> friendly.`
    } else {
        $('.equilibrium').textContent = 'Not enough information to determine an equilibrium.'
    }

    const titeldMarkovMatrix = [
        ['','To Emotional','To Physical','To Friendly'],
        ['From Emotional',...[...markovMatrix.arr[0]].map(truncate)],
        ['From Physical',...[...markovMatrix.arr[1]].map(truncate)],
        ['From Friendly',...[...markovMatrix.arr[2]].map(truncate)]
    ];
    
    insertArrayIntoTable($('.markovMatrix'), titeldMarkovMatrix);


    const titledCorrelationArray = [
        ['','Emotional','Physical','Friendly'],
        ['Emotional',...[...M.arr[0]].map(truncate)],
        ['Physical',...[...M.arr[1]].map(truncate)],
        ['Friendly',...[...M.arr[2]].map(truncate)]
    ];

    insertArrayIntoTable($(".correlationMatrix"), titledCorrelationArray);

    $('.signalsCard > .signals').innerHTML = '';

    for(let O of OO){
        const textElem = document.createElement('span');

        let strength = '';
        if(O[0] > 0.5) strength = 'strong';
        else if(O[0] > 0.25) strength = 'moderate';
        else strength = 'weak';

        let speed = '';
        if(O[1] <= 1) speed = 'slowly';
        else if(O[1] <= 3) speed = 'moderately';
        else speed = 'highly';

        textElem.innerHTML = `There is a <b>${strength}</b> and <b>${speed} alternating ${O[2]} signal</b>`;
        $('.signalsCard > .signals').appendChild(textElem);
    }

    generateGraph($('.signalGraph'), EE, '#c8452d', 'Emotional');
    generateGraph($('.signalGraph'), EP, '#63c82d', 'Physical');
    generateGraph($('.signalGraph'), EF, '#2db0c8', 'Friendly');

    const axes = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    axes.style.fill = 'none';
    axes.style.stroke = 'var(--ink)';
    axes.style.strokeWidth = 2;
    axes.setAttribute('points','50,50 50,510 510,510')

    $('.signalGraph').appendChild(axes);

    $('.greeks').textContent = `σE: ${σE.toFixed(2)}  σP: ${σP.toFixed(2)}  σF: ${σF.toFixed(2)}`;
}



analysisButton.addEventListener('click', analyze);