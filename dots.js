let canvasOffsetTop, canvasOffsetLeft, canvasWidth, ctx, canvas, gridCount;
let dots = [];

const loadDots = () => {
    gridCount = 45;
    canvas = document.querySelector('.dots');
    ctx = canvas.getContext('2d');
    canvasOffsetLeft = width*0.45;
    canvasOffsetTop = height*0.2;
    canvasWidth = height*0.6;

    canvas.width = width;
    canvas.height = height;

    for(let dotX = 0; dotX<gridCount; dotX++){
        for(let dotY = 0; dotY<gridCount; dotY++){
            let fractionX = dotX/gridCount;
            let fractionY = dotY/gridCount;
            dots.push([canvasOffsetLeft + fractionX*canvasWidth, canvasOffsetTop + fractionY*canvasWidth, 0, 0, 0, 0]);
        }
    }
    stepDots();
}

const stepDots = () => {
    ctx.clearRect(0,0,width,height);

    for(let i = 0; i<dots.length; i++){
        let dot = dots[i];
        console.log(dot);
        let velocityDX = dot[2]-dot[4];
        let velocityDY = dot[3]-dot[5];
        

        dot[4] = dot[2];
        dot[5] = dot[3];

        dot[2] += velocityDX;
        dot[3] += velocityDY;

        dot[0] += dot[2];
        dot[1] += dot[3];

        let dmy = my - dot[1];
        let dmx = mx - dot[0];

        let distanceToMouse = dmy*dmy + dmx*dmx + 1;
        if(distanceToMouse <= 6400){
            let angleToMouse = Math.atan2(dmy, dmx);
            dot[0]-=Math.cos(angleToMouse)*height/distanceToMouse;
            dot[1]-=Math.sin(angleToMouse)*height/distanceToMouse
        } else {
            let normalY = i % gridCount;
            let normalX = (i - normalY)/gridCount;
            let originalX = canvasOffsetLeft + canvasWidth*normalX/gridCount;
            let originalY = canvasOffsetTop + canvasWidth*normalY/gridCount;
            let dx = originalX - dot[0];
            let dy = originalY - dot[1];
            if(dx*dx + dy*dy >= 3){
                let angleToDefault = Math.atan2(dy, dx);
                dot[0]+=Math.cos(angleToDefault);
                dot[1]+=Math.sin(angleToDefault);
            } else {
                dot[0] = originalX;
                dot[1] = originalY;
            }
        }

        ctx.beginPath();
        ctx.arc(dot[0],dot[1],3,0,2*Math.PI);
        ctx.fill();

    }
    requestAnimationFrame(stepDots);
}