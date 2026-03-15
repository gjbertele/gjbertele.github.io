const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

if(!isIOS && !window.location.href.includes('127') && !window.location.href.toLowerCase().includes('latin')){
    if(!window.location.href.includes('impostorLaptop')){
        window.location.replace('./impostorLaptop.html');
    } else {
        window.history.pushState({},'','./impostor');
    }
}

document.querySelector('.gamePage').style.display = 'none';
document.querySelector('.playerDisplay').style.display = 'none';