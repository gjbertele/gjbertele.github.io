class Matrix {
    rows;
    columns;
    arr;
    constructor(n, m){
        if(!m){
            this.arr = n;
            this.rows = n.length;
            this.columns = n[0].length;
            return this;
        }
        this.rows = n;
        this.columns = m;

        this.arr = new Array(n);
        for(let i = 0; i<n; i++){
            this.arr[i] = new Float64Array(m);
            this.arr[i].fill(0);
        }

        return this;
    }
    plus = function(B){
        let output = new Matrix(this.rows, this.columns);
        for(let i = 0; i<this.rows; i++){
            for(let j = 0; j<this.columns; j++){
                output.arr[i][j] = this.arr[i][j] + B.arr[i][j];
            }
        }
        return output;
    }

    minus = function(B){
        let output = new Matrix(this.rows, this.columns);
        for(let i = 0; i<this.rows; i++){
            for(let j = 0; j<this.columns; j++){
                output.arr[i][j] = this.arr[i][j] - B.arr[i][j];
            }
        }
        return output;
    }

    multiply = function(B){
        let output = new Matrix(this.rows, B.columns);
        let temp = 0;
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < B.columns; j++){
                temp = 0;
                for(let k = 0; k<Math.min(this.columns, B.rows); k++){
                    temp += this.arr[i][k]*B.arr[k][j];
                }
                output.arr[i][j] = temp;
            }
        }
        return output;
    }

    vecMultiply = function(v){
        let output = new Float64Array(this.rows);
        let temp = 0;
        for(let i = 0; i<this.rows; i++){
            temp = 0;
            for(let j = 0; j<v.length; j++){
                temp += this.arr[i][j]*v[j];
            }
            output[i] = temp;
        }
        return output;
    }

    scalarMultiply = function(a){
        let output = new Matrix(this.rows, this.columns);
        for(let i = 0; i<this.rows; i++){
            for(let j = 0; j<this.columns; j++) output.arr[i][j] = a*this.arr[i][j];
        }
        return output;
    }

    transpose = function(){
        let output = new Matrix(this.columns, this.rows);
        for(let i = 0; i<this.columns; i++){
            for(let j = 0; j<this.rows; j++) output.arr[i][j] = this.arr[j][i];
        }
        return output;
    }

    dot = function(B){
        let output = 0;
        for(let i = 0; i<this.rows; i++) output += this.arr[i].dot(B.arr[i]);
        return output;
    }

    toString = function(){
        return this.arr.map(i => i = '['+i.toString()+']').join(',');
    }

    wolfram = function(){
        window.open(`https://www.wolframalpha.com/input?i=${encodeURIComponent(this.toString())}`);
        return;
    }

    QR = function(){
        return QRFactorize(this);
    }

    T = this.transpose;
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
        init.arr[i][i] = M.arr[i][i];
        lambda[i] = M.arr[i][i];
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
    for(let i = 0; i<n; i++) I.arr[i][i]  = 1;
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
    let output = getIdentity(v.length); 

    let mag = 0;
    for(let i = embedding; i<v.length; i++) mag+=v[i]**2;

    for(let i = embedding; i<v.length; i++){
        for(let j = embedding; j<v.length; j++){
            output.arr[i][j] += -2*v[i]*v[j]/mag;
        }
   }

   return output;
}

function det(M){
    let {Q, R} = QRFactorize(M);
    let output = 1;
    for(let i = 0; i<M.rows; i++) output *= R.arr[i][i];
    return output;
}

function Tr(M){
    let output = 0;
    for(let i = 0; i<M.rows; i++) output += M.arr[i][i];
    return output;
}

function Diag(vec){
    let output = new Matrix(vec.length, vec.length);
    for(let i = 0; i<vec.length; i++) output.arr[i][i] = vec[i];
    return output;
}

function SVD(M){
    let MTM = M.transpose().multiply(M);
    let lambda = computeEigenvaluesWithQR(MTM);
    let vecV = computeEigenvectorsFromEigenvalues(MTM, lambda);
    let V = new Matrix(vecV.length, vecV[0].length);
    V.arr = vecV;
    V = V.transpose();

    let U = M.multiply(V).transpose();

    for(let i = 0; i<U.arr.length; i++){
        let norm = U.arr[i].mag();
        if(norm>10**(-6)){
            U.arr[i] = U.arr[i].scalarMultiply(1/norm);
        }
    }

    U = U.transpose();
    
    let Sigma = new Matrix(lambda.length, lambda.length);
    for(let i = 0; i<lambda.length; i++) Sigma.arr[i][i] = Math.sqrt(lambda[i]);
    
    return {U:U, S:Sigma, V:V};
}

function computeEigenvaluesSparse(M){
    if(M.rows != M.columns) return;
    let n = M.rows;
    let stepSize = 0.001;
    let init = new Matrix(n,n);
    let lambda = new Array(n);
    for(let i = 0; i<n; i++){
        init.arr[i][i] = M.arr[i][i];
        lambda[i] = M.arr[i][i];
    }

    for(let i = 0; i<n; i++){
        for(let j = 0; j<n; j++){
            let steps = Math.ceil(Math.abs(init.arr[i][j] - M.arr[i][j])/stepSize);
            let dir = (M.arr[i][j] - init.arr[i][j])/steps;
            for(let m = 0; m<steps; m++){
                let nextLambda = new Array(n);
                for(let k = 0; k<n; k++){
                    let derivative = computeLambdaKD(init, lambda, k).arr[j][i];
                    nextLambda[k] = lambda[k] + derivative*dir;
                }
                lambda = nextLambda;
                init.arr[i][j] += dir;
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
    let HMatrices = [];

    for(let i = 0; i<n-1; i++){
        let aCol = An.transpose().arr[i];
        for(let j = 0; j<i; j++) aCol[j] = 0;
        let norm = Math.sqrt(aCol.dot(aCol));
        let vi = aCol.plus(getE(n, i).scalarMultiply(norm*Math.sign(aCol[i])));

        let Hn = convertReflectionToMatrix(vi, 0);
        An = Hn.multiply(An);
        Qn = Hn.multiply(Qn);
        HMatrices.push(Hn);
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
    for(let i = 0; i<M.rows; i++) vec[i] = output.arr[i][i];
    return vec;
}

function randomMatrix(n, symmetric = true){
    let output = new Matrix(n,n);
    for(let i =0; i<n; i++){
        for(let j = 0; j<n; j++){
            if(symmetric && i>j) output.arr[i][j] = output.arr[j][i];
            else output.arr[i][j] = Math.floor(Math.random()*10);
        }
    }
    return output;
}

let M = new Matrix(5,5);
M.arr = [[38,24,26,29,27],[24,31,49,34,12],[26,49,11,28,16],[29,34,28,0,9],[27,12,16,9,7]];

/*let eigenvalues = computeEigenvalues(M);
let eigenvectors = computeEigenvectorsFromEigenvalues(M, eigenvalues);
console.log(eigenvalues, eigenvectors);
*/

/*

let bvec = new Float64Array(M.rows); 
bvec.fill(1); //set b to be vector of all 1s

let solutionData = computeFirstNConstants(M, 100, bvec); //get data and solutions to Mx=b

console.log('Data:',solutionData); //log

let error = M.vecMultiply(solutionData[0]).minus(bvec); //find error
console.log('Magnitude of Error:',Math.sqrt(error.dot(error))); //log norm of error
*/
