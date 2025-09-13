/*
Todo:
Redo resolveCollision
Redo updatePosition framework

*/


let bodies = [];
let bodyCounter = 0;
let worldWidth, worldHeight;

const loadRigidBodies = () => {
    canvas = document.querySelector('.drawBox');
    ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    worldWidth = width/100;
    worldHeight = height/100;

    bodies.push(new RigidBody(worldWidth/2 + 0.8, worldHeight/2 - 2, 1, 1, 0));
    bodies.push(new RigidBody(worldWidth/2, worldHeight/2, 1, 1, 0));

    stepBodies();

    return;
}

const stepBodies = () => {
    ctx.clearRect(0, 0, width, height);
    

    for(let i = 0; i<bodies.length; i++){
        bodies[i].step(1/60);
        bodies[i].draw();
    }

    requestAnimationFrame(stepBodies);

    return;
}


class RigidBody {
    x;
    y;
    w;
    h;
    a;
    vx;
    vy;
    va;
    fx;
    fy;
    fa;
    id;
    sdx;
    sdy;
    svx;
    svy;
    sva;

    constructor(_x, _y, _w, _h, _a){
        this.x = _x;
        this.y = _y;
        this.w = _w;
        this.h = _h;
        this.a = _a;
        this.x = _x;
        this.y = _y;
        this.fx = 0;
        this.fy = 0;
        this.fa = 0;
        this.vx = 0;
        this.vy = 0;
        this.va = 0;
        this.sdx = 0;
        this.sdy = 0;
        this.svx = 0;
        this.svy = 0;
        this.sva = 0;
        this.id = bodyCounter++;

        return this;
    }

    updatePosition = function(dt) {
        this.vx += this.svx;
        this.vy += this.svy;
        this.va += this.sva;

        this.vx = Math.sign(this.vx)*Math.min(3,Math.abs(this.vx));
        this.vy = Math.sign(this.vy)*Math.min(3,Math.abs(this.vy));
        this.va = Math.sign(this.va)*Math.min(3,Math.abs(this.va));

        let m = (this.w/100)*(this.h/100);
        this.vx += this.fx / m;
        this.vy += this.fy / m;
        this.va += this.fa / m;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.a += this.va * dt;

        this.x += this.sdx;
        this.y += this.sdy;

        this.sdx = 0;
        this.sdy = 0;

        this.fx = 0;
        this.fy = 0;
        this.fa = 0;
        this.svx = 0;
        this.svy = 0;
        this.sva = 0;

        return;
    }

    applyForce = function(fx, fy, dx, dy) {
        this.fx += fx;
        this.fy += fy;

        this.fa += fy*dx - fx*dy;

        return;
    }

    getVertices = function() { 
        let c = Math.cos(this.a);
        let s = Math.sin(this.a);

        let vertices = [];
        let [x, y] = [this.x, this.y];
        let [w, h] = [this.w, this.h];

        vertices.push([x - c*w/2 - s*h/2, y - s*w/2 - c*h/2]);
        vertices.push([x - c*w/2 + s*h/2, y - s*w/2 + c*h/2]);
        vertices.push([x + c*w/2 - s*h/2, y + s*w/2 - c*h/2]);
        vertices.push([x + c*w/2 + s*h/2, y + s*w/2 + c*h/2]);

        return vertices;
    }

    resolveCollision = function(p1, p2){
        let dx = p2[0] - p1[0];
        let dy = p2[1] - p1[1];

        if(dx > 2 || dy > 2) return;

        let mag = Math.sqrt(dx*dx + dy*dy);

        if(mag == 0) return;

        let nx = dx / mag;
        let ny = dy / mag;

        let ty = nx;
        let tx = -ny;

        let rx = p1[0] - this.x;
        let ry = p1[1] - this.y;

        let pvx = this.vx + rx * this.va;
        let pvy = this.vy + ry * this.va;

        let vn = (pvx * nx + pvy * ny);
        let vt = pvx * tx + pvy * ty;
        if(vn >= 0) return;

        let m = this.w*this.h;
        let I = (m/12)*(this.w*this.w + this.h*this.h);

        let Kn = 1/m + ((rx * ny - ry * nx)**2)/I;
        let Kt = 1/m + ((rx * ty - ry * tx)**2)/I;

        let jn = Math.max(0, -3*vn/Kn);
        let jt = -3*vt/Kt;

        let jx = jn*nx + jt*tx;
        let jy = jn*ny + jt*ny;

        let dvx = jx/m;
        let dvy = jy/m;

        let dva = (dx*jy - dy*jx)/I;

        this.svx += dvx;
        this.svy += dvy;
        this.sva += dva;

        //this.sx += dx/30;
        //this.sy += dy/30;

        console.log([dx,dy],[nx,ny],[rx,ry],[pvx,pvy], [Kn, Kt], [jn,jt], [jx, jy], [dvx, dvy, dva]);

        return;

    }

    contains = function(x, y){
        let rx = x - this.x;
        let ry = y - this.y;

        let c = Math.cos(this.a);
        let s = Math.sin(this.a);

        let rtx = c*rx + s*ry;
        let rty = -s*rx + c*ry;

        return Math.abs(rtx) <= this.w/2 && Math.abs(rty) <= this.h/2;
    }

    getClosestEscape = function(x, y){
        let rx = x - this.x;
        let ry = y - this.y;

        let c = Math.cos(this.a);
        let s = Math.sin(this.a);

        let rtx = c*rx + s*ry;
        let rty = -s*rx + c*ry;

        let sx = rtx/(this.w/2);
        let sy = rty/(this.h/2);

        if(Math.abs(sx) >= Math.abs(sy)){
            if(sx < 0) sx = -this.w/2;
            else sx = this.w/2;
        } else {
            if(sy < 0) sy = -this.h/2;
            else sy = this.h/2;
        }


        let px = this.x + c*sx + s*sy;
        let py = this.y + -s*sx + c*sy;

        return [px, py];

    }

    constrainVertex = function(x, y) {
        if(y > worldHeight) this.resolveCollision([x,y],[x,worldHeight]);
        if(y < 0) this.resolveCollision([x,y], [x, 0]);
        if(x > worldWidth) this.resolveCollision([x, y], [worldWidth, y]);
        if(x < 0) this.resolveCollision([x,y], [0, y]);

        let vertices = this.getVertices();

        for(let i = 0; i<bodies.length; i++){
            if(bodies[i].id == this.id) continue;
            for(let j = 0; j<4; j++){
                if(bodies[i].contains(...vertices[j])){
                    this.resolveCollision(vertices[j], bodies[i].getClosestEscape(...vertices[j]));
                }
            }
        }

        return;
    }

    constrainPosition = function() {
        let vertices = this.getVertices();
        for(let i = 0; i<4; i++){
            this.constrainVertex(...vertices[i]);
        }

        return;
    }

    step = function(dt) {
        this.vy += 0.05;
        this.updatePosition(dt);
        this.constrainPosition();

        return;
    }

    draw = function(){
        ctx.save();
        ctx.translate(this.x*100, this.y*100);
        ctx.rotate(this.a);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(-this.w*50, -this.h*50, this.w*100, this.h*100);
        ctx.restore();

        return;
    }
}