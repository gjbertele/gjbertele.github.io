import * as THREE from 'three';

class PhotoData {
    pixels = [];
    width = 0;
    height = 0;
    fov = 0;
    position = {x:0,y:0,z:0};
    angle = {rx:0,ry:0,rz:0};

    constructor(fileName){
        
    }
}

class Vector {
    constructor(...args){
        return new Float64Array(...args);
    }
}

const generateRotationMatrix = (angle) => {
    let ca = Math.cos(angle.ry);
    let sa = Math.sin(angle.ry);
    let cb = Math.cos(angle.rz);
    let sb = Math.sin(angle.rz);
    let cg = Math.cos(angle.rx);
    let sg = Math.sin(angle.rx);

    return new Matrix([
        new Vector(ca*cb, ca*sb*sg-sa*cg, ca*sb*cg + sa*sg),
        new Vector(sa*cb, sa*sb*sg+ca*cg, sa*sb*cg - ca*sg),
        new Vector(-sb, cb*sg, cb*cg)
    ]);
}

