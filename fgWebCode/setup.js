/*
    todo: add non-removal warning
    require name input is nonempty
    link names to ip
    add refresh graph & add button to graph page
    add enter hotkeys
*/

const enterNameNextButton = document.querySelector('.enterName > .nextButton');
const friendHolder = document.querySelector('.friendHolder');
const addFriendButton = document.querySelector('.addFriendButton');
const submitButton = document.querySelector('.submit');

const swipePage = () => {
    document.querySelector('.enterName').style.left = '150%';
    document.querySelector('.enterFriends').style.left = '50%';
}

enterNameNextButton.onclick = swipePage;

let friendNames = [];

const addFriendToHolder = () => {
    const newFriendCard = document.createElement('input');
    newFriendCard.className = 'friendCard editableLabel';
    newFriendCard.placeholder = 'Type here'
    friendHolder.appendChild(newFriendCard);

    let friendID = Math.random();
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
    let heightPerBox = newFriendCard.clientHeight+0.5*document.body.clientWidth/100;
    let calculatedHeight = Math.min(n*heightPerBox+0.005*document.body.clientWidth+0.185*document.body.clientHeight,document.body.clientHeight*0.535);

    newFriendCard.style.top = (n-1)*heightPerBox + 'px';
    addFriendButton.style.top = calculatedHeight+'px';
    submitButton.style.top = (calculatedHeight + 0.06*document.body.clientHeight)+'px';
} 

const formatName = (name) => {
    console.log(name);
    let words = name.split(' ');
    for(let i = 0; i<words.length; i++){
        let chars = words[i].split('');
        chars[0] = chars[0].toUpperCase();
        words[i] = chars.join('');
    }

    return words[0]+(words.length>1?(' '+words[1].charAt(0)):'');
}

const submitFriendsToServer = () => {
    document.querySelector('.setup').style.display = 'none';
    
    let encodeRoot = encodeURIComponent(formatName(document.querySelector('.nameInput').value));
    let encodedFriendNames = encodeURIComponent(friendNames.map(i => i = i.name).filter(i => i.length != 0).map(i => i = formatName(i)).join(';'));

    fetch(`http://fgconnections.vercel.app/addConnections?root=${encodeRoot}&adjacency=${encodedFriendNames}`).then(() => {
        startGraphing();
    }).catch(() => {
        document.querySelector('.overlayText').textContent = 'Something went wrong, try again later.'
    });
}

addFriendButton.onclick = addFriendToHolder;
submitButton.onclick = submitFriendsToServer;
