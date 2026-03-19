class ServerConnection {
    currentPlayer;
    #openListeners;
    #apiURL = null;
    constructor(player){
        this.currentPlayer = player;
        this.#initializeSocket();
    }

    on(eventName, callback){
        this.#openListeners.push({
            eventType: eventName,
            callback: callback
        });
        return;
    }

    async #initializeSocket(){
        this.#apiURL = `https://unpedagogic-tyrone-exuberant.ngrok-free.dev`;
        this.#openListeners = [];
        await this.submitToServer(this.currentPlayer);
        await this.#reopenSocket();
    }

    async #reopenSocket(){
        if(this.#apiURL == null) return;
        try {
            const fetchedData = await fetch(`${this.#apiURL}/roulette/waitForEvent`, {
                'headers':{
                    'ngrok-skip-browser-warning':'true',
                    'playerID':this.currentPlayer.playerID
                }
            });

            const fetchedText = await fetchedData.text();
            if(fetchedText != ''){
                const responseData = JSON.parse(fetchedText);

                for(let listener of this.#openListeners){
                    if(listener.eventType == responseData.eventType){
                        listener.callback(responseData.data);
                    }
                }
            }

            this.#reopenSocket();
        } catch(err) {
            console.error(err);
            setTimeout(() => {
                this.#reopenSocket();
            },5000)
        }
        return;
    }

    async joinGame(gameCode){
        if(this.#apiURL == null) return;

        const fetchedData = await fetch(`${this.#apiURL}/roulette/joinGame`, {
            'headers':{
                'ngrok-skip-browser-warning':'true',
                'playerID':this.currentPlayer.playerID,
                'gameCode':gameCode
            }
        });
        const fetchedText = await fetchedData.text();

        if(fetchedText == 'No Game Found') return false;

        const responseData = JSON.parse(fetchedText);

        return responseData;
    }

    async updateQuestionsList(newList) {
        if(this.#apiURL == null) return;

        const fetchedData = await fetch(`${this.#apiURL}/roulette/updateQuestions`, {
            'headers':{
                'ngrok-skip-browser-warning':'true',
                'questions': newList.map(i => i = i.toLowerCase().replaceAll('?','')).join('<BREAK>')
            }
        });
    }

    async createGame() {
        if(this.#apiURL == null) return;

        const fetchedData = await fetch(`${this.#apiURL}/roulette/createGame`, {
            'headers':{
                'ngrok-skip-browser-warning':'true'
            }
        });

        const fetchedText = await fetchedData.text();
        const responseData = JSON.parse(fetchedText);

        return responseData;

    }

    async startGame(gameCode) {
        if(this.#apiURL == null) return;

        const fetchedData = await fetch(`${this.#apiURL}/roulette/startGame`, {
            'headers':{
                'ngrok-skip-browser-warning':'true',
                'gameCode':gameCode
            }
        });

        const fetchedText = await fetchedData.text();

        return fetchedText == 'Success';
    }

    async submitToServer(playerData) {
        if(this.#apiURL == null) return;

        const fetchedData = await fetch(`${this.#apiURL}/roulette/submitTest`, {
            'headers':{
                'ngrok-skip-browser-warning':'true',
                'playerID':playerData.playerID,
                'username':playerData.username,
                'responses':playerData.responses,
                'confession':playerData.confession
            }
        });

        const fetchedText = await fetchedData.text();

        return fetchedText;
    }

    async submitResponses(responses) {
        if(this.#apiURL == null) return;

        const fetchedData = await fetch(`${this.#apiURL}/roulette/submitResponses`, {
            'headers':{
                'ngrok-skip-browser-warning':'true',
                'playerID':this.currentPlayer.playerID,
                'responses':responses.join('<BREAK>')
            }
        });

        const fetchedText = await fetchedData.text();

        return fetchedText;
    }
}