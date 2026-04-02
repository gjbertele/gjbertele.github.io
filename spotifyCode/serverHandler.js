class ServerConnection {
    socket;
    apiURL = `ws://localhost:3000/`;
    openListeners = [];

    constructor(){
    }

    async initialize(){
        this.socket = new WebSocket(this.apiURL);

        this.socket.addEventListener('message', (message) => {
            if(message.data == 'Success') return console.log('Success');
            const data = JSON.parse(message.data);
            console.log(data);

            for(let listener of this.openListeners){
                if(data.type == listener[0]) listener[1](data.data);            
            }

            return;
        });

        const promise = new Promise((resolve) => {
            this.socket.addEventListener("open", () => {
                console.log("Connected to server");
                this.socket.send('spotify');
                resolve(true);
            });
        });

        return promise;
    }

    addEventListener(type, callback){
        this.openListeners.push([type, callback]);

        return;
    }

    addPlayer(recentTracks, username, profilePicture){
        this.socket.send(JSON.stringify({
            type:'addPlayer',
            data:{
                recentTracks,
                username,
                profilePicture
            }
        }));

        return;
    }

    updateSelection(gameCode, submissionID){
        this.socket.send(JSON.stringify({
            type:'updateSelection',
            data:{
                id: submissionID,
                gameCode
            }
        }));
    }

    async createGame(){
        let gameCode = Math.floor(Math.random()*10000) + '';
        while(gameCode.length < 4) gameCode = '0'+gameCode;

        await this.socket.send(JSON.stringify({
            type:'createGame',
            data:{
                gameCode
            }
        }));
        return gameCode;
    }

    joinGame(gameCode){
        this.socket.send(JSON.stringify({
            type:'joinGame',
            data:{
                gameCode
            }
        }));

        return;
    }

    startGame(gameCode){
        this.socket.send(JSON.stringify({
            type:'startGame',
            data:{
                gameCode
            }
        }));

        return;
    }



}