// const { text } = require("express");

const socket = io("/");
const videoGrid = document.getElementById("video-grid");

var peer = new Peer(undefined, {
  path: "./peerjs",
  host: "/",
  port: "443", // port: "3030",
});

let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;

//const peers={}

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    // message part
    let text = $("input");

    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        // 13 是鍵盤上的 enter
        console.log(text.val());
        socket.emit("message", text.val());
        text.val("");
      }
    });

    socket.on("createMessage", (message) => {
      console.log("This is coming from server", message);
      $(".messages").append(
        `<li class='message'> <b>User: </b> <pre>${message}</pre></li>`
      );
      scrollToBottom();
    });
  });

peer.on("open", (id) => {
  console.log(id);
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

// 訊息超過一定數量會跑版，所以需要隨著新訊息的增加，往下移
const scrollToBottom = () => {
  let d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

// 靜音 mute func
const muteUnmute = () => {
  console.log(myVideoStream);
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = ` 
    <i class='unmute fas fa-microphone'></i>
    <span>已開啟麥克風</span>
  `;

  document.querySelector(".main__mute__button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `   
    <i class='mute fas fa-microphone-slash'></i>
    <span>靜音中</span>
  `;
  document.querySelector(".main__mute__button").innerHTML = html;
};


// stop video func

const playStop = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setStopVideo();
  } else {
    setPlayVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = ` 
    <i class='stopVideo fas fa-video-slash'></i>
    <span>已停止攝像頭</span>
  `;

  document.querySelector(".main__video__button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `   
    <i class='playVideo fas fa-video'></i>
    <span>已開啟攝像頭</span>
  `;
  document.querySelector(".main__video__button").innerHTML = html;
};