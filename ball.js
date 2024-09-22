let ball, height, width, radius;

let x = 200;
let y = 200;
let px = 195;
let py = 195;
let mousedown = false;
let mx = 0;
let my = 0;
function step(){
    radius = ball.clientWidth/2;
    let dx = x - px;
    let dy = y - py;
    px = x;
    py = y;
    x += dx;
    y += dy;
    if(mousedown){
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
    requestAnimationFrame(step);
    ball.style.left = x+'px';
    ball.style.top = y+'px';
}
document.body.onmousemove = function(e){
    mx = e.clientX;
    my = e.clientY;
}
document.body.onmousedown = function(){
    mousedown = true;
}
document.body.onmouseup = function(){
    mousedown = false;
}
document.body.onload = function(){
    ball = document.querySelector('.ball');
    width = document.body.clientWidth;
    height = document.body.clientHeight;
    radius = ball.clientWidth/2;

    
    step();
}