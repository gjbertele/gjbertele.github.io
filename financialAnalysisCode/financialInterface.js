const pullDataByTicker = (ticker) => {
    let index = -1;
    if (financialData.matrix.labels_sp500.includes(ticker)) {
        const idx = financialData.matrix.labels_sp500.indexOf(ticker);
        index = financialData.matrix.indices_sp500[idx];
    } else if (financialData.matrix.labels_nasdaq100.includes(ticker)) {
        const idx = financialData.matrix.labels_nasdaq100.indexOf(ticker);
        index = financialData.matrix.indices_nasdaq100[idx];
    }

    return new Float64Array(financialData.matrix.series[index]);
}


const generateSP500CorrelationMatrix = (N, returnZm = false) => {
    if(!N) N = financialData.matrix.labels_sp500.length;
    const series = financialData.matrix.series.slice(0, N).map(s => Float64Array.from(s));

    const logReturns = series.map(s => {
        const r = new Float64Array(s.length - 1);
        for (let t = 1; t < s.length; t++) r[t - 1] = Math.log(s[t] / s[t - 1]);
        return r;
    });

    const T = logReturns[0].length;

    const Z = logReturns.map(r => {
        let mean = 0;
        for (const x of r) mean += x;
        mean /= T;
        const c = r.map(x => x - mean);
        let ss = 0;
        for (const x of c) ss += x * x;
        const sd = Math.sqrt(ss / (T - 1));
        return c.map(x => x / sd);
    });

    const Zm = new Matrix(N, T);
    Zm.arr = Z;

    const corr = Zm.multiply(Zm.transpose()).scalarMultiply(1 / (T - 1));

    if(returnZm) return [corr, Zm];
    else return corr;
}

const findSectorComponentsSP500 = (N = 60) => {
    const tickers = financialData.matrix.labels_sp500;
    const [corr, Zm] = generateSP500CorrelationMatrix(N, true);
    const T = Zm.arr[0].length;
    

    const eigenpairsRaw = computeEigenpairsWithQR(corr, 40);

    const eigenpairs = (new Array(eigenpairsRaw[0].length)).fill(0).map((i, v) => i = [eigenpairsRaw[0][v], eigenpairsRaw[1][v]]);
    const {λ, λp, λm, σ2} = marchenkoPasturEigenvalueDistribution(Zm);
    const significantEigenpairs = eigenpairs.filter(i => i[0] > λp).map(i => i = [i[0], i[1].scalarMultiply(1/i[1].mag())]);

    let sectors = [];
    for(let eigenpair of significantEigenpairs) {
        const λ = eigenpair[0];
        const component = eigenpair[1];
        const threshold = 2 / (Math.sqrt(T*λ));

        let sector = {
            λ,
            positive:[],
            negative:[]
        };

        for(let i = 0; i < N; i++){
            if(Math.abs(component[i]) <= threshold) continue;
            if(component[i] > 0) sector.positive.push(tickers[i]); 
            else sector.negative.push(tickers[i]);
        }

        sectors.push(sector);
    }
    
    return sectors;
}