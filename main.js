let height, width;
let mousedown = false;
let mx = 0;
let my = 0;
const loadEvents = () => {
    width = document.body.clientWidth;
    height = document.body.clientHeight;


    document.body.onmousemove = (e) => {
       mx = e.clientX;
       my = e.clientY;
    }

    document.body.onmousedown = () => {
        mousedown = true;
    }

    document.body.onmouseup = () => {
        mousedown = false;
    }
}
document.body.onload = () => {
    loadEvents();

    loadDots();
}
