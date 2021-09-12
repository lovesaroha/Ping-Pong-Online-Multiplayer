// Require default node modules. 
var fs = require('fs');
var path = require('path');
var sha1 = require("sha1");
var server;

// Define default app variables.
server = require('http').createServer(handler);
const io = require('socket.io')(server, {});

// Default variables data.
var rooms = {};

// Port.
const PORT = 3000;
console.log(`Server running at port ${PORT}`);
server.listen(PORT);

// Run this function on socket connection.
io.on('connection', function (socket) {

    // On socket disconnect.
    socket.on("disconnect", function (request) {
        removeMember(socket, io);
    });

    // Leave room event where one member left the room.
    socket.on("leaveRoom", function (request) {
        removeMember(socket, io);
    });

    // Create room function creates new room.
    socket.on("createRoom", function (request, callback) {
        let newRoom = {
            _id: new Date().getTime(),
            password: sha1(request.password),
            playerOne: { emailAddress: request.emailAddress, _id: socket.id },
            playerTwo: {},
            service: 1
        };
        rooms[newRoom._id] = newRoom;
        socket.join(newRoom._id);
        io.emit("roomAvailable", roomInfo(newRoom));
        callback(roomInfo(newRoom));
    });

    // Join room function.
    socket.on("joinRoom", function (request, callback) {
        let room = rooms[request.roomID];
        if (!isRoomAvailable(request.roomID, request.password)) {
            callback({ error: "Cannot join this room." });
            return;
        }
        // Set player.
        if (rooms[room._id].playerOne.emailAddress) {
            rooms[room._id].playerTwo = { emailAddress: request.emailAddress, _id: socket.id };
        } else {
            rooms[room._id].playerOne = { emailAddress: request.emailAddress, _id: socket.id };
        }
        rooms[room._id].service = 1;
        callback(roomInfo(room));
        socket.to(room._id).emit("playerJoined", { emailAddress: request.emailAddress, roomID: room._id, _id: socket.id });
        io.emit("roomUnavailable", { roomID: room._id });
        socket.join(room._id);
    });

    // Move paddle function.
    socket.on("movePaddle", function (request) {
        let room = rooms[request._id];
        if (!room) { return; }
        socket.to(request._id).emit("paddleMoved", request);
    });

    // Start game function.
    socket.on("startGame", function (request, callback) {
        let room = rooms[request.roomID];
        if (!room) { return; }
        // Check service.
        if ((socket.id == room.playerOne._id && room.service == -1) || (socket.id == room.playerTwo._id && room.service == 1)) { return; }
        // Set puck velocity.
        let puckVelocity = setPuckVelocity(rooms[room._id].service);
        callback({ puckVelocity: puckVelocity });
        socket.to(request.roomID).emit("gameStarted", { roomID: request.roomID, puckVelocity: puckVelocity });
    });

    // Change game service.
    socket.on("changeService", function (request) {
        if (!rooms[request.roomID]) { return; }
        rooms[request.roomID].service = request.service;
    });

    // On paddle hit event.
    socket.on("paddleHit", function (request) {
        if (!rooms[request.roomID]) { return; }
        socket.to(request.roomID).emit("hitPaddle", { puckVelocity: request.puckVelocity, puck: request.puck });
    });

    // Create message event.
    socket.on("createMessage", function (request) {
        let room = rooms[request.roomID];
        if (!room) { return; }
        socket.to(room._id).emit("receiveMessage", request);
    });

});

// Function to remove room member.
function removeMember(socket, io) {
    Object.keys(rooms).forEach(_id => {
        let room = rooms[_id];
        let removed = false;
        if (rooms[_id].playerOne._id == socket.id) {
            // Player one left.
            rooms[_id].playerOne = {};
            removed = true;
        }
        if (rooms[_id].playerTwo._id == socket.id) {
            // Player two left.
            rooms[_id].playerTwo = {};
            removed = true;
        }
        if (!removed) { return; }
        if (!rooms[_id].playerOne.emailAddress && !rooms[_id].playerTwo.emailAddress) {
            // Remove room.
            io.emit("roomUnavailable", { roomID: room._id });
            delete rooms[_id];
        } else {
            rooms[_id].service = 1;
            socket.to(room._id).emit("playerLeft", { roomID: _id, _id: socket.id });
            io.emit("roomAvailable", roomInfo(rooms[_id]));
        }
        socket.leave(room._id);
    });
}

// Set puck velocity.
function setPuckVelocity(direction) {
    let angle = Math.random(-Math.PI / 4, Math.PI / 4);
    let xSpeed = 5 * Math.cos(angle) * direction;
    let ySpeed = 5 * Math.sin(angle) * direction;
    return { x: xSpeed, y: ySpeed };
}

// This function check if room is available or valid.
function isRoomAvailable(id, password) {
    if (!rooms[id]) { return false; }
    if (rooms[id].playerOne.emailAddress && rooms[id].playerTwo.emailAddress) { return false; }
    if (sha1(password) != rooms[id].password) { return false; }
    return true;
}

// This function return room info.
function roomInfo(room) {
    return { _id: room._id, playerOne: room.playerOne, playerTwo: room.playerTwo, password: room.password };
}

// Create http server and listen on port 3000.
function handler(request, response) {
    // If request method is get than call function based on matching route.
    if (request.method == 'GET') {
        if (request.url.match(new RegExp("/api/rooms", 'i'))) {
            let roomList = {};
            Object.keys(rooms).forEach(_id => {
                if (rooms[_id].playerOne.emailAddress && rooms[_id].playerTwo.emailAddress) { return; }
                roomList[_id] = roomInfo(rooms[_id]);
            });
            response.writeHead(200);
            response.end(JSON.stringify(roomList), 'utf-8');
            return;
        }
    }
    var filePath = './static' + request.url;
    if (filePath == './static/') { filePath = './static/index.html'; }
    // All the supported content types are defined here.
    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png'
    };
    var contentType = mimeTypes[extname] || 'application/json';
    // Read file from server based on request url.
    fs.readFile(filePath, function (error, content) {
        if (error) {
            response.writeHead(500);
            response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}