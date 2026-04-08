class ServerConnection {
    socket;
    wsAPIURL = `ws://localhost:3000/`;
    openListeners = [];

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
            if(data.type != 'videoData') console.log(data);

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


}