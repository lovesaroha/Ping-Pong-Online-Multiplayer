/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/
// All functions related to rooms.
let rooms = {};

// Get rooms from server.
function getRooms() {
  return fetch(`/api/rooms`, {
    method: 'get',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  }).then(response => response.json()).then(json => {
    // Save room data.
    rooms = json;
  });
}

// Leave room function.
function leaveRoom() {
  activeRoom = {};
  // Leave room.
  user.socket.emit("leaveRoom");
}

// Show create roomn function.
function showCreateRoomForm() {
  showModal(`<div class="bg-modal fade-in modal-content mx-auto mt-10 overflow-hidden p-4 shadow-xl sm:max-w-lg sm:w-full">
    <form onsubmit="javascript: createRoom(event);">
    <div class="bg-light max-w-md p-2 mb-2">
    <h4 class="text-gray mb-0">Enter password to protect room access (Optional).</h4></div>
    <input type="password" class="w-full mb-2" minlength="5" name="password" placeholder="Room password..">
    <button  type="submit" name="submit">Create Room</button>
    </form></div>`);
}

// This function shows list of rooms.
function showRooms() {
  let template = ``;
  let roomsEl = document.getElementById("rooms_id");
  if (roomsEl == null) { return; }
  if (Object.keys(rooms).length == 0) {
    // No game rooms.
    roomsEl.innerHTML = `<div class="mb-2 card flex p-2 mx-auto max-w-md">
        <i class="fad fa-game-board fa-3x mr-3 icon-primary"></i>
        <div class="w-full self-center"><h3 class="bg-placeholder mb-2 p-2 w-half"></h3><h4 class="bg-placeholder mb-0 p-2"></h4></div></div>
        <div class="mb-2 card flex p-2 mx-auto max-w-sm">
        <i class="fad fa-game-board fa-3x mr-3 icon-primary"></i>
        <div class="w-full self-center"><h3 class="bg-placeholder mb-2 p-2 w-half"></h3><h4 class="bg-placeholder mb-0 p-2"></h4></div></div>
        <div class="mb-6 card flex p-2 mx-auto max-w-md">
        <i class="fad fa-game-board fa-3x mr-3 icon-primary"></i>
        <div class="w-full self-center"><h3 class="bg-placeholder mb-2 p-2 w-half"></h3><h4 class="bg-placeholder mb-0 p-2"></h4></div></div>
        <center><h1 class="font-bold mb-0">Looks like no room is available</h1>
        <h4 class="text-subtitle">Fortunately, it's very easy to create one.</h4>
        <button onclick="javascript: showCreateRoomForm(this);">Create Now</button>
        </center>`;
    return;
  }
  Object.keys(rooms).forEach(_id => {
    template += roomTemplate(rooms[_id]);
  });
  roomsEl.innerHTML = `<div class="mx-auto max-w-xl mb-2"><input class="w-full" id="searchRooms_id" placeholder="Search rooms.." oninput="javascript: searchRooms(this);"></div><div id="roomsList_id">` + template + `</div><center><button onclick="javascript: showCreateRoomForm();"> Create Room</button></center>`;
}

// This function return room template.
function roomTemplate(room) {
  let emailAddress = room.playerOne.emailAddress || room.playerTwo.emailAddress;
  return `<div class="card mb-2 mx-auto max-w-xl flex  p-4">
    <i class="fad fa-game-board icon-primary fa-4x mr-3 hide-on-md"></i>
    <div class="media-body truncate">
    <h3 class="font-bold mb-0 hover:underline cursor-pointer" onclick="javascript: joinRoom(this);" data-id="${room._id}">Room-${room._id}</h3>
    <h4 class="mb-0 text-subtitle">${emailAddress}</h4></div></div>`;
}

// Search rooms function.
function searchRooms(element) {
  let template = ``;
  let roomsEl = document.getElementById("roomsList_id");
  if (roomsEl == null) { return; }
  Object.keys(rooms).forEach(_id => {
    // Find matching room.
    let emailAddress = rooms[_id].playerOne.emailAddress || rooms[_id].playerTwo.emailAddress;
    if (`${emailAddress} ${_id}`.match(new RegExp(element.value, 'i'))) {
      template += roomTemplate(rooms[_id]);
    }
  });
  roomsEl.innerHTML = template;
}

// This function requires to enter room password.
function enterRoomPassword(el) {
  let roomID = el.getAttribute("data-id");
  showModal(`<div class="bg-modal fade-in modal-content mx-auto mt-10 overflow-hidden p-4 shadow-xl sm:max-w-lg sm:w-full">
    <h3 class="font-bold">Room-${roomID}</h3><div class="bg-light max-w-md p-2 mb-2">
    <h4 class="text-gray mb-0">This room is password protected , enter password to join this room.</h4></div>
    <input data-id="${roomID}" type="password" minlength="5" onchange="javascript: sendJoinRoomRequest(this);" class="w-full" placeholder="Password.."></div>`);
}

// Join room function.
function joinRoom(el) {
  let room = rooms[el.getAttribute("data-id")];
  if (!room) { return; }
  if (room.password == "da39a3ee5e6b4b0d3255bfef95601890afd80709") {
    sendJoinRoomRequest(el);
    return;
  }
  // Enter room password to join.
  enterRoomPassword(el);
}

// This function send join room request.
function sendJoinRoomRequest(el) {
  let room = rooms[el.getAttribute("data-id")];
  if (!room) { return; }
  let password = el.value || "";
  user.socket.emit("joinRoom", { emailAddress: user.emailAddress, roomID: room._id, password: password }, function (response) {
    if (response.error) {
      // Cannot join.
      showModal(`<div class="bg-modal fade-in modal-content mx-auto mt-10 overflow-hidden p-4 shadow-xl sm:max-w-lg sm:w-full"><center><i class="fad fa-envelope mb-3 fa-4x icon-primary"></i>
      <h3 class="font-bold">${response.error}</h3></center></div>`);
      return;
    }
    activeRoom = room;
    addPlayerToRoom({ emailAddress: user.emailAddress, _id: user.socket.id });
    closeModal();
    window.location = `/#/room?id=${room._id}`;
  });
}

// This function create new room.
function createRoom(e) {
  e.preventDefault();
  let password = e.target.password.value;
  user.socket.emit("createRoom", { "password": password, "emailAddress": user.emailAddress }, function (response) {
    activeRoom = response;
    window.location = `/#/room?id=${response._id}`;
    closeModal();
  });
}

// This function checks if room member.
function isRoomMember() {
  if (!activeRoom._id) { return false; }
  if (activeRoom.playerOne._id != user.socket.id && activeRoom.playerTwo._id != user.socket.id) {
    // User not a member.
    return false;
  }
  return true;
}

// Player joined.
user.socket.on("playerJoined", handlePlayerJoined);

// Room leaved by any member.
user.socket.on("playerLeft", handlePlayerLeft);

// On room removed.
user.socket.on("roomUnavailable", function (response) {
  let room = rooms[response.roomID];
  if (!room) { return; }
  delete rooms[room._id];
  showRooms();
});

// On room created.
user.socket.on("roomAvailable", function (response) {
  let room = response;
  rooms[room._id] = room;
  showRooms();
});
