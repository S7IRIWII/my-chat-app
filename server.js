const express = require("express");
const http = require("http");
const { Server } = require("socket.io");


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const users = {}; // Map usernames to socket IDs
const messages = {}; // Map conversation pairs to message arrays

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle a new user joining
    socket.on("newUser", (name) => {
        users[name] = socket.id; // Map username to socket ID
        io.emit("updateUserList", Object.keys(users)); // Send updated user list to all clients
    });

    // Handle a private message
    socket.on("sendMessage", ({ sender, recipient, message }) => {
        // Save the message in the history
        const chatKey = [sender, recipient].sort().join("-");
        if (!messages[chatKey]) {
            messages[chatKey] = [];
        }
        messages[chatKey].push({ sender, message });

        // Send the message to the recipient if online
        const recipientSocketId = users[recipient];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receiveMessage", { sender, message });
        }
    });

    // Retrieve chat history when a user opens a chat
    socket.on("getChatHistory", ({ sender, recipient }) => {
        const chatKey = [sender, recipient].sort().join("-");
        const chatHistory = messages[chatKey] || [];
        socket.emit("chatHistory", chatHistory);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        // Find and remove the disconnected user
        const disconnectedUser = Object.keys(users).find(
            (key) => users[key] === socket.id
        );
        if (disconnectedUser) {
            delete users[disconnectedUser];
            io.emit("updateUserList", Object.keys(users)); // Update the user list for all
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
