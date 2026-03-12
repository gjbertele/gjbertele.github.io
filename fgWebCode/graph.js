const canvas = document.querySelector('.mainCanvas');
const ctx = canvas.getContext('2d');
const pixelRatio = devicePixelRatio;
const width = document.body.clientWidth*pixelRatio;
const height = document.documentElement.clientHeight*pixelRatio;
const springConstant = 7;
const vDamp = 0.9;
const defaultLength = 200;
const gravConstant = 100;
const dt = 1 / 60;
let stepping = false;

let nodePositions = {};
let adjacencyObject = {};

let mouse = {
    x: 0,
    y: 0,
    down: false,
    hovering: false,
    selected: -1
}
let camera = {
    x: 0,
    y: 0,
    sx: 1,
    sy: 1
}

canvas.width = width;
canvas.height = height;

const gravityStep = () => {
    let n = nodePositions.length;

    let newNodePositions = {};

    for (let i in nodePositions) {
        if (mouse.hovering && mouse.selected == i && mouse.down) {
            newNodePositions[i] = nodePositions[i];
            continue;
        }

        let netForceX = 0;
        let netForceY = 0;

        for (let j in nodePositions) {
            if (i == j) continue;
            let dx = nodePositions[j].x - nodePositions[i].x;
            let dy = nodePositions[j].y - nodePositions[i].y;

            let dist = Math.sqrt(dx * dx + dy * dy);

            if(dist == 0) continue;

            let fMag = 1 / dist;

            let deg = adjacencyObject[j].length + 1;

            netForceX += -deg*gravConstant * fMag * dx / dist;
            netForceY += -deg*gravConstant * fMag * dy / dist;
        }

        newNodePositions[i] = {
            x: nodePositions[i].x + vDamp * clampMag(nodePositions[i].x - nodePositions[i].lx) + netForceX * dt * dt,
            y: nodePositions[i].y + vDamp * clampMag(nodePositions[i].y - nodePositions[i].ly) + netForceY * dt * dt,
            lx: nodePositions[i].x,
            ly: nodePositions[i].y
        };
    }

    nodePositions = newNodePositions;
}

const clampMag = (max) => {
    if (max < -5) return -5;
    return Math.min(max, 5);
}

const physicsStep = () => {
    let newNodePositions = {};

    for (let i in nodePositions) {
        let netForceX = 0;
        let netForceY = 0;
        for (let k = 0; k < adjacencyObject[i].length; k++) {
            let j = adjacencyObject[i][k];
            if (!nodePositions[j]) continue;

            let dx = nodePositions[j].x - nodePositions[i].x;
            let dy = nodePositions[j].y - nodePositions[i].y;

            let dist = Math.sqrt(dx * dx + dy * dy);
            let dl = dist - defaultLength*2;
            if(dist < defaultLength) dl = -(defaultLength - dist);

            if (dist == 0) continue;

            netForceX += springConstant * dl * dx / dist;
            netForceY += springConstant * dl * dy / dist;
        }

        newNodePositions[i] = {
            x: nodePositions[i].x + vDamp * (nodePositions[i].x - nodePositions[i].lx) + netForceX * dt * dt,
            y: nodePositions[i].y + vDamp * (nodePositions[i].y - nodePositions[i].ly) + netForceY * dt * dt,
            lx: nodePositions[i].x,
            ly: nodePositions[i].y
        };
    }

    nodePositions = newNodePositions;
}

const addNode = (name = 'Unnamed', connected = []) => {
    for (let i = 0; i < connected.length; i++) {
        if(!adjacencyObject[connected[i]]) continue;
        adjacencyObject[connected[i]].push(name);
    }
    
    adjacencyObject[name] = connected;

    let minPotential = 10000000;
    let bestX = -1;
    let bestY = -1;
    for (let i = 0; i < 100; i++) {
        let randomX = camera.x + Math.random() * width*6 - width*3;
        let randomY = camera.y + Math.random() * width*6 - height*3;

        let energy = computePotential(randomX, randomY, connected);
        if (energy > minPotential) continue;

        minPotential = energy;
        bestX = randomX;
        bestY = randomY;
    }

    nodePositions[name] = {
        x: bestX,
        y: bestY,
        lx: bestX,
        ly: bestY
    };


    for (let j = 0; j < 20; j++) physicsStep();
}

const computePotential = (x, y, connections, ignoreName = -1) => {
    let netForceX = 0;
    let netForceY = 0;

    for (let k = 0; k < connections.length; k++) {
        let j = connections[k];

        if (!nodePositions[j]) continue;

        let dx = nodePositions[j].x - x;
        let dy = nodePositions[j].y - y;

        let dist = Math.sqrt(dx * dx + dy * dy);
        let dl = dist - defaultLength*2;
        if(dist < defaultLength) dl = -(defaultLength - dist);

        netForceX += springConstant * dl * dx / dist;
        netForceY += springConstant * dl * dy / dist;

    }

    for (let j in nodePositions) {
        if(j == ignoreName) continue;
        let dx = nodePositions[j].x - x;
        let dy = nodePositions[j].y - y;

        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist == 0) return 1000000000;

        let fMag = 1/dist;

        let deg = adjacencyObject[j].length + 1;

        netForceX += -deg*gravConstant * fMag * dx / dist;
        netForceY += -deg*gravConstant * fMag * dy / dist;
    }

    
    return netForceX * netForceX + netForceY * netForceY;

}


const drawGraph = () => {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2 * camera.sx;
    ctx.font = `${12*camera.sx}px Arial`;
    ctx.globalAlpha = 0.4;

    for (let i in adjacencyObject) {
        for (let k = 0; k<adjacencyObject[i].length; k++) {
            let j = adjacencyObject[i][k];
            if (i == j || !nodePositions[i] || !nodePositions[j]) continue;
            
            let dx = nodePositions[i].x - nodePositions[j].x;
            let dy = nodePositions[i].y - nodePositions[j].y;

            let theta = Math.atan2(dy, dx);
            let nx1 = nodePositions[i].x - defaultLength * 0.2 * Math.cos(theta);
            let ny1 = nodePositions[i].y - defaultLength * 0.2 * Math.sin(theta);
            let nx2 = nodePositions[j].x + defaultLength * 0.2 * Math.cos(theta);
            let ny2 = nodePositions[j].y + defaultLength * 0.2 * Math.sin(theta);

            if(mouse.down && mouse.hovering && (mouse.selected == i || mouse.selected == j)) ctx.lineWidth = 3.5*camera.sx;
            else ctx.lineWidth = 2 * camera.sx;

            ctx.beginPath();
            ctx.moveTo((nx1 - camera.x) * camera.sx + width / 2, (ny1 - camera.y) * camera.sy + height / 2);
            ctx.lineTo((nx2 - camera.x) * camera.sx + width / 2, (ny2 - camera.y) * camera.sy + height / 2);
            ctx.stroke();
        }
    }

    ctx.globalAlpha = 1;

    ctx.fillStyle = '#000';
    for (let i in adjacencyObject) {
        if(!nodePositions[i]) continue;
        let computedWidth = ctx.measureText(i).width + camera.sx;
        let computedHeight = 23*camera.sx;


        let centerX = (nodePositions[i].x - camera.x) * camera.sx + width / 2;
        let centerY = (nodePositions[i].y - camera.y) * camera.sy + height / 2;

        ctx.fillRect(centerX - computedWidth/2, centerY - computedHeight/2, computedWidth, computedHeight);
    }


    ctx.fillStyle = '#FFF';
    for (let i in adjacencyObject) {
        if(!nodePositions[i]) continue;
        let computedWidth = ctx.measureText(i).width;
        let computedHeight = ctx.measureText(i).height;

        let centerX = (nodePositions[i].x - camera.x) * camera.sx + width / 2;
        let centerY = (nodePositions[i].y - camera.y) * camera.sy + height / 2;
        
        ctx.fillText(i, centerX - computedWidth / 2, centerY);
    }
}

let lastMouse = {
    x: 0,
    y: 0,
    time:Date.now()
};

const step = () => {
    physicsStep();
    for (let i = 0; i < 10; i++) gravityStep();

    if (mouse.down) {
        if (mouse.hovering && mouse.selected != -1) {
            nodePositions[mouse.selected].x = (mouse.x*pixelRatio - width / 2) / camera.sx + camera.x;
            nodePositions[mouse.selected].y = (mouse.y*pixelRatio - height / 2) / camera.sy + camera.y;
        } else {
            let dmx = lastMouse.x - mouse.x;
            let dmy = lastMouse.y - mouse.y;

            if((dmx != 0 || dmy != 0) && mouse.time-lastMouse.time < 30){
                camera.x += devicePixelRatio * dmx / camera.sx;
                camera.y += devicePixelRatio * dmy / camera.sx;
            }

            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            lastMouse.time = mouse.time;
        }
    }

    document.body.style.cursor = (mouse.hovering) ? 'pointer' : 'default';


    drawGraph();
    requestAnimationFrame(step);
}

window.addEventListener(
    "wheel",
    (e) => {
    let divider = -1000;
      if (e.ctrlKey) {
        divider = -200;
        e.preventDefault(); 
      }


    if (camera.sx <= 0.2 && e.deltaY > 0) return;
    if (camera.sx >= 2 && e.deltaY < 0) return;

    camera.sx += e.deltaY / divider;
    camera.sx = Math.max(camera.sx, 0.2);
    camera.sx = Math.min(camera.sx, 2);

    camera.sy = camera.sx;
    },
    { passive: false }
  );

const processDrag = (ex, ey) => {
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
    lastMouse.time = mouse.time;

    mouse.x = ex;
    mouse.y = ey;
    mouse.time = Date.now();
}

document.body.onmousemove = (e) => {
    processDrag(e.clientX, e.clientY);
}


document.body.ontouchmove = (e) => {
    processDrag(e.touches[0].clientX, e.touches[0].clientY);
}

document.body.onmousedown = (e) => {
    mouse.down = true;
    if(e.touches){
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    } else {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }
    mouse.time = Date.now();

    checkForHover();
}

document.body.onmouseup = () => {
    mouse.down = false;
    mouse.hovering = false;
    mouse.selected = -1;
}

document.body.ontouchstart = document.body.onmousedown;
document.body.ontouchend = document.body.onmouseup;

document.addEventListener('gesturestart', e => {
    e.preventDefault();
});
document.addEventListener('gesturechange', e => {
    e.preventDefault()
    camera.sx = Math.min(2*pixelRatio,Math.max(0.2*pixelRatio,Math.pow(e.scale, 0.1)*camera.sx));
    camera.sy = Math.min(2*pixelRatio,Math.max(0.2*pixelRatio,Math.pow(e.scale, 0.1)*camera.sy));
});

document.addEventListener('gestureend', e => e.preventDefault());

const initializeGraph = async () => {
    const fetchedData = await fetch(`${apiURL}/recentData`, {
        'headers':{
            'ngrok-skip-browser-warning':'true'
        }
    });
    const fetchedText = await fetchedData.text();
    const newAdjacencyObject = JSON.parse(fetchedText);


    generateGraphLayout(newAdjacencyObject);

    return;
}

const checkForHover = () => {
    for (let i in nodePositions) {
        let transformedX = (nodePositions[i].x - camera.x) * camera.sx + width / 2;
        let transformedY = (nodePositions[i].y - camera.y) * camera.sy + height / 2;

        let dx = transformedX - mouse.x*pixelRatio;
        let dy = transformedY - mouse.y*pixelRatio;

        let dist = Math.sqrt(dx * dx + dy * dy);

        nodePositions[i].hovering = (dist <= defaultLength * 0.2 * camera.sx * pixelRatio);

        if (dist > defaultLength * 0.2 * camera.sx) continue;

        mouse.hovering = true;
        mouse.selected = i;
        break;
    }

    return;
}

const generateGraphLayout = (newAdjacencyObject) => {
    nodePositions = {};
    adjacencyObject = {};

    for (let i in newAdjacencyObject) {
        addNode(i, newAdjacencyObject[i]);
    }

    return;
}

const checkForUpdates = async () => {
    if(document.hidden){
        console.log('Hidden, defer');
        setTimeout(checkForUpdates, 1000);
        return;
    }

    console.log('Checking',Date.now());
     const fetchedData = await fetch(`${apiURL}/waitForData`, {
        'headers':{
            'ngrok-skip-browser-warning':'true'
        }
    });
    const fetchedText = await fetchedData.text();
    console.log('Received data')
    if(fetchedText != ''){
        const newAdjacencyObject = JSON.parse(fetchedText);

        if(Object.keys(newAdjacencyObject).length == Object.keys(adjacencyObject).length){
            console.log('New connection');
            adjacencyObject = newAdjacencyObject;
        } else if(Object.keys(newAdjacencyObject).length < Object.keys(adjacencyObject).length){
            console.log('Deletion');
            startGraphing();
        } else {
            console.log('New Person');
            for(let i in newAdjacencyObject){
                if(!adjacencyObject[i]){
                    console.log('Added',i, newAdjacencyObject[i]);
                    addNode(i, newAdjacencyObject[i]);
                }
            }
            adjacencyObject = newAdjacencyObject;
        }
    }
    
    checkForUpdates();
}


const startGraphing = async () => {
    document.querySelector('.setup').style.display = 'none';
    document.querySelector('.graph').style.display = 'none';
    document.querySelector('.loading').style.display = 'inline-block';

    setTimeout(async () => {
        await initializeGraph();
        document.querySelector('.graph').style.display = 'inline-block';
        document.querySelector('.loading').style.display = 'none';

        for(let i in adjacencyObject){
            if(i != username || !nodePositions[i]) continue;
            camera.x = nodePositions[i].x;
            camera.y = nodePositions[i].y;
        }

        if (!stepping){
            step();
            checkForUpdates();
        }
        stepping = true;
    },1000);

    return;
}

document.querySelector('.refreshButton').onclick = startGraphing;

document.querySelector('.backButton').onclick = () => {
    window.location.replace(window.location.href);
}
