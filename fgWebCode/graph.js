const canvas = document.querySelector('.mainCanvas');
const ctx = canvas.getContext('2d');
const width = document.body.clientWidth;
const height = document.documentElement.clientHeight;
const springConstant = 3;
const vDamp = 0.95;
const defaultLength = 200;
const gravConstant = 10;
const dt = 1/60;

let nodePositions = [];
let names = [];
let adjacencyList = [];
let mouse = {
    x:0,
    y:0,
    down:false
}
let camera = {
    x:0,
    y:0,
    sx:1,
    sy:1
}

canvas.width = width;
canvas.height = height;

const gravityStep = () => {
    let n = nodePositions.length;

    let newNodePositions = [];

    for(let i = 0; i<n; i++){
        let netForceX = 0;
        let netForceY = 0;
    
        for(let j = 0; j<n; j++){
            if(i == j) continue;
            let dx = nodePositions[j].x - nodePositions[i].x;
            let dy = nodePositions[j].y - nodePositions[i].y;

            let dist = Math.sqrt(dx*dx + dy*dy);
        
            if(dist > 200) continue;

            let fMag = 1/dist*dist;

            netForceX += -gravConstant*fMag*dx/dist;
            netForceY += -gravConstant*fMag*dy/dist;
        }

        newNodePositions.push({
            x: nodePositions[i].x + vDamp * (nodePositions[i].x - nodePositions[i].lx) + netForceX*dt*dt,
            y: nodePositions[i].y + vDamp * (nodePositions[i].y - nodePositions[i].ly) + netForceY*dt*dt,
            lx: nodePositions[i].x,
            ly: nodePositions[i].y
        });
    }

    nodePositions = newNodePositions;
}

const physicsStep = () => {
    let n = nodePositions.length;

    let newNodePositions = [];

    for(let i = 0; i<n; i++){
        let netForceX = 0;
        let netForceY = 0;
        for(let k = 0; k<adjacencyList[i].length; k++){
            let j = adjacencyList[i][k];

            if(j >= n) break;
            if(i == j) continue;
            let dx = nodePositions[j].x - nodePositions[i].x;
            let dy = nodePositions[j].y - nodePositions[i].y;

            let dist = Math.sqrt(dx*dx + dy*dy);
            let dl = dist - defaultLength;

            netForceX += springConstant*dl*dx/dist;
            netForceY += springConstant*dl*dy/dist;
        }

        newNodePositions.push({
            x: nodePositions[i].x + vDamp * (nodePositions[i].x - nodePositions[i].lx) + netForceX*dt*dt,
            y: nodePositions[i].y + vDamp * (nodePositions[i].y - nodePositions[i].ly) + netForceY*dt*dt,
            lx: nodePositions[i].x,
            ly: nodePositions[i].y
        });
    }

    nodePositions = newNodePositions;
}

const initializeGraphPositions = () => {
    for(let i = 0; i<6; i++){
        addNode();
        for(let j = 0; j<20; j++) physicsStep();
    }
}

const addNode = () => {
    let connected = [adjacencyList.length];
    for(let i = 0; i<adjacencyList.length; i++){
        if(Math.random()>0.5) continue;
        connected.push(i);
        adjacencyList[i].push(adjacencyList.length);
    }
    adjacencyList.push(connected);

    let minPotential = 10000000;
    let bestX = -1;
    let bestY = -1;
    for(let i = 0; i<100; i++){
        let randomX = camera.x + Math.random()*width/2 - width/8;
        let randomY = camera.y + Math.random()*height/2 - height/8;
        
        let energy = computePotential(randomX, randomY, connected);
        if(energy > minPotential) continue;
        
        minPotential = energy;
        bestX = randomX;
        bestY = randomY;
    }

    nodePositions.push({
        x:bestX,
        y:bestY,
        lx:bestX,
        ly:bestY
    });

    names.push('Person '+(names.length+1));
}

const computePotential = (x, y, connections) => {
    let netForceX = 0;
    let netForceY = 0;

    for(let k = 0; k<connections.length; k++){
        let j = connections[k];

        if(!nodePositions[j]) continue;

        let dx = nodePositions[j].x - x;
        let dy = nodePositions[j].y - y;

        let dist = Math.sqrt(dx*dx + dy*dy);
        let dl = dist - defaultLength;

        netForceX += springConstant*dl*dx/dist;
        netForceY += springConstant*dl*dy/dist;

    }

    for(let j = 0; j<nodePositions.length; j++){
        let dx = nodePositions[j].x - x;
        let dy = nodePositions[j].y - y;

        let dist = Math.sqrt(dx*dx + dy*dy);
    
        if(dist > 200) continue;
        if(dist == 0) return 1000000000;

        let fMag = 10/dist*dist;

        netForceX += -gravConstant*fMag*dx/dist;
        netForceY += -gravConstant*fMag*dy/dist;
    }

    return netForceX*netForceX+netForceY*netForceY;

}


const drawGraph = () => {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    let n = adjacencyList.length;

    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3*camera.sx;
    ctx.font = `${12*camera.sx}px Arial`;

    for(let i = 0; i<n; i++){
        for(let j = 0; j<adjacencyList[i].length; j++){
            let k = adjacencyList[i][j];
            if(i == k) continue;

            let dx = nodePositions[i].x - nodePositions[k].x;
            let dy = nodePositions[i].y - nodePositions[k].y;

            let theta = Math.atan2(dy, dx);
            let nx1 = nodePositions[i].x - defaultLength*0.2*Math.cos(theta);
            let ny1 = nodePositions[i].y - defaultLength*0.2*Math.sin(theta);
            let nx2 = nodePositions[k].x + defaultLength*0.2*Math.cos(theta);
            let ny2 = nodePositions[k].y + defaultLength*0.2*Math.sin(theta);

            console.log(nx1, ny1, nx2, ny2);

            ctx.beginPath();
            ctx.moveTo((nx1 - camera.x)*camera.sx + width/2, (ny1 - camera.y)*camera.sy + height/2);
            ctx.lineTo((nx2 - camera.x)*camera.sx + width/2, (ny2 - camera.y)*camera.sy + height/2);
            ctx.stroke();
        }
    }

    for(let i = 0; i<n; i++){
        let computedWidth = names[i].length*5*camera.sx;

        let centerX =  (nodePositions[i].x - camera.x)*camera.sx + width/2;
        let centerY = (nodePositions[i].y - camera.y)*camera.sy + height/2;

        ctx.fillText(names[i], centerX - computedWidth/2, centerY);
    }
}

let lastMouse = {x:0, y:0};

const step = () => {
    physicsStep();
    for(let i = 0; i<50; i++) gravityStep();
    drawGraph();
    requestAnimationFrame(step);

    if(mouse.down){
        camera.x += (lastMouse.x - mouse.x)/camera.sx;
        camera.y += (lastMouse.y - mouse.y)/camera.sx;
    }
}

document.body.onmousewheel = (e) => {
    if(camera.sx <= 0.2 && e.deltaY < 0) return;
    if(camera.sx >= 2 && e.deltaY > 0) return;

    camera.sx += e.deltaY/1000;
    camera.sx = Math.max(camera.sx, 0.2);
    camera.sx = Math.min(camera.sx, 2);

    camera.sy = camera.sx;
}

document.body.onmousemove = (e) => {
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;

    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

document.body.onmousedown = () => {
    mouse.down = true;
}

document.body.onmouseup = () => {
    mouse.down = false;
}

initializeGraphPositions();
step();