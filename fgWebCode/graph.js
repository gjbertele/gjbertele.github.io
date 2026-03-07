const canvas = document.querySelector('.mainCanvas');
const ctx = canvas.getContext('2d');
const width = document.body.clientWidth;
const height = document.documentElement.clientHeight;
const springConstant = 10;
const vDamp = 0.95;
const defaultLength = 200;
const gravConstant = 10;
const dt = 1 / 60;
let stepping = false;

let nodePositions = [];
let names = [];
let adjacencyList = [];
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

    let newNodePositions = [];

    for (let i = 0; i < n; i++) {
        if (mouse.hovering && mouse.selected == i) {
            newNodePositions.push(nodePositions[i]);
            continue;
        }

        let netForceX = 0;
        let netForceY = 0;

        for (let j = 0; j < n; j++) {
            if (i == j) continue;
            let dx = nodePositions[j].x - nodePositions[i].x;
            let dy = nodePositions[j].y - nodePositions[i].y;

            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 200 || dist == 0) continue;

            let fMag = 1 / dist * dist;

            netForceX += -gravConstant * fMag * dx / dist;
            netForceY += -gravConstant * fMag * dy / dist;
        }

        newNodePositions.push({
            x: nodePositions[i].x + vDamp * clampMag(nodePositions[i].x - nodePositions[i].lx) + netForceX * dt * dt,
            y: nodePositions[i].y + vDamp * clampMag(nodePositions[i].y - nodePositions[i].ly) + netForceY * dt * dt,
            lx: nodePositions[i].x,
            ly: nodePositions[i].y
        });
    }

    nodePositions = newNodePositions;
}

const clampMag = (max) => {
    if (max < -5) return -5;
    return Math.min(max, 5);
}

const physicsStep = () => {
    let n = adjacencyList.length;

    let newNodePositions = [];

    for (let i = 0; i < n; i++) {
        if(!nodePositions[i]) continue;

        let netForceX = 0;
        let netForceY = 0;
        for (let k = 0; k < adjacencyList[i].length; k++) {
            let j = adjacencyList[i][k];

            if (i == j || !nodePositions[j]) continue;

            let dx = nodePositions[j].x - nodePositions[i].x;
            let dy = nodePositions[j].y - nodePositions[i].y;

            let dist = Math.sqrt(dx * dx + dy * dy);
            let dl = dist - defaultLength;

            if (dist == 0) continue;

            netForceX += springConstant * dl * dx / dist;
            netForceY += springConstant * dl * dy / dist;
        }

        newNodePositions.push({
            x: nodePositions[i].x + vDamp * (nodePositions[i].x - nodePositions[i].lx) + netForceX * dt * dt,
            y: nodePositions[i].y + vDamp * (nodePositions[i].y - nodePositions[i].ly) + netForceY * dt * dt,
            lx: nodePositions[i].x,
            ly: nodePositions[i].y
        });
    }

    nodePositions = newNodePositions;
}

const addNode = (name = 'Unnamed', connected = []) => {
    for (let i = 0; i < connected.length; i++) {
        if(!adjacencyList[connected[i]]) continue;
        adjacencyList[connected[i]].push(adjacencyList.length);
    }
    adjacencyList.push(connected);

    let minPotential = 10000000;
    let bestX = -1;
    let bestY = -1;
    for (let i = 0; i < 100; i++) {
        let randomX = nodePositions.length == 0 ? 0 : camera.x + Math.random() * width*6 - width*3;
        let randomY = nodePositions.length == 0 ? 0 : camera.y + Math.random() * width*6 - height*3;

        let energy = computePotential(randomX, randomY, connected);
        if (energy > minPotential) continue;

        minPotential = energy;
        bestX = randomX;
        bestY = randomY;
    }

    nodePositions.push({
        x: bestX,
        y: bestY,
        lx: bestX,
        ly: bestY
    });


    names.push(name);
    for (let j = 0; j < 20; j++) physicsStep();
}

const computePotential = (x, y, connections) => {
    let netForceX = 0;
    let netForceY = 0;

    for (let k = 0; k < connections.length; k++) {
        let j = connections[k];

        if (!nodePositions[j]) continue;

        let dx = nodePositions[j].x - x;
        let dy = nodePositions[j].y - y;

        let dist = Math.sqrt(dx * dx + dy * dy);
        let dl = dist - defaultLength;

        netForceX += springConstant * dl * dx / dist;
        netForceY += springConstant * dl * dy / dist;

    }

    for (let j = 0; j < nodePositions.length; j++) {
        let dx = nodePositions[j].x - x;
        let dy = nodePositions[j].y - y;

        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 200) continue;
        if (dist == 0) return 1000000000;

        let fMag = 10 / dist * dist;

        netForceX += -gravConstant * fMag * dx / dist;
        netForceY += -gravConstant * fMag * dy / dist;
    }

    return netForceX * netForceX + netForceY * netForceY;

}


const drawGraph = () => {
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    let n = adjacencyList.length;

    ctx.fillStyle = '#FFF';
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2 * camera.sx;
    ctx.font = `${12*camera.sx}px Arial`;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < adjacencyList[i].length; j++) {
            let k = adjacencyList[i][j];
            if (i == k || !nodePositions[i] || !nodePositions[k]) continue;

            let dx = nodePositions[i].x - nodePositions[k].x;
            let dy = nodePositions[i].y - nodePositions[k].y;

            let theta = Math.atan2(dy, dx);
            let nx1 = nodePositions[i].x - defaultLength * 0.2 * Math.cos(theta);
            let ny1 = nodePositions[i].y - defaultLength * 0.2 * Math.sin(theta);
            let nx2 = nodePositions[k].x + defaultLength * 0.2 * Math.cos(theta);
            let ny2 = nodePositions[k].y + defaultLength * 0.2 * Math.sin(theta);

            ctx.beginPath();
            ctx.moveTo((nx1 - camera.x) * camera.sx + width / 2, (ny1 - camera.y) * camera.sy + height / 2);
            ctx.lineTo((nx2 - camera.x) * camera.sx + width / 2, (ny2 - camera.y) * camera.sy + height / 2);
            ctx.stroke();
        }
    }

    for (let i = 0; i < n; i++) {
        if(!names[i] || !nodePositions[i]) continue;
        let computedWidth = names[i].length * 5 * camera.sx;

        let centerX = (nodePositions[i].x - camera.x) * camera.sx + width / 2;
        let centerY = (nodePositions[i].y - camera.y) * camera.sy + height / 2;

        ctx.fillText(names[i], centerX - computedWidth / 2, centerY);
    }
}

let lastMouse = {
    x: 0,
    y: 0
};

const step = () => {
    physicsStep();
    for (let i = 0; i < 10; i++) gravityStep();

    if (mouse.down) {
        if (mouse.hovering) {
            nodePositions[mouse.selected].x = (mouse.x - width / 2) / camera.sx + camera.x;
            nodePositions[mouse.selected].y = (mouse.y - height / 2) / camera.sy + camera.y;
        } else {
            let dmx = lastMouse.x - mouse.x;
            let dmy = lastMouse.y - mouse.y;

            if(dmx != 0 || dmy != 0){

                let distanceScale = Math.min(1,50/Math.sqrt(dmx*dmx + dmy*dmy));
                dmx *= distanceScale;
                dmy *= distanceScale;

                camera.x += dmx / camera.sx;
                camera.y += dmy / camera.sx;
            }

            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
        }
    }

    document.body.style.cursor = (mouse.hovering) ? 'pointer' : 'default';


    drawGraph();
    requestAnimationFrame(step);
}

document.body.onmousewheel = (e) => {
    if (camera.sx <= 0.2 && e.deltaY < 0) return;
    if (camera.sx >= 2 && e.deltaY > 0) return;

    camera.sx += e.deltaY / 1000;
    camera.sx = Math.max(camera.sx, 0.2);
    camera.sx = Math.min(camera.sx, 2);

    camera.sy = camera.sx;
}

const processDrag = (ex, ey) => {
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;

    mouse.x = ex;
    mouse.y = ey;

    if (!mouse.down) {
        mouse.hovering = false;

        for (let i = 0; i < nodePositions.length; i++) {
            let transformedX = (nodePositions[i].x - camera.x) * camera.sx + width / 2;
            let transformedY = (nodePositions[i].y - camera.y) * camera.sy + height / 2;

            let dx = transformedX - mouse.x;
            let dy = transformedY - mouse.y;

            let dist = Math.sqrt(dx * dx + dy * dy);

            nodePositions[i].hovering = dist <= defaultLength * 0.2 * camera.sx;

            if (dist > defaultLength * 0.2 * camera.sx) continue;

            mouse.hovering = true;
            mouse.selected = i;
            break;
        }
    }
}

document.body.onmousemove = (e) => {
    processDrag(e.clientX, e.clientY);
}


document.body.ontouchmove = (e) => {
    processDrag(e.touches[0].clientX, e.touches[0].clientY);
}

document.body.onmousedown = () => {
    mouse.down = true;
}

document.body.onmouseup = () => {
    mouse.down = false;
    mouse.hovering = false;
}

document.body.ontouchstart = document.body.onmousedown;
document.body.ontouchend = document.body.onmouseup;

const initializeGraph = async () => {
    const fetchedData = await fetch(`${apiURL}/recentData`, {
        'headers':{
            'ngrok-skip-browser-warning':'true'
        }
    });
    const fetchedText = await fetchedData.text();

    const namesText = fetchedText.split("||")[0];
    const connectionsText = fetchedText.split("||")[1];

    const newNames = namesText.split(",");

    let adj = connectionsText.split(";").map(i => i.split(',').filter(i => i != ''));
    let newAdjacencyList = [];
    for (let i = 0; i < adj.length; i++) {
        let newList = [];
        for (let j = 0; j < adj[i].length; j++) {
            newList.push(newNames.indexOf(adj[i][j]));
        }
        newAdjacencyList.push(newList);
    }

    names = [];
    adjacencyList = [];
    nodePositions = [];

    for (let i = 0; i < newAdjacencyList.length; i++) {
        addNode(newNames[i], newAdjacencyList[i].filter(j => j < i));
    }
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
    if(fetchedText != ''){
        const namesText = fetchedText.split("||")[0];
        const connectionsText = fetchedText.split("||")[1];

        const newNames = namesText.split(",");

        let adj = connectionsText.split(";").map(i => i.split(',').filter(i => i != ''));
        let newAdjacencyList = [];
        for (let i = 0; i < adj.length; i++) {
            let newList = [];
            for (let j = 0; j < adj[i].length; j++) {
                newList.push(newNames.indexOf(adj[i][j]));
            }
            newAdjacencyList.push(newList);
        }

        if(newNames.length == names.length){
            console.log('New connection');
            adjacencyList = newAdjacencyList;
        } else if(newNames.length < names.length){
            console.log('Deletion');

            names = [];
            adjacencyList = [];
            nodePositions = [];

            for (let i = 0; i < newAdjacencyList.length; i++) {
                addNode(newNames[i], newAdjacencyList[i].filter(j => j < i));
            }
        } else {
            console.log('New Person');
            for(let i = 0; i<newNames.length; i++){
                if(!names.includes(newNames[i])){
                    console.log('Added',newNames[i],newAdjacencyList[i]);
                    addNode(newNames[i], newAdjacencyList[i]);
                }
            }
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
        
        let username = document.querySelector('.nameInput').value;

        for(let i = 0; i<names.length; i++){
            if(names[i] != username) continue;
            camera.x = nodePositions[i].x;
            camera.y = nodePositions[i].y;
            console.log('set to ',i);
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