/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/
// All functions realted to messages.
// On message receive.
user.socket.on("receiveMessage", handleNewMessage);

// This function show messages.
function showMessages() {
    if (!activeRoom._id) { return; }
    let template = `<div class="bg-modal fade-in modal-content mx-auto mt-10 overflow-hidden p-4 shadow-xl sm:max-w-lg sm:w-full"><div id="messages_id" class="mb-2 scroll-y-hidden h-80">`;
    for (let i = 0; i < activeRoom.messages.length; i++) {
        template += messageTemplate(activeRoom.messages[i]);
    }
    template += `</div><input type="text" placeholder="Send Message.." maxlength="255" class="w-full" onchange="javascript: sendMessage(this);" /></div>`
    showModal(template);
    // Scroll to bottom and hide notification.
    let messagesEl = document.getElementById("messages_id");
    scrollToBottom(messagesEl);
    showMessageNotification(``);
}

// Send message function.
function sendMessage(element) {
    if (!activeRoom._id) { return; }
    if (element.value.length == 0) { return; }
    let newMessage = { roomID: activeRoom._id, content: element.value, emailAddress: user.emailAddress };
    user.socket.emit("createMessage", newMessage);
    handleNewMessage(newMessage);
    element.value = ``;
}

// This function handle new message.
function handleNewMessage(message) {
    if (!activeRoom._id) { return; }
    activeRoom.messages.push(message);
    let messagesEl = document.getElementById("messages_id");
    if (messagesEl == null) {
        // Show notification.
        showMessageNotification(`<i class="fad fa-circle text-primary"></i>`);
        return;
    }
    // Show message.
    messagesEl.innerHTML += messageTemplate(message);
    scrollToBottom(messagesEl);
}

// Message template.
function messageTemplate(message) {
    return `<div class="p-4 mb-2 ${message.emailAddress == user.emailAddress ? 'bg-primary' : 'bg-light'}"><h4 class="${message.emailAddress == user.emailAddress ? 'text-white' : 'text-subtitle'} mb-0">${showText(message.content)}</h4></div>`;
}

// Scroll to bottom.
function scrollToBottom(el) {
    el.scrollTop = el.scrollHeight;
}

// Message notification.
function showMessageNotification(content) {
    let el = document.getElementById("messageNotification_id");
    if (el == null) { return; }
    el.innerHTML = content;
}

// This function shows text in DOM.
function showText(content) {
    let el = document.createElement("span");
    el.innerText = content;
    return el.innerHTML;
}

