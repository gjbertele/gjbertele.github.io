const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

//if(!window.location.href.includes('impostorLaptop') && !isIOS) window.location.replace('https://math.gb.net/impostorLaptop');

document.querySelector('.gamePage').style.display = 'none';
document.querySelector('.playerDisplay').style.display = 'none';