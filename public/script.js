const socket = io();

const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("join-btn");
const userList = document.getElementById("user-list");
const chatBox = document.getElementById("chat-box");
const backBtn = document.getElementById("back-btn");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

let currentUser = null;
let currentRecipient = null;

// Join chat
joinBtn.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        socket.emit("newUser", username); // Notify server of new user
        loginScreen.style.display = "none";
        chatScreen.style.display = "block";
    }
});

// Update user list
socket.on("updateUserList", (users) => {
    userList.innerHTML = "";
    users.forEach((user) => {
        if (user !== currentUser) {
            const userItem = document.createElement("div");
            userItem.textContent = user;
            userItem.addEventListener("click", () => {
                currentRecipient = user;
                chatBox.style.display = "block";
                userList.style.display = "none";
                send-btn.style.display = "none";

                // Request chat history
                socket.emit("getChatHistory", { sender: currentUser, recipient: currentRecipient });
            });
            userList.appendChild(userItem);
        }
    });
});

// Display chat history
socket.on("chatHistory", (chatHistory) => {
    messages.innerHTML = ""; // Clear previous messages
    chatHistory.forEach(({ sender, message }) => {
        messages.innerHTML += `<div>${sender}: ${message}</div>`;
    });
});

// Send message
sendBtn.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message && currentRecipient) {
        socket.emit("sendMessage", {
            sender: currentUser,
            recipient: currentRecipient,
            message,
        });
        messages.innerHTML += `<div>Vous : ${message}</div>`;
        messageInput.value = "";
    }
});

// Receive message
socket.on("receiveMessage", ({ sender, message }) => {
    if (sender === currentRecipient) {
        messages.innerHTML += `<div>${sender}: ${message}</div>`;
    }
});

// Back to user list
backBtn.addEventListener("click", () => {
    chatBox.style.display = "none";
    userList.style.display = "block";
});
