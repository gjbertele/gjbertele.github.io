const SP500Tickers = financialData.matrix.labels_sp500;
const dates = financialData.matrix.t;

const getDateIndex = (date) => {
    let low = 0;
    let high = dates.length - 1;

    while(low <= high) {
        let mid = low + Math.floor((high - low) / 2);
        if(dates[mid] == date) return mid;
        if(date.localeCompare(dates[mid]) == -1) high = mid - 1;
        else low = mid + 1;
    }

    return low;
}

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

const generateCovarianceMatrix = (tickers, returnZm = false) => {
    const series = tickers.map(i => i = pullDataByTicker(i));
    return generateCovarianceMatrixFromPrices(series, returnZm);
}

const generateCovarianceMatrixFromPrices = (series, returnZm = false) => {
    const N = series.length;

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
    Zm.arr = convertRowsToMatrixArr(Z);

    const corr = Zm.multiply(Zm.transpose()).scalarMultiply(1 / (T - 1));

    if(returnZm) return [corr, Zm];
    else return corr;
}

const findSectorComponents = (prices, filterMarchenko = true, returnRawVectors = false) => {
    const N = prices.length;
    const [corr, Zm] = generateCovarianceMatrixFromPrices(prices, true);
    const T = Zm.columns;

    const eigenpairsRaw = jacobiEigen(corr);
    const eigenpairs =  (new Array(eigenpairsRaw[1].length)).fill(0).map((i, v) => i = [eigenpairsRaw[1][v], eigenpairsRaw[0].getColumn(v)]);
    eigenpairs.sort((a,b) => b[0] - a[0]);
    const {λ, λp, λm, σ2} = marchenkoPasturEigenvalueDistribution(Zm);

    const significantEigenpairs = eigenpairs.filter(i => i[0] > λp || !filterMarchenko).map(i => i = [i[0], i[1].scalarMultiply(1/i[1].mag())]);

    if(returnRawVectors) return significantEigenpairs;

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
            if(Math.abs(component[i]) <= threshold && filterMarchenko) continue;
            if(component[i] > 0) sector.positive.push(i); 
            else sector.negative.push(i);
        }

        sectors.push(sector);
    }
    
    return sectors;
}
const minimizeSystemicRisk = (prices) => {
    const N = prices.length;
    if (prices[0].length - 1 <= N) throw new Error('Not enough datapoints');

    const eigenpairs = findSectorComponents(prices, false, true); 
    const w = new Float64Array(N);
    for (let j = 0; j < N; j++) {
        const [lambda, v] = eigenpairs[j];
        const coef = v.dot(getVectorofAllOnes(v.length)) / lambda;   
        for (let i = 0; i < N; i++) w[i] += coef * v[i];
    }
    const sum = w.reduce((a, b) => a + Math.abs(b), 0);
    if (Math.abs(sum) < 1e-12) return w;
    return w.map(x => x / sum);
};

const findSectorComponentsSP500 = (N = 60) => {
    const tickers = financialData.matrix.labels_sp500.slice(0, N);
    const pricing = tickers.map(i => i = pullDataByTicker(i));
    return findSectorComponents(tickers, pricing);
}


const backtestPortfolioAllocation = (strategy, universe, dateStart, dateEnd, allowShort = false) => {
    const invalidTickers = universe.filter(i => pullDataByTicker(i).length == 0);
    if(invalidTickers.length > 0) throw new Error(`Ticker${invalidTickers.length > 1 ? 's':''} ${invalidTickers.join(', ')} not recognized.`);

    const N = universe.length;
    const timeStart = getDateIndex(dateStart);
    const timeEnd = Math.min(dates.length - 1, getDateIndex(dateEnd));

    const pricing = universe.map(i => i = pullDataByTicker(i));

    const initialInvestment = 1;
    const riskFreeRate = 0.05;
    let sharesOwned = new Float64Array(N);
    let invested = initialInvestment;
    let realizedGains = 0;

    let actionLog = [];
    let sharesOwnedLog = [];
    let excessReturns = [];
    
    for(let i = timeStart; i <= timeEnd; i++) {
        const visibilePricingData = pricing.map(j => j = j.slice(0, i));
        const prices = new Float64Array(pricing.map(j => j = j[i]));
        const idealCapitalAllocation = strategy(visibilePricingData);
        const date = financialData.matrix.t[i];
        const totalValue = sharesOwned.dot(prices) + initialInvestment;

        for(let j = 0; j < N; j++) {
            let sharesChange = idealCapitalAllocation[j] * totalValue / prices[j] - sharesOwned[j];

            if(sharesChange > 0 || allowShort) {
                invested += Math.abs(sharesChange) * prices[j];
                sharesOwned[j] += sharesChange;
                if(sharesChange > 0) actionLog.push(`${date}: Bought ${sharesChange} of ${universe[j]} @ ${prices[j]}`);
                else actionLog.push(`${date}: Shorted ${-sharesChange} of ${universe[j]} @ ${prices[j]}`);
            } else {
                realizedGains += prices[j] * Math.min(sharesOwned[j], -sharesChange);
                sharesOwned[j] -= Math.min(sharesOwned[j], -sharesChange);
                actionLog.push(`${date}: Sold ${-sharesChange} of ${universe[j]} @ ${prices[j]}`);
            }
        }

        excessReturns.push((totalValue + realizedGains - invested) / invested - riskFreeRate);
        sharesOwnedLog.push(structuredClone(sharesOwned));
    }

    const portfolioValue = sharesOwned.dot(new Float64Array(pricing.map(j => j = j[timeEnd])));
    const totalGain = realizedGains + portfolioValue;
    const sigma = vectorStdDev(excessReturns);
    const logReturn =  Math.log(totalGain/invested);
    const returnRate = (totalGain - invested) / invested;
    const sharpe = returnRate / sigma;

    return {
        logs: {
            sharesOwnedLog,
            actionLog,
            excessReturns
        },
        stats: {
            return: totalGain - invested,
            realizedGains,
            invested,
            logReturn,
            returnRate,
            sigma,
            sharpe,
            portfolioValue,
            totalGain
        }

    };
}


/* TODO:
Add statistically significant returns test to backtest
Renormalize if shorts unallowed
*/