let user = {
    socket: null
}

const log = document.querySelector('.log');

document.querySelector('button').onclick = () => {
    DeviceMotionEvent.requestPermission().then((state) => {
        if (state != 'granted') return;

        window.addEventListener('devicemotion', (e) => {
            let accel = {
                x: round(e.acceleration.x),
                y: round(e.acceleration.y),
                z: round(e.acceleration.z)
            }

            user.socket.send(JSON.stringify({
                timeSent: Date.now(),
                acceleration: accel
            }));
            log.textContent = accel.x + ", " + accel.y + ", " + accel.z;
        });
    });
}

const round = (x) => {
    return Math.floor(x * 100) / 100;
}


const connectToWebSocket = () => {
    user.socket = new WebSocket("wss://gjb.one");

    user.socket.addEventListener("open", () => {
        console.log("Connected to server");
        log.innerHTML += 'Connected<br>';
    });

    user.socket.addEventListener("message", (event) => {
        console.log("Message from server:", event.data);
    });

    user.socket.addEventListener("close", () => {
        console.log("Disconnected");
        log.innerHTML += 'Disconnected<br>';
    });

    user.socket.addEventListener("error", (err) => {
        console.error("WebSocket error:", err);
        log.innerHTML += err + '<br>';
    });
}

connectToWebSocket();