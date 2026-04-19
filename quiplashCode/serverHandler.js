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
            console.log(data.type);

            for(let listener of this.openListeners){
                if(data.type == listener.type){
                    listener.callback(data.data);
                }
            }

            return;
        });

        const promise = new Promise((resolve) => {
            this.socket.addEventListener("open", () => {
                console.log("Connected to server");
                this.socket.send('quiplash');
                resolve(true);
            });
        });

        return promise;
    }

    async emitEvent(type, data){
        await this.socket.send(JSON.stringify({
            type:type,
            data:data
        }));

        return;
    }

    removeEventListener(id){
        this.openListeners = this.openListeners.filter(i => i.id != id);
        return;
    }

    addEventListener(type, callback){
        const id = Math.random();
        this.openListeners.push({
            type, callback, id
        });

        return id;
    }


}