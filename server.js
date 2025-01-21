const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const url = require("url");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const path = require("path");

app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.get("/join", (req, res) => {
    const roomId = uuidv4();
    console.log("Redirecting to new room:", roomId);
    res.redirect(
        url.format({
            pathname: `/join/${roomId}`,
            query: req.query,
        })
    );
});

app.get("/joinold", (req, res) => {
    console.log("Joining existing room:", req.query.meeting_id);
    res.redirect(
        url.format({
            pathname: req.query.meeting_id,
            query: req.query,
        })
    );
});

app.get("/join/:rooms", (req, res) => {
    console.log(`Rendering room "${req.params.rooms}" for user:`, req.query.name);
    res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
});


io.on("connection", (socket) => {
    console.log("New user connected with socket ID:", socket.id);

socket.on("join-room", (roomId, id, myname) => {
    console.log(`User "${myname}" with Peer ID "${id}" is joining room: "${roomId}"`);
    socket.join(roomId);
    console.log(`Broadcasting "user-connected" for Peer ID "${id}" in room: "${roomId}"`);
    socket.to(roomId).broadcast.emit("user-connected", id, myname);
});


        // Notify other users in the room
        socket.to(roomId).broadcast.emit("user-connected", id, myname);

        // Log message sent
        socket.on("messagesend", (message) => {
            console.log(`Message in room "${roomId}":`, message);
            io.to(roomId).emit("createMessage", message);
        });

        // Log names broadcasted
socket.on("tellName", (myname) => {
    console.log(`Received "tellName" for user: ${myname}`);
    socket.to(roomId).broadcast.emit("AddName", myname);
});


        // Log disconnections
        socket.on("disconnect", () => {
            console.log(`User "${myname}" with Peer ID "${id}" disconnected from room: "${roomId}"`);
            socket.to(roomId).broadcast.emit("user-disconnected", id);
        });
    });
});


server.listen(process.env.PORT || 3030);
