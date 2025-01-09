class ChatRoom {
  constructor() {
    this.socket = io("/admin");
    this.room = window.location.pathname.substring(1);
    this.messages = document.getElementById("messages");
    this.form = document.getElementById("form");
    this.input = document.getElementById("input");
    this.userCount = document.getElementById("user-count");
    this.roomName = document.getElementById("room-name");

    this.initialize();
  }

  initialize() {
    // Set room name
    this.roomName.textContent = this.room;

    // Setup event listeners
    this.setupSocketListeners();
    this.setupFormListener();
  }

  setupSocketListeners() {
    // Connection and room joining
    this.socket.on("connect", () => {
      this.joinRoom();
    });

    // Message handling
    this.socket.on("chat message", (msg) => {
      this.displayMessage(msg);
    });

    // User count updates
    this.socket.on("user count", (count) => {
      this.updateUserCount(count);
    });

    // Server messages
    this.socket.on("server message", (data) => {
      console.log("Server message:", data);
    });
  }

  setupFormListener() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendMessage();
    });
  }

  joinRoom() {
    this.socket.emit("join", { room: this.room });
  }

  sendMessage() {
    if (this.input.value) {
      this.socket.emit("chat message", {
        msg: this.input.value,
        room: this.room,
      });
      this.input.value = "";
    }
  }

  displayMessage(msg) {
    const item = document.createElement("li");
    item.textContent = msg;
    this.messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }

  updateUserCount(count) {
    this.userCount.textContent = count;
  }
}

// Initialize chat room when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ChatRoom();
});
