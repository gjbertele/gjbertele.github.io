let height, width;
let mousedown = false;
let mx = 0;
let my = 0;
let lmx = 0;
let lmy = 0;

let linkList = [];

const createLink = (href, title) => {
    const element = document.createElement('a');
    element.className = 'small text';
    element.setAttribute('href', href);
    element.textContent = title;

    element.style.position = 'absolute';
    element.style.top = linkList.length*(getDefaultFontSize()+20)+'px';

    return element;
}

const buildLinkBox = () => {
    linkList.push(createLink('proof_2.pdf','Zeta-Gamma Proof'));
    linkList.push(createLink('https://github.com/gjbertele/projects/tree/main/html/AI','Self-Contained JS Neural Net'));
    linkList.push(createLink('https://github.com/gjbertele/projects/tree/main/html/math%20utils','Self-Contained JS Math Utils/UI'));
    linkList.push(createLink('matrixSolver.html','Self-Contained JS Matrix Utils'));
    linkList.push(createLink('https://github.com/gjbertele/projects/tree/main/html','Projects Archive'));
    linkList.push(createLink('Identities.pdf','Newish Equations'));
    linkList.push(createLink('DiffEqWriteup.pdf','Interesting PDEs'));
    linkList.push(createLink('eigenvalue_derivative.pdf','Eigenvalue Derivatives'));
    linkList.push(createLink('Generalized_Permutations.pdf','Generalized Permutations'));
    linkList.push(createLink('https://github.com/gjbertele/projects/blob/main/html/DEOlder/PDE.js','PDE Solver'));

    for(let i = 0; i<linkList.length; i++){
        document.querySelector('.sectionA').appendChild(linkList[i]);
    }

    return;
}


const getDefaultFontSize = () => {
    var div = document.createElement('div');
    div.style.width = "1000em";
    document.body.appendChild(div);
    var pixels = div.offsetWidth / 1000;
    document.body.removeChild(div);
    return pixels;
}
