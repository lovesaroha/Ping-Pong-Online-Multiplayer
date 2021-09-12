/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/
// All functions related to game.
// Reset puck.
function resetPuck() {
    puck = { x: 310, y: 210 };
    puckVelocity = { x: 0, y: 0 };
}

// Show puck function.
function showPuck() {
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, 20, 0, 2 * Math.PI);
    ctx.lineWidth = 20;
    ctx.fillStyle = colorTheme.normal;
    ctx.fill();
}

// Move puck.
function movePuck() {
    if (!activeRoom._id) { return; }
    puck.x += puckVelocity.x;
    puck.y += puckVelocity.y;
    if (puck.y < 6 || puck.y > canvas.height - 6) {
        puckVelocity.y *= -1;
    }
    let point = false;
    if (puck.x < 0) {
        activeRoom.service = -1;
        activeRoom.playerTwo.score += 1;
        point = true;
    } else if (puck.x > canvas.width) {
        activeRoom.service = 1;
        activeRoom.playerOne.score += 1;
        point = true;
    }
    if (point) {
        user.socket.emit("changeService", { roomID: activeRoom._id, service: activeRoom.service });
        showPlayerCards();
        resetPuck();
        return;
    }
    let paddleHit = false;
    if (puck.x - 10 < 20 && puck.y + 10 > activeRoom.playerOne.paddle && puck.y - 10 < activeRoom.playerOne.paddle + 100) {
        let angle = map(puck.y, activeRoom.playerOne.paddle, activeRoom.playerOne.paddle + 100, -45, 45);
        // Left hit.
        puckVelocity.x = 5 * Math.cos(angle * Math.PI / 180);
        puckVelocity.y = 5 * Math.sin(angle * Math.PI / 180);
        if (angle < -30 || angle > 30) {
            // Smash faster velocity.
            puckVelocity.x *= 2;
        }
        if (activeRoom.playerOne._id == user.socket.id) {
            paddleHit = true;
        }
    }
    if (puck.x + 10 > 600 && puck.y + 10 > activeRoom.playerTwo.paddle && puck.y - 10 < activeRoom.playerTwo.paddle + 100) {
        let angle = map(puck.y, activeRoom.playerTwo.paddle, activeRoom.playerTwo.paddle + 100, 225, 135);
        // Right hit.
        puckVelocity.x = 5 * Math.cos(angle * Math.PI / 180);
        puckVelocity.y = 5 * Math.sin(angle * Math.PI / 180);
        if (angle < 165 || angle > 195) {
            // Smash faster velocity.
            puckVelocity.x *= 2;
        }
        if (activeRoom.playerOne._id == user.socket.id) {
            paddleHit = true;
        }
    }
    if (paddleHit) {
        user.socket.emit("paddleHit", { roomID: activeRoom._id, puckVelocity: puckVelocity, puck: puck });
    }
}

// Show paddles.
function showPaddles() {
    if (!activeRoom._id) { return; }
    if (activeRoom.playerOne.emailAddress) {
        ctx.beginPath();
        ctx.fillStyle = colorTheme.normal;
        ctx.fillRect(0, activeRoom.playerOne.paddle, 20, 100);
    }
    if (activeRoom.playerTwo.emailAddress) {
        ctx.beginPath();
        ctx.fillStyle = colorTheme.normal;
        ctx.fillRect(600, activeRoom.playerTwo.paddle, 20, 100);
    }
}

// Draw function.
function draw() {
    if (!window.location.hash.includes(activeRoom._id)) { return; }
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    showPaddles();
    showPuck();
    movePuck();
    window.requestAnimationFrame(draw);
}

// Paddle control function.
window.addEventListener("keydown", function (e) {
    if (!activeRoom._id) { return; }
    if (document.getElementById("messages_id")) { return; }
    e.preventDefault();
    let paddleMoved = false;
    let move = 0;
    if (e.keyCode == 38) {
        move = -40;
    } else if (e.keyCode == 40) {
        move = 40;
    }
    if (activeRoom.playerOne._id == user.socket.id) {
        activeRoom.playerOne.paddle += move;
        paddleMoved = { playerOne: activeRoom.playerOne.paddle };
    } else {
        activeRoom.playerTwo.paddle += move;
        paddleMoved = { playerTwo: activeRoom.playerTwo.paddle };
    }
    if (paddleMoved && move != 0) {
        user.socket.emit("movePaddle", { _id: activeRoom._id, paddleMoved: paddleMoved });
    }
    if (e.keyCode == 32) {
        if (!activeRoom.playerOne._id || !activeRoom.playerTwo._id || !isRoomMember()) { return; }
        if ((activeRoom.service == 1 && user.socket.id == activeRoom.playerTwo._id) || (activeRoom.service == -1 && user.socket.id == activeRoom.playerOne._id)) { return; }
        if (puckVelocity.x != 0 && puckVelocity.y != 0) { return; }
        user.socket.emit("startGame", { roomID: activeRoom._id }, function (response) {
            puckVelocity = response.puckVelocity;
        });
    }
});

// Map function map values between given range.
function map(n, start1, stop1, start2, stop2, withinBounds) {
    var newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) {
        return newval;
    }
    if (start2 < stop2) {
        return constrain(newval, start2, stop2);
    } else {
        return constrain(newval, stop2, start2);
    }
}

// Add player to active room.
function addPlayerToRoom(player) {
    if (!activeRoom._id) { return; }
    if (activeRoom.playerOne.emailAddress) {
        activeRoom.playerTwo = { emailAddress: player.emailAddress, score: 0, paddle: 160, _id: player._id };
    } else {
        activeRoom.playerOne = { emailAddress: player.emailAddress, score: 0, paddle: 160, _id: player._id };
    }
}

// On paddle moved.
user.socket.on("paddleMoved", function (response) {
    if (!activeRoom._id) { return; }
    if (response.paddleMoved.playerOne) {
        activeRoom.playerOne.paddle = response.paddleMoved.playerOne;
    } else {
        activeRoom.playerTwo.paddle = response.paddleMoved.playerTwo;
    }
});

// On game started.
user.socket.on("gameStarted", function (response) {
    if (!activeRoom._id) { return; }
    puckVelocity = response.puckVelocity;
});

// Hit paddle function.
user.socket.on("hitPaddle", function (response) {
    puck = response.puck;
    puckVelocity = response.puckVelocity;
});