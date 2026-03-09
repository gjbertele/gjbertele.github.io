const enterNameNextButton = document.querySelector('.enterName > .nextButton');
const friendHolder = document.querySelector('.friendHolder');
const addFriendButton = document.querySelector('.addFriendButton');
const submitButton = document.querySelector('.submit');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isProd = true||!window.location.href.includes(127);

if(isIOS){
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'fgWebCode/webIOS.css';
    document.head.appendChild(stylesheet);
} else {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'fgWebCode/webLaptop.css';
    document.head.appendChild(stylesheet);
}

const heightScaleOffset = isIOS ? 0.13 : 0.185;
const apiURL = 'https://unpedagogic-tyrone-exuberant.ngrok-free.dev';

const swipePage = () => {
    let name = formatName(document.querySelector('.nameInput').value);
    if(name.length == 0){
        document.querySelector('.incorrectInput').textContent = 'You must enter your name';
        return;
    }

    if(['sophie', 'claire', 'daniel', 'lucas', 'avery'].includes(name.toLowerCase().split(' ')[0]) && name.indexOf(' ') == -1){
        document.querySelector('.incorrectInput').textContent = 'Include your last name or last initial';
        return;
    }

    document.querySelector('.enterName').style.left = '150%';
    document.querySelector('.enterFriends').style.left = '50%';
    document.cookie = "name="+name;

    document.querySelector('.bottomWarning').textContent = 'You can add more friends later, but you cannot remove any.';

    let firstCalculatedHeight = Math.min(heightScaleOffset*document.body.clientHeight,document.body.clientHeight*0.535);
    addFriendButton.style.top = firstCalculatedHeight+'px';
    submitButton.style.top = (firstCalculatedHeight + 0.06*document.body.clientHeight)+'px';

    return;
}

enterNameNextButton.onclick = swipePage;
document.querySelector('.nameInput').onkeydown = (e) => {
    if(e.key == 'Enter') swipePage();
    return;
}


let friendNames = [];

const addFriendToHolder = () => {
    let friendID = Math.floor(100000*Math.random());
    const friendCardContainer = document.createElement('div');
    friendCardContainer.className = 'friendCard';
    friendCardContainer.id = friendID;


    const newFriendCard = document.createElement('input');
    newFriendCard.className = 'editableLabel';
    newFriendCard.placeholder = 'Type here'
    friendCardContainer.appendChild(newFriendCard);

    const removeButton = document.createElement('div');
    removeButton.className = 'removeButton';
    friendCardContainer.appendChild(removeButton);
    const removeSVG = document.createElement('svg');
    removeButton.appendChild(removeSVG);
    removeSVG.outerHTML = `<svg class="removeButtonSVG" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    <line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line>
    </svg>`;
    
    removeButton.onclick = () => {
        removeFriendFromList(friendID);
    }

    friendHolder.appendChild(friendCardContainer);

    friendNames.push({
        name:'',
        id:friendID
    });

    newFriendCard.onchange = () => {
        for(let i = 0; i<friendNames.length; i++){
            if(friendNames[i].id == friendID) friendNames[i].name = newFriendCard.value;
        }
    }

    let n = friendHolder.childNodes.length;
    let heightPerBox = friendCardContainer.clientHeight;
    
    if(!isIOS) heightPerBox += 0.5*document.body.clientWidth/100;
    else heightPerBox += 2*document.body.clientHeight/100;

    let calculatedHeight = Math.min(n*heightPerBox+0.005*document.body.clientWidth+heightScaleOffset*document.body.clientHeight,document.body.clientHeight*0.535);

    friendCardContainer.style.top = (n-1)*heightPerBox + 'px';
    addFriendButton.style.top = calculatedHeight+'px';
    submitButton.style.top = (calculatedHeight + 0.06*document.body.clientHeight)+'px';
} 

const removeFriendFromList = (friendID) => {
    let children = friendHolder.childNodes;
    for(let i = 0; i<children.length; i++){
        if(children[i].id == friendID) friendHolder.removeChild(children[i]);
    }

    for(let i = 0; i<friendNames.length; i++){
        if(friendNames[i].id = friendID) friendNames.splice(i, 1);
    }
        
    children = friendHolder.childNodes;

    let firstCalculatedHeight = Math.min(heightScaleOffset*document.body.clientHeight,document.body.clientHeight*0.535);
    addFriendButton.style.top = firstCalculatedHeight+'px';
    submitButton.style.top = (firstCalculatedHeight + 0.06*document.body.clientHeight)+'px';

    for(let i = 0; i<children.length; i++){
        let n = (i+1);
        let heightPerBox = children[i].clientHeight;
        if(!isIOS) heightPerBox += 0.5*document.body.clientWidth/100;
        else heightPerBox += 2*document.body.clientHeight/100;

        let calculatedHeight = Math.min(n*heightPerBox+0.005*document.body.clientWidth+heightScaleOffset*document.body.clientHeight,document.body.clientHeight*0.535);
        
        children[i].style.top = (n-1)*heightPerBox + 'px';
        addFriendButton.style.top = calculatedHeight+'px';
        submitButton.style.top = (calculatedHeight + 0.06*document.body.clientHeight)+'px';
    }
}

const formatName = (name) => {
    let words = name.split(' ');
    if(words.length == 0) return '';
    for(let i = 0; i<words.length; i++){
        let chars = words[i].toLowerCase().split('');
        if(chars[0]) chars[0] = chars[0].toUpperCase();
        words[i] = chars.join('');
    }

    if(!['Sophie', 'Claire', 'Daniel', 'Lucas', 'Avery'].includes(words[0])) return words[0];

    return words[0]+(words.length>1?(' '+words[1].charAt(0)):'');
}

const submitFriendsToServer = () => {
    document.querySelector('.setup').style.display = 'none';
    
    let filteredFriends = friendNames.map(i => i = i.name).filter(i => i.length != 0).map(i => i = formatName(i)).join(';');

    if(filteredFriends.length == 0){
        startGraphing();
        return;
    }

    let encodeRoot = encodeURIComponent(formatName(document.querySelector('.nameInput').value));
    let encodedFriendNames = encodeURIComponent(filteredFriends);

    fetch(`${apiURL}/addConnections?root=${encodeRoot}&adjacency=${encodedFriendNames}`, {
        'headers':{
            'ngrok-skip-browser-warning':'true'
        }
    }).then(() => {
        startGraphing();
    }).catch(() => {
        document.querySelector('.overlayText').textContent = 'Something went wrong, try again later.'
    });
}

addFriendButton.onclick = addFriendToHolder;
submitButton.onclick = submitFriendsToServer;


if(document.cookie.startsWith('name=')){
    document.querySelector('.nameInput').value = document.cookie.slice(5);
    swipePage();
}

