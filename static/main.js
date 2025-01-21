const socket = io("/");
const main__chat__window = document.getElementById("main__chat_window");
const videoGrids = document.getElementById("video-grids");
const myVideo = document.createElement("video");
const chat = document.getElementById("chat");
OtherUsername = "";
chat.hidden = true;
myVideo.muted = true;

window.onload = () => {
    $(document).ready(function() {
        $("#getCodeModal").modal("show");
    });
};

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: window.location.hostname,
    port: window.location.protocol === "https:" ? 443 : 80,
    secure: window.location.protocol === "https:",
});



let myVideoStream;
const peers = {};
var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

sendmessage = (text) => {
    if (event.key === "Enter" && text.value != "") {
        console.log("Sending message:", text.value);
        socket.emit("messagesend", myname + ' : ' + text.value);
        text.value = "";
        main__chat_window.scrollTop = main__chat_window.scrollHeight;
    }
};

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream, myname);

socket.on("user-connected", (id, username) => {
    console.log(`Received "user-connected" event: ID = ${id}, Username = ${username}`);
    connectToNewUser(id, myVideoStream, username);
});


socket.on("user-disconnected", (id) => {
    console.log(`User disconnected: ID = ${id}`);
    if (peers[id]) {
        peers[id].close();
        delete peers[id];
    }
});

    });
peer.on("call", (call) => {
    console.log(`Incoming call from user ID: ${call.peer}`);
    getUserMedia(
        { video: true, audio: true },
        (stream) => {
            console.log("Answering call with local stream.");
            call.answer(stream); // Answer the call with an A/V stream
            const video = document.createElement("video");
            call.on("stream", (remoteStream) => {
                console.log("Adding remote stream.");
                addVideoStream(video, remoteStream, OtherUsername);
            });
        },
        (err) => {
            console.error("Failed to get local stream:", err);
        }
    );
});

peer.on("open", (id) => {
    console.log("Peer connection open with ID:", id);
    socket.emit("join-room", roomId, id, myname);
});

peer.on("error", (err) => {
    console.error("Peer.js error:", err);
});

socket.on("createMessage", (message) => {
    console.log("New message received:", message);
    var ul = document.getElementById("messageadd");
    var li = document.createElement("li");
    li.className = "message";
    li.appendChild(document.createTextNode(message));
    ul.appendChild(li);
});

socket.on("AddName", (username) => {
    console.log("Other user's name received:", username);
    OtherUsername = username;
});


const RemoveUnusedDivs = () => {
    //
    alldivs = videoGrids.getElementsByTagName("div");
    for (var i = 0; i < alldivs.length; i++) {
        e = alldivs[i].getElementsByTagName("video").length;
        if (e == 0) {
            alldivs[i].remove();
        }
    }
};

const connectToNewUser = (userId, streams, myname) => {
    console.log(`Connecting to new user: ID = ${userId}, Name = ${myname}`);
    const call = peer.call(userId, streams);

    call.on("stream", (userVideoStream) => {
        console.log(`Receiving video stream from user: ${myname}`);
        const video = document.createElement("video");
        addVideoStream(video, userVideoStream, myname);
    });

    call.on("close", () => {
        console.log(`Call with user ID = ${userId} closed.`);
        RemoveUnusedDivs();
    });

    call.on("error", (err) => {
        console.error(`Error in call with user ID = ${userId}:`, err);
    });

    peers[userId] = call;
};


const cancel = () => {
    $("#getCodeModal").modal("hide");
};

const copy = async() => {
    const roomid = document.getElementById("roomid").innerText;
    await navigator.clipboard.writeText("http://localhost:3030/join/" + roomid);
};
const invitebox = () => {
    $("#getCodeModal").modal("show");
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        document.getElementById("mic").style.color = "red";
    } else {
        document.getElementById("mic").style.color = "white";
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const VideomuteUnmute = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    console.log(getUserMedia);
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        document.getElementById("video").style.color = "red";
    } else {
        document.getElementById("video").style.color = "white";
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

const showchat = () => {
    if (chat.hidden == false) {
        chat.hidden = true;
    } else {
        chat.hidden = false;
    }
};

const addVideoStream = (videoEl, stream, name) => {
        console.log("Adding video stream for user:", name);
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play();
        console.log(`Video stream for ${name} is now playing.`);
    });
    const h1 = document.createElement("h1");
    const h1name = document.createTextNode(name);
    h1.appendChild(h1name);
    const videoGrid = document.createElement("div");
    videoGrid.classList.add("video-grid");
    videoGrid.appendChild(h1);
    videoGrids.appendChild(videoGrid);
    console.log("Video added to grid for:", name);
    videoGrid.append(videoEl);
    RemoveUnusedDivs();
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementsByTagName("video")[index].style.width =
                100 / totalUsers + "%";
        }
    }
};
