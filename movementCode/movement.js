let user = {
    socket: null
}

document.body.onclick = () => {
    DeviceMotionEvent.requestPermission().then((state) => {
        document.write(state);
        if (state != 'granted') return;

        window.addEventListener('devicemotion', (e) => {
            user.socket.send(JSON.stringify({
                timeSent: Date.now(),
                acceleration: e.acceleration
            }));
        });
    });
}


const connectToWebSocket = () => {
    user.socket = new WebSocket("wss://gjb.one");

    user.socket.addEventListener("open", () => {
        console.log("Connected to server");
        document.write('connected');
    });

    user.socket.addEventListener("message", (event) => {
        console.log("Message from server:", event.data);
    });

    user.socket.addEventListener("close", () => {
        console.log("Disconnected");
        document.write('disconnected');
    });

    user.socket.addEventListener("error", (err) => {
        console.error("WebSocket error:", err);
        document.write(err);
    });
}

connectToWebSocket();