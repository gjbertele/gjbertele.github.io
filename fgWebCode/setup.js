const enterNameNextButton = document.querySelector('.enterName > .nextButton');
const friendHolder = document.querySelector('.friendHolder');
const addFriendButton = document.querySelector('.addFriendButton');
const submitButton = document.querySelector('.submit');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isProd = true||!window.location.href.includes(127);
let gradeList = ["Daniel Aalemansour", "Nathan Aguiar", "Clara Aksakal", "Louis Anderson", "Vir Arora", "Lara Asch", "Lilah Baez", "Nicole Ban", "Graham Bertele", "Julia Bertele", "Madeline Blizzard", "Lucas Bockner", "Willow Boison", "Zach Boukkouri", "Sened Brhane", "Omar Burik", "Coco Campbell", "Emma Canan", "Sophie Cao", "Claire Chi", "JL Chretien", "Vincent Cohen", "Jay Collingwood", "Rafi Cressall", "Madeleine Davant", "Areg Louis Devoyans", "Angela Ding", "Sophia Douoguih", "Cody Encarnacion", "Alex Fagell", "Alexandra Finn", "Elie Fisher", "Autumn Fleary", "Teddy Friedman", "Hani Garside", "Kenzie Goldsteen", "Andrew Gorman", "Gobind Gosal", "Connor Graham", "AJ Greenberg", "Jackman Grossman", "Ivaylo Guenov", "Eshaan Gupta", "Sophie Haar", "Hedy Hao", "Langston Hill", "Okan Holmes", "Ethan Huang", "Vivienne Huang", "Delaney Hughes", "Isaac Jain", "Lauren Jain", "Patrick Jiminez", "Sadie Johnson", "Zuri Johnson", "Graciana Kabwe", "Jude Kelly", "Merritt Kelso", "Rajan Khanna", "Sara Khoury", "Palden Kim", "Claire Kinnier", "Stephen Koopersmith", "Sisi Kostorowski", "Luca Kountoupes", "Zara Lakhanpal", "Colette Lee", "Cameron Linehan", "Lukas Malachowski", "Paige Margie", "Maggie McDonald", "Parker Medlin", "Trevor Minton", "Caroline Mohamadi", "Vivian Morris", "Avery Mullen", "Lindsay Neal", "Tyler Nguyen", "Emi Nyhan", "Sophie Ochiai", "Seneca Oehrle", "Osewe Ogada", "Lexi Orr", "Jacob Osorio-Buitrago", "Cate Oswald", "William Panner", "Daniel Piho", "Sophie Pitt", "Faris Price", "Linus Rhee", "Tai Robbins", "Daniel Rodriguez", "Yossi Rosen", "Genesis Schneeberg", "Kai Schropfer", "Lucas Schwinden", "Naomi Sedwick", "Zoe Shrank", "Eyob Sisay", "Avery Slover", "Chloe Son", "Ella Song", "Leonardo Soriano", "Eliane Soukou", "Porter Speece", "Stella Stone", "Karan Tholan", "Elisa Tsao", "Romy Ugel", "Maina Vaidya", "Gillian Vaswani", "Amelia Vaughn", "Dylan Verma", "Lucy Verma", "Astrid Virk", "Aditya Viswanathan", "Noah Walliser", "Naiah Weetjens", "Avery Wincup", "Tessa Wiseman", "Sophie Xu", "Justin Yarborough", "Ava Yoon", "Daphne Zwicker"];
let nicknames = [["Buk","Zach"],["Aj","AJ"],["Jl","JL"]];

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
let username;
const swipePage = () => {
    username = formatName(document.querySelector('.nameInput').value);
    if(username.length == 0){
        document.querySelector('.incorrectInput').textContent = 'You must enter your name';
        return;
    }

    if(username.toLowerCase().includes('rajan')) return;


    if(['sophie', 'claire', 'daniel', 'lucas', 'avery'].includes(username.toLowerCase().split(' ')[0]) && username.indexOf(' ') == -1){
        document.querySelector('.incorrectInput').textContent = 'Include your last name or last initial';
        return;
    }

    document.querySelector('.enterName').style.left = '150%';
    document.querySelector('.enterFriends').style.left = '50%';
    document.cookie = "name="+username;

    document.querySelector('.bottomWarning').textContent = 'You can add more friends later, but you cannot remove any.';

    let firstCalculatedHeight = Math.max(document.body.clientHeight*0.2,Math.min(heightScaleOffset*document.body.clientHeight,document.body.clientHeight*0.535));
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
        if(friendNames[i].id == friendID) friendNames.splice(i, 1);
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

gradeList = gradeList.map(i => i = formatName(i));
gradeList.push("Maddie");
gradeList[gradeList.indexOf('Vincent')] = 'Vinnie';
gradeList.push("Buk");


const conjugateList = (list) => {
    if(list.length <= 1) return list.join(' ');
    if(list.length == 2) return list.join(' and ')
    let clone = list;
    clone[list.length-1] = 'and '+clone[list.length-1];
    return clone.join(', ');
}

const submitFriendsToServer = () => {
    let friendsList = friendNames.map(i => i = i.name).filter(i => i.length != 0).map(i => i = formatName(i));

    console.log(friendsList);

    let invalidNames = [];
    let invalidInitials = [];

    for(let i = 0; i<friendsList.length; i++){
        if(['Sophie', 'Claire', 'Daniel', 'Lucas', 'Avery'].includes(friendsList[i]) && friendsList[i].split(' ').length == 1) invalidInitials.push(friendsList[i]);
        else if(!gradeList.includes(friendsList[i])) invalidNames.push(friendsList[i]);
        
    }

    console.log(invalidNames, invalidInitials);

    let isOrAre = invalidNames.length > 1 ? "are" : "is";

    if(invalidNames.length > 0 && invalidInitials.length > 0){
        document.querySelector('.incorrectInputFriends').innerHTML = `Make sure <b>${conjugateList(invalidNames)}</b> ${isOrAre} in our grade and spelled correctly, and include a last initial for <b>${conjugateList(invalidInitials)}</b>.`;
        return;
    } else if(invalidNames.length > 0){
        document.querySelector('.incorrectInputFriends').innerHTML = `Make sure <b>${conjugateList(invalidNames)}</b> ${isOrAre} in our grade and spelled correctly.`
        return;
    } else if(invalidInitials.length > 0){
        document.querySelector('.incorrectInputFriends').innerHTML = `Include a last initial for <b>${conjugateList(invalidInitials)}</b>.`
        return;
    }

    document.querySelector('.setup').style.display = 'none';

    if(friendsList.length == 0){
        startGraphing();
        return;
    }

    for(let i = 0; i<nicknames.length; i++){
        let nameIdx = friendsList.indexOf(nicknames[i][0]);
        if(nameIdx != -1) friendsList[nameIdx] = nicknames[i][1];
    }

    let filteredFriends = friendsList.join(';');


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


if(!localStorage.getItem('isGraham') && document.cookie.startsWith('name=')){
    document.querySelector('.nameInput').value = document.cookie.slice(5);
    swipePage();
}

