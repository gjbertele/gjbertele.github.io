const epsilon = 1e-8;
let maxSize = 5e7;
let memory = new Float64Array(maxSize);
let memoryPointer = 0;
memory.fill(0);


class Matrix {
    rows;
    columns;
    arr;

    constructor(n, m){
        if(!m) m = n;

        this.rows = n;
        this.columns = m;


        this.arr = memory.subarray(memoryPointer, memoryPointer + n * m);
        this.arr.fill(0);
        memoryPointer += n * m;

        return this;
    }
    plus (B){
        let output = new Matrix(this.rows, this.columns);
        for(let i = 0; i<this.rows * this.columns; i++){
            output.arr[i] = this.arr[i] + B.arr[i];
        }
        return output;
    }

    minus (B){
        let output = new Matrix(this.rows, this.columns);
        for(let i = 0; i<this.rows * this.columns; i++){
            output.arr[i] = this.arr[i] - B.arr[i];
        }
        return output;
    }

    multiply (B){
        let output = new Matrix(this.rows, B.columns);
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < B.columns; j++){
                for(let k = 0; k<Math.min(this.columns, B.rows); k++){
                    output.arr[i * output.columns + j] += this.arr[i*this.columns + k]*B.arr[k*B.columns + j];
                }
            }
        }
        return output;
    }

    vecMultiply (v){
        let output = new Float64Array(this.rows);
        let temp = 0;
        for(let i = 0; i<this.rows; i++){
            temp = 0;
            for(let j = 0; j<v.length; j++){
                temp += this.arr[i * this.columns + j] * v[j];
            }
            output[i] = temp;
        }
        return output;
    }

    scalarMultiply (a){
        let output = new Matrix(this.rows, this.columns);
        for(let i = 0; i<this.rows * this.columns; i++){
            output.arr[i] = this.arr[i] * a;
        }
        return output;
    }

    transpose (){
        let output = new Matrix(this.columns, this.rows);
        for(let i = 0; i<this.columns; i++){
            for(let j = 0; j<this.rows; j++) output.arr[i * output.columns + j] = this.arr[j * this.columns + i];
        }
        return output;
    }

    dot (B){
        return this.arr.dot(B.arr);
    }

    toString (){
        let string = ``;
        for(let i = 0; i < this.rows; i++){
            let column = '{'+this.arr.slice(i * this.columns, (i+1)*this.columns).join(', ')+'}';
            if(i != 0) column = ', '+column;
            string += column;
        }
        return '{'+string+'}';
    }

    inverse (){
        return invert(this);
    }

    wolfram (){
        window.open(`https://www.wolframalpha.com/input?i=${encodeURIComponent(this.toString())}`);
        return;
    }

    QR (){
        return QRFactorize(this);
    }

    get T() { return this.transpose() };

    getRow (i){
        return this.arr.slice(i*this.columns,(i+1)*this.columns);
    }

    getColumn (i){
        return new Float64Array((new Array(this.rows)).fill(0).map((j,v) => j = this.arr[v * this.columns + i]));
    }
}

Float64Array.prototype.dot = function(v) {
    let d = 0;
    for(let i = 0; i<v.length; i++){
        d += v[i]*this[i];
    }
    return d;
}

Float64Array.prototype.minus = function(v){
    let output = new Float64Array(this.length);
    for(let i = 0; i<this.length; i++) output[i] = this[i] - v[i];
    return output;
}

Float64Array.prototype.plus = function(v){
    let output = new Float64Array(this.length);
    for(let i = 0; i<this.length; i++) output[i] = this[i] + v[i];
    return output;
}

Float64Array.prototype.scalarMultiply = function(a){
    let output = new Float64Array(this.length);
    for(let i = 0; i<this.length; i++) output[i] = this[i]*a;
    return output;
}

Float64Array.prototype.mag = function(){
    return Math.sqrt(this.dot(this));
}

function tripleIterativeSolve (A, N, b){
    let xnprev = new Float64Array(A.columns); //x_{n-2}
    let xn = new Float64Array(A.columns); // x_{n-1}

    xnprev.fill(0); //initialize values
    xn.fill(1);

    let rn = A.vecMultiply(xn).minus(b); //r_0 = Ax_0 - b

    let dtemp = 0; //d_0 = 0
    let atemp = A.vecMultiply(rn); //save value of Ar_0
    let rdotatemp = rn.dot(atemp); //save value of (r_0,Ar_0)
    let ctemp = atemp.dot(atemp)/rdotatemp; //c_0 = (Ar_0,Ar_0)/(r_0,Ar_0)
    let btemp = -(ctemp + dtemp); //b_0 = -c_0 - d_0

    let sn = 1/btemp; //s_0 = 1/b_0
    let pn = -ctemp/btemp; //p_0 = -c_0/b_0
    let qn = -dtemp/btemp; //q_0 = -d_0/b_0

    let constantLog = []; //initialize log to save values of s,p,q

    for(let i = 1; i < N; i++){
        let xtemp = xn; //save x_{i-1}

        xn =  A.scalarMultiply(sn) //x_i = s_{i-1}Ax_{i-1}+p_{i-1}x_{i-1}+q_{i-1}x_{i-2}-s_{i-1}b
        .vecMultiply(xn)
        .plus(xn.scalarMultiply(pn))
        .plus(xnprev.scalarMultiply(qn))
        .minus(b.scalarMultiply(sn));

        xnprev = xtemp; //update x_{i-2}


        rn = A.vecMultiply(xn).minus(b); //r_i = Ax_i - b
        aprevtemp = atemp; //update aprevtemp
        atemp = A.vecMultiply(rn); //save value of Ar_i

        dtemp = atemp.dot(aprevtemp)/rdotatemp; //d_i = (Ar_i,Ar_{i-1})/(r_{i-1},Ar_{i-1})

        rdotatemp = rn.dot(atemp); //save value of (r_i,Ar_i)

        ctemp = atemp.dot(atemp)/rdotatemp; //c_i = (Ar_i,Ar_i)/(r_i,Ar_i)

        btemp = -ctemp - dtemp; //b_i=-c_i-d_i

        sn = 1/btemp; //s_i=1/b_i
        pn = -ctemp/btemp; //p_i=-c_i/b_i
        qn = -dtemp/btemp; //q_i=-d_i/b_i

        constantLog.push([sn,pn,qn]) //update log

        let errorSize = rn.dot(rn);
        if(errorSize < 0.00001) break;
    }

    return [xn,constantLog]; //return final x and log of constants
}

function computeEigenvalues(M){
    if(M.rows != M.columns) return;
    let n = M.rows;
    let steps = 1000;
    let init = new Matrix(n,n);
    let lambda = new Array(n);
    for(let i = 0; i<n; i++){
        init.arr[i * n + i] = M.arr[i * n + i];
        lambda[i] = M.arr[i * n + i];
    } 

    let scale = M.minus(init).scalarMultiply(1/steps); 

    for(let iteration = 0; iteration < steps; iteration++){
        let nextLambda = new Array(n);
        for(let k = 0; k<n; k++){ 
            let U = computeLambdaKD(init, lambda, k); 
            nextLambda[k] = lambda[k] + U.transpose().dot(scale); 
        }
        
        lambda = nextLambda;
        init = init.plus(scale);
    }

    return lambda;
}


function computeLambdaKD(M, lambda, k){
    let Lneqk = prodAtIndex(lambda, k);
    let Mneqk = matrixPolynomialExcluding(M, lambda, k);

    return Mneqk.scalarMultiply(1/Lneqk);
}


function getIdentity(n){
    let I = new Matrix(n,n);
    for(let i = 0; i<n; i++) I.arr[i * n + i]  = 1;
    return I;
}

function getE(n, idx){
    let vec = new Float64Array(n);
    vec.fill(0);
    vec[idx] = 1;
    return vec;
}

function precomputeCoefficientsExcluding(lambda, idx){
    let output = [1]
    for(let i = 0; i<lambda.length; i++){
        if(i == idx) continue;
        output.unshift(0);
        for(let j = 0; j<output.length-1; j++) output[j] -= output[j+1]*lambda[i];
    }
    
    let pow = Math.pow(-1,lambda.length - 1);
    for(let j = 0; j<output.length; j++) output[j] *= pow;

    return output;
}

function Δ(u){
    return u.map((i,v) => i = i - u[v-1]).slice(1);
}

function matrixPolynomialExcluding(M,lambda,idx){
    let n = M.rows;
    let output = new Matrix(n,n);
    let pow = getIdentity(n);

    let coefficients = precomputeCoefficientsExcluding(lambda, idx);
    for(let i = 0; i<coefficients.length; i++){
        output = output.plus(pow.scalarMultiply(coefficients[i]));
        pow = pow.multiply(M);
    }

    return output;
}

function prodAtIndex(lambda, k){
    let output = 1;
    for(let i = 0; i<lambda.length; i++){
        if(i == k) continue;
        output *= lambda[i] - lambda[k];
    }
    return output;
}

function computeEigenvectorsFromEigenvalues(M, lambda){
    let n = M.rows;
    let vecs = new Array(n);
    for(let i = 0; i<n; i++){
        let Mneqk = matrixPolynomialExcluding(M, lambda, i);
        
        let idx = 0;
        while(idx < n){
            vecs[i] = Mneqk.vecMultiply(getE(n, idx));
            let norm = Math.sqrt(vecs[i].dot(vecs[i]));
            vecs[i] = vecs[i].scalarMultiply(1/norm);
            if(norm > 0.000001) break;
            idx++;
        }
    }

    return vecs;
}

function convertReflectionToMatrix(v, embedding = 0){
    const n = v.length;
    let output = getIdentity(n); 

    let mag = 0;
    for(let i = embedding; i<n; i++) mag+=v[i]**2;

    for(let i = embedding; i<n; i++){
        for(let j = embedding; j<n; j++){
            output.arr[i*n + j] += -2*v[i]*v[j]/mag;
        }
   }

   return output;
}

function det(M){
    let {Q, R} = QRFactorize(M);
    let output = 1;
    for(let i = 0; i<M.rows; i++) output *= R.arr[i*R.columns + i];
    return output;
}

function Tr(M){
    let output = 0;
    for(let i = 0; i<M.rows; i++) output += M.arr[i*M.columns + i];
    return output;
}

function Diag(vec){
    let output = new Matrix(vec.length, vec.length);
    for(let i = 0; i<vec.length; i++) output.arr[i*output.columns + i] = vec[i];
    return output;
}

function SVD(M){
    let MTM = M.transpose().multiply(M);
    let [V, lambda] = jacobiEigen(MTM);
    let U = M.multiply(V).transpose();

    for(let i = 0; i<U.arr.length; i++){
        let norm = U.getRow(i).mag();
        if(norm > epsilon){
            for(let j = i*U.columns; j<(i+1)*U.columns; j++) U.arr[j] = U.arr[j] / norm;
        }
    }

    U = U.transpose();
    
    let Sigma = new Matrix(lambda.length, lambda.length);
    for(let i = 0; i<lambda.length; i++) Sigma.arr[i*Sigma.columns + i] = Math.sqrt(lambda[i]);
    
    return {U:U, S:Sigma, V:V};
}

function computeEigenvaluesSparse(M){
    if(M.rows != M.columns) return;
    let n = M.rows;
    let stepSize = 0.001;
    let init = new Matrix(n,n);
    let lambda = new Array(n);
    for(let i = 0; i<n; i++){
        init.arr[i*n + i] = M.arr[i*M.columns + i];
        lambda[i] = M.arr[i*M.columns + i];
    }

    for(let i = 0; i<n; i++){
        for(let j = 0; j<n; j++){
            let steps = Math.ceil(Math.abs(init.arr[i*n + j] - M.arr[i*n + j])/stepSize);
            let dir = (M.arr[i*n + j] - init.arr[i*n + j])/steps;
            for(let m = 0; m<steps; m++){
                let nextLambda = new Array(n);
                for(let k = 0; k<n; k++){
                    let derivative = computeLambdaKD(init, lambda, k).arr[j*n + i];
                    nextLambda[k] = lambda[k] + derivative*dir;
                }
                lambda = nextLambda;
                init.arr[i*n + j] += dir;
            }
        }
    }

    return lambda;
}


function QRFactorize(M){
    if(M.rows != M.columns) return;

    let n = M.rows;
    let An = M;
    let Qn = getIdentity(n);

    for(let i = 0; i<n-1; i++){
        let aCol = An.getColumn(i);
        for(let j = 0; j<i; j++) aCol[j] = 0;
        let norm = Math.sqrt(aCol.dot(aCol));
        let vi = aCol.plus(getE(n, i).scalarMultiply(norm*Math.sign(aCol[i])));

        let Hn = convertReflectionToMatrix(vi, 0);
        An = Hn.multiply(An);
        Qn = Hn.multiply(Qn);
    }

    return {'Q':Qn.transpose(),'R':An};
}

function computeEigenvaluesWithQR(M, iter = 1000){
    let output = M;
    for(let i = 0; i<iter; i++){
        let {Q,R} = QRFactorize(output);
        output = R.multiply(Q);
    }
    let vec = new Float64Array(M.rows);
    for(let i = 0; i<M.rows; i++) vec[i] = output.arr[i*output.columns + i];
    return vec;
}

function computeEigenpairsWithQR(M, iter = 1000){
    let output = M;
    let S = getIdentity(M.rows);
    for(let i = 0; i<iter; i++){
        let {Q,R} = QRFactorize(output);
        output = R.multiply(Q);
        S = S.multiply(Q);
    }
    let vec = new Float64Array(M.rows);
    for(let i = 0; i<M.rows; i++) vec[i] = output.arr[i*output.columns + i];
    
    S = S.transpose();

    let eigenvectors = (new Array(S.rows)).fill(0).map(i => i = S.getRow(i));

    return [vec, eigenvectors];
}

function jacobiEigen(T) {
    const n = T.rows;
    const S = Float64Array.from(T.arr);
    const E = getIdentity(n);
    const e = new Float64Array(n);
    const ind = new Int32Array(n);
    const changed = new Array(n).fill(true);
    let state = n;

    if (n < 2) { 
        e[0] = S[0]; 
        return [E, e]; 
    }

    const maxind = (k) => {
        let m = k + 1;
        for (let j = k + 2; j < n; j++) {
            if (Math.abs(S[k * n + j]) > Math.abs(S[k * n + m])) m = j;
        }
        return m;
    };

    const update = (k, t) => {
        const y = e[k];
        e[k] = y + t;
        if (changed[k] && y === e[k]) { 
            changed[k] = false; 
            state--; 
        }
        else if (!changed[k] && y !== e[k]) { 
            changed[k] = true; 
            state++; 
        }
    };

    const rotate = (k, l, i, j, c, s) => {
        const u = S[k * n + l], v = S[i * n + j];
        S[k * n + l] = c * u - s * v;
        S[i * n + j] = s * u + c * v;
    };

    for (let k = 0; k < n; k++) {
        e[k] = S[k * n + k];
        if (k < n - 1) ind[k] = maxind(k);
    }

    while (state !== 0) {
        let m = 0;
        for (let k = 1; k < n - 1; k++) {
            if (Math.abs(S[k * n + ind[k]]) > Math.abs(S[m * n + ind[m]])) m = k;
        }

        const k = m, l = ind[m];
        const p = S[k * n + l];
        if (p === 0) break;                      

        const y = (e[l] - e[k]) / 2;
        const d = Math.abs(y) + Math.hypot(p, y);
        const r = Math.hypot(p, d);
        const c = d / r;
        let s = p / r;
        let t = (p * p) / d;
        if (y < 0) { s = -s; t = -t; }

        S[k * n + l] = 0;
        update(k, -t);
        update(l, t);

        for (let i = 0; i < k; i++)         rotate(i, k, i, l, c, s);
        for (let i = k + 1; i < l; i++)     rotate(k, i, i, l, c, s);
        for (let i = l + 1; i < n; i++)     rotate(k, i, l, i, c, s);

        for (let i = 0; i < n; i++) {
            const u = E.arr[i * n + k], v = E.arr[i * n + l];
            E.arr[i * n + k] = c * u - s * v;
            E.arr[i * n + l] = s * u + c * v;
        }

        for (let i = 0; i <= Math.min(l, n - 2); i++) ind[i] = maxind(i);
    }

    return [E, e]; 
}

function randomMatrix(n, symmetric = true){
    let output = new Matrix(n,n);
    for(let i =0; i<n; i++){
        for(let j = 0; j<n; j++){
            if(symmetric && i>j) output.arr[i*n + j] = output.arr[j*n + i];
            else output.arr[i*n + j] = Math.floor(Math.random()*10);
        }
    }
    return output;
}

function invert(M){
    let {U, S, V} = SVD(M);
    let D = new Matrix(S.rows,S.rows);
    for(let i = 0; i<D.arr.length; i++){
        if(S.arr[i*S.columns + i] != 0) D.arr[i*D.columns + i] = 1/S.arr[i*S.columns + i];
    }
    return V.multiply(D).multiply(U.transpose());
}

function findNullVector(M){
    const {U:U, S:S, V:V} = SVD(M);
    const n = M.rows;
    for(let i = 0; i < n; i++){
        if(Math.abs(S.arr[i*S.columns + i]) < epsilon || isNaN(S.arr[i*S.columns + i])) {
            return V.getColumn(i);
        }
    }
    return new Float64Array(n);
}

function operatorNorm(M, iter = 1000){
    let n = M.columns;
    let vec = getE(n, 0);

    for(let j = 0; j<iter; j++){
        vec = M.vecMultiply(vec);
        let norm = Math.sqrt(vec.dot(vec));
        if(norm != 0) vec = vec.scalarMultiply(1/norm);
        else break;
    }

    let mVec = M.vecMultiply(vec);
    return Math.sqrt(mVec.dot(mVec));
}

function conditionNumber(M){
    return operatorNorm(M)*operatorNorm(invert(M));
}

function diagonalize(M){
    const eigenpairs = computeEigenpairsWithQR(M);
    const D = Diag(eigenpairs[0]);
    let V = new Matrix(M.rows, M.rows);
    V.arr = convertRowsToMatrixArr(eigenpairs[1]);
    V = V.transpose();

    return {V:V, D:D};
}

function vectorMean(u) {
    return u.reduce((a, b) => a + b) / u.length;
}

function vectorCov (u, v) {
    let s = 0;
    const μu = vectorMean(u);
    const μv = vectorMean(v);
    for(let i = 0; i < u.length; i++) s += (u[i] - μu) * (v[i] - μv);
    return s / u.length;
}

function vectorStdDev(u) {
    return Math.sqrt(vectorCov(u,u));
}

function pearsonCorrelation(u, v) {
    return vectorCov(u, v) / (vectorStdDev(u) * vectorStdDev(v));
}

function bauerFikeEigenvalueSensitivity(M){
    //https://en.wikipedia.org/wiki/Bauer%E2%80%93Fike_theorem
    //Assume p = infinity

    const {V, D} = diagonalize(M);
    const k_P = conditionNumber(V);
    const norm = operatorNorm(M);

    return k_P * norm;
}

function convertRowsToMatrixArr(rows) {
    return new Float64Array(rows.map(i => i = [...i]).flat());
}

function marchenkoPasturEigenvalueDistribution(M){
    //https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution

    let μ = 0;
    let σ2 = 0;

    for(let xi of M.arr) μ += xi / M.arr.length;
    for(let xi of M.arr) σ2 += (xi - μ)**2 / M.arr.length;

    const λ = M.rows / M.columns;
    const λp = σ2 * (1 + Math.sqrt(λ))**2;
    const λm = σ2 * (1 - Math.sqrt(λ))**2;
    
    return {λ, λp, λm, σ2};
}

function wipeMatrixMemory() {
    memory = new Float64Array(maxSize);
    memoryPointer = 0;
    memory.fill(0);
}