let ball, radius;

let x = 200;
let y = 200;
let px = 195;
let py = 195;
const stepBall = () => {
    let dx = x - px;
    let dy = y - py;
    px = x;
    py = y;
    x += dx;
    y += dy;
    radius = ball.clientWidth/2;

    if(mousedown === true){
        let angle = Math.atan2(my-y,mx-x);
        x+=Math.cos(angle)*0.5;
        y+=Math.sin(angle)*0.5;
    }

    if(x + radius >= width || x - radius <= 0){
        x -= 2*dx;
    }

    if(y + radius >= height || y - radius <= 0){
        y -= 2*dy;
    }

    ball.style.left = x+'px';
    ball.style.top = y+'px';

    requestAnimationFrame(stepBall);

    return;
}

const loadBall = () => {
    ball = document.querySelector('.ball');
    ball.style.display = 'inline-block';
    radius = ball.clientWidth/2;
    stepBall();

    return;
}