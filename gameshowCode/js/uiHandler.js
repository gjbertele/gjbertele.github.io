const joinContestantButton = document.querySelector('.joinContestantButton');
const joinSpectatorButton = document.querySelector('.joinSpectatorButton');
const pageNames = ['initialPage', 'streamingPage'];
const pages = pageNames.map(i => i = document.querySelector('.'+i));

const displayPage = (pageName) => {
    const idx = pageNames.indexOf(pageName);
    for(let i = 0; i < pageNames.length; i++){
        if(pages[i]) pages[i].style.left = `${(i - idx)*100}%`;
    }

    return;
}

joinContestantButton.addEventListener('click', async () => {
    user.permissions = 1;
    user.name = document.querySelector('.nameInput').value;
    if(user.name == '') return;
    await initializeStreaming();
    recordVideo();
    displayPage('streamingPage');
    joinCall();
});

joinSpectatorButton.addEventListener('click', async () => {
    user.permissions = 0;
    user.name = document.querySelector('.nameInput').value;
    if(user.name == '') return;
    await initializeStreaming();
    displayPage('streamingPage');
    joinCall();
});


