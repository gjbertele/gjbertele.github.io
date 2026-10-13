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

    console.log(OE, OP, OF, OO);

    const BL = bary(points);
    const Mtemp = corrM(BL);
    const M = new Matrix(points.length, points.length);
    M.arr = Mtemp.map(i => i = new Float64Array(i));

    const λ = computeEigenvaluesWithQR(M);
    const σ = λ.map(i => i = i * i);
    const Σσ = σ.reduce((a,b) => a + b, 0);
    const ρ = σ.map(i => i = i / Σσ);

    const effectiveRank = Math.exp(-ρ[0]*Math.log(ρ[0]) - ρ[1]*Math.log(ρ[1]));
    const complexityScore = effectiveRank - 1;
    
    $('.complexityNumber').textContent = Math.ceil(100 * complexityScore);

    const titledArray = [
        ['','Emotional','Physical','Friendly'],
        ['Emotional',...[...M.arr[0]].map(truncate)],
        ['Physical',...[...M.arr[1]].map(truncate)],
        ['Friendly',...[...M.arr[2]].map(truncate)]
    ];

    $('.correlationMatrix').innerHTML = '';

    for(let i = 0; i < 4; i++){
        const row = document.createElement('tr');
        for(let j = 0; j < 4; j++){
            const td = document.createElement('td');
            td.textContent = titledArray[i][j];
            row.appendChild(td);
        }
        $('.correlationMatrix').appendChild(row);
    }

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


    //graphs
}



analysisButton.addEventListener('click', analyze);