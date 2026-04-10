class ServerConnection {
    socket;
    wsAPIURL = `ws://localhost:3000/`;
    openListeners = [];
    openConnections = {};

    constructor(){
        if(window.location.href.includes('gjb.one')){
            this.wsAPIURL = 'wss://gjb.one/';
        }
    }

    async initialize(){
        this.socket = new WebSocket(this.wsAPIURL);

        this.socket.addEventListener('message', (message) => {
            if(message.data == 'Success') return console.log('Success');
            const data = JSON.parse(message.data);
            console.log(data.type);

            for(let listener of this.openListeners){
                if(data.type == listener[0]) listener[1](data.data);            
            }

            return;
        });

        const promise = new Promise((resolve) => {
            this.socket.addEventListener("open", () => {
                console.log("Connected to server");
                this.socket.send('gameshow');
                resolve(true);
            });
        });

        return promise;
    }

    addEventListener(type, callback){
        this.openListeners.push([type, callback]);

        return;
    }

    async updateUserData(user){
        await this.socket.send(JSON.stringify({
            type: 'addUser',
            data: user
        }));

        return true;
    }

    sendVideoChunkToServer(chunk){
        this.socket.send(chunk);
        return;
    }

    async refreshPreferences(user){
        await this.socket.send(JSON.stringify({
            type: 'updateUserPreferences',
            data: user
        }));

        return true;
    }

    forceUserRefresh(user){
        this.socket.send(JSON.stringify({
            type:'forceUserRefresh',
            data: {
                id: user.id
            }
        }));
    }

    promoteUser(user){
        const nextLocation = user.location == 'crowd' ? 'contestant' : 'priority';

        this.socket.send(JSON.stringify({
            type:'setUserLocation',
            data: {
                user,
                location: nextLocation
            }
        }));
    }
    
    demoteUser(user){
        const nextLocation = user.location == 'priority' ? 'contestant' : 'crowd';

        this.socket.send(JSON.stringify({
            type:'setUserLocation',
            data: {
                user,
                location: nextLocation
            }
        }));
    }

    setUserHeartState(user, heartState){
        this.socket.send(JSON.stringify({
            type:'setUserHeartState',
            data: {
                user,
                heartState
            }
        }));
    }

    setHeartState(heartsEnabled){
        this.socket.send(JSON.stringify({
            type:'setHeartState',
            data: {
                heartsEnabled
            }
        }));
    }

    phoneAFriend(){
        this.socket.send(JSON.stringify({
            type: 'phoneAFriend',
            data: {}
        }));
    }

    sendChatMessage(content){
        this.socket.send(JSON.stringify({
            type: 'chatMessage',
            data: {
                content,
                name: user.name
            }
        }));
    }

    send(){
       return this.socket.send(...arguments);
    }

    createPeerConnection = (targetID) => {
        const connection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        connection.onicecandidate = (e) => {
            if(e.candidate){
                this.socket.send(JSON.stringify({
                    type: 'ice',
                    data: {
                        from: user.id,
                        to: targetID,
                        candidate: e.candidate
                    }
                }));
            }
        }

        connection.ontrack = (e) => {
            const idx = getUserIdxById(targetID);
            if(idx == -1) return;
            connectedUsers[idx].streaming.videoElement.srcObject = e.streams[0];
            connectedUsers[idx].streaming.videoElement.play();
        }

        user.recording.mediaStream.getTracks().forEach(track => {
            connection.addTrack(track, user.recording.mediaStream);
        });
    
       this.openConnections[targetID] = connection;
        
        return connection;
    }



}