const Rightarrow = document.querySelector(".arrowRight");
const Leftarrow = document.querySelector(".arrowLeft");
Rightarrow.addEventListener("click", () => {
  document.getElementById("list").classList.add("hidden"); //hidden list
  document.getElementById("chatList").classList.add("display"); //display chat
  document.getElementById("chatList").classList.remove("hidden");
  document.getElementById("list").classList.remove("display");
  document.getElementById("chatList").classList.add("chatListAnimation");
});
Leftarrow.addEventListener("click", () => {
  document.getElementById("chatList").classList.add("hidden");
  document.getElementById("list").classList.add("display");
  document.getElementById("list").classList.remove("hidden");
  document.getElementById("chatList").classList.remove("display");
  document.getElementById("list").classList.add("ListAnimation");
});

// Connect to Socket.IO
const socket = io("http://localhost:5005");

async function getUsernameFromEmail() {
  const buyerEmail = localStorage.getItem("username"); // Stored in LocalStorage

  if (!buyerEmail) {
    console.error("No buyer email found in LocalStorage.");
    return null;
  }

  try {
    const res = await fetch(`http://localhost:5005/getUsername/${buyerEmail}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    localStorage.setItem("buyerUsername", data.UserName); // Save username
    return data.UserName;
  } catch (error) {
    console.error("Error fetching username:", error);
    return null;
  }
}

async function getSellerUsernameFromUserID() {
  const selectedProperty = JSON.parse(
    sessionStorage.getItem("selectedProperty")
  );
  const userId = selectedProperty ? selectedProperty.userId : null;
  if (!userId) {
    alert("Error: Missing userID.");
    return;
  }

  try {
    const res = await fetch(`http://localhost:5005/getSeller/${userId}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const seller = data.UserName;
    const buyerUsername = localStorage.getItem("buyerUsername");

    // **Avoid setting currentChatUser if buyer and seller are the same**
    if (seller === buyerUsername) {
      console.warn(
        "Buyer and seller are the same. Not setting currentChatUser."
      );
      return;
    }

    sessionStorage.setItem("currentChatUser", seller); // Save current chat
  } catch (error) {
    console.error("Failed to fetch seller:", error);
  }
}

let selectedUser = null;

async function loadChatUsers() {
  const username = localStorage.getItem("buyerUsername");
  if (!username) return;

  try {
    const res = await fetch(`http://localhost:5005/recent-chats/${username}`);
    const chats = await res.json();
    const chatList = document.getElementById("chatUsers");
    chatList.innerHTML = ""; // Clear list

    let currentChatUser = sessionStorage.getItem("currentChatUser"); // Get current user
    let currentChatExists = false;

    chats.forEach((chat) => {
      const chatWith = chat._id.chatWith;
      if (chatWith === currentChatUser) currentChatExists = true;
      const lastMsg = chat.lastMessage || "No messages yet";

      const div = document.createElement("div");
      div.className = "chatUser";
      div.dataset.username = chatWith; // Store username for selection

      div.innerHTML = `
        <div class="userRow">
            <img src="https://cdn-icons-png.flaticon.com/128/3033/3033143.png" class="userIcon" alt="User Icon">
            <div class="userInfo">
                <h4>${chatWith}</h4>
                <p class="lastMessage">${lastMsg}</p>
                ${
                  chat.unreadCount > 0
                    ? `<span class="unreadBadge">${chat.unreadCount}</span>`
                    : ""
                }
            </div>
        </div>
    `;

      div.onclick = () => selectChatUser(div, chatWith);

      chatList.appendChild(div);
    });

    // If `currentChatUser` is not in recent chats, add it manually
    if (currentChatUser && !currentChatExists) {
      const newDiv = document.createElement("div");
      newDiv.className = "chatUser selectedUSer"; // Auto-select this user
      newDiv.dataset.username = currentChatUser;

      newDiv.innerHTML = `
        <div class="userRow">
            <img src="https://cdn-icons-png.flaticon.com/128/3033/3033143.png" class="userIcon" alt="User Icon">
            <div class="userInfo">
                <h4>${currentChatUser}</h4>
                <p class="lastMessage">No messages yet</p>
            </div>
        </div>
    `;

      newDiv.onclick = () => selectChatUser(newDiv, currentChatUser);
      chatList.prepend(newDiv); // Add at the top
    }

    // Auto-select `currentChatUser` if available
    if (currentChatUser) {
      selectChatUser(
        document.querySelector(`.chatUser[data-username="${currentChatUser}"]`),
        currentChatUser
      );
    }
  } catch (error) {
    console.error("Error loading recent chats:", error);
  }
}

function selectChatUser(selectedDiv, chatWith) {
  const allUsers = document.querySelectorAll(".chatUser");
  allUsers.forEach((div) => div.classList.remove("selectedUser"));

  selectedDiv.classList.add("selectedUser"); // Add gray background
  sessionStorage.setItem("currentChatUser", chatWith);
  // **Show Chat Section**

  // **Fix: Ensure chatSection exists before modifying it**
  const chatSection = document.getElementById("chatList");
  if (chatSection) {
    chatSection.style.display = "block"; // Show chat section when user is clicked
  }
  // Remove unread badge when opening chat
  selectedDiv.querySelector(".unreadBadge")?.remove();

  // document.getElementById("receiverName").textContent = chatWith; // Update Chat Header
  loadMessages();
}

// Load chat messages
async function loadMessages() {
  const username = localStorage.getItem("buyerUsername");
  const receiver = sessionStorage.getItem("currentChatUser");
  const messagesDiv = document.getElementById("chatList");

  // **If No User Selected, Keep Chat Section Empty**
  if (!receiver) {
    messagesDiv.innerHTML =
      "<p class='no-chat'>Select a user to start chat.</p>";
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:5005/messages/${username}/${receiver}`
    );
    const messages = await res.json();
    messagesDiv.innerHTML = "";

    messages.forEach((msg) =>
      appendMessage(msg.sender, msg.message, msg.timestamp)
    );
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}

let lastAddedDate = ""; // Store the last added date

// Append message to chat UI
function appendMessage(sender, message, timestamp) {
  const messagesDiv = document.getElementById("chatList");
  const div = document.createElement("div");
  const messageDate = new Date(timestamp).toLocaleDateString([], {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  });

  // Add date separator only if it’s a new day
  if (lastAddedDate !== messageDate) {
    lastAddedDate = messageDate; // Update lastAddedDate

    // Create the date separator
    const dateSeparator = document.createElement("div");
    dateSeparator.className = "chatDate";
    dateSeparator.innerHTML = `
        <hr />
        <div class="date">${messageDate}</div>
        <hr />
    `;
    messagesDiv.appendChild(dateSeparator);
  }

  if (sender === localStorage.getItem("buyerUsername")) {
    div.className = "sender";
    div.innerHTML = `
            <p class="senderTime">
                ${new Date(timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>
            <p class="senderChat">${message}</p>
            <a href="#" class="chatIcon">
                <img src="https://cdn-icons-png.flaticon.com/128/3033/3033143.png">
            </a>
        `;
  } else {
    div.className = "receiver";
    div.innerHTML = `
            <a href="#" class="chatIcon">
                <img src="https://cdn-icons-png.flaticon.com/128/3033/3033143.png">
            </a>
            <p class="receiverChat">${message}</p>
            <p class="receiverTime">
                ${new Date(timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </p>
        `;
  }
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  const username = localStorage.getItem("buyerUsername");
  console.log(username);
  const receiver = sessionStorage.getItem("currentChatUser");
  console.log(receiver);
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();

  // Prevent sending a message to oneself
  if (!message || !username || !receiver) return;
  if (username === receiver) {
    alert("You cannot send a message to yourself.");
    return;
  }

  const messageData = {
    sender: username,
    receiver,
    message,
    timestamp: new Date(),
  };
  console.log("Sending message:", messageData); // Debugging log
  appendMessage(username, message, messageData.timestamp);

  // Ensure Socket.IO emits only once
  if (socket.connected) {
    socket.emit("sendMessage", messageData);
  } else {
    console.error("Socket not connected");
  }
  // **Update Latest Message in Chat List Instantly**
  updateLatestMessage(receiver, message);
  messageInput.value = "";
}

function updateLatestMessage(chatWith, latestMsg, unread = false) {
  const chatUserDivs = document.querySelectorAll(".chatUser");

  chatUserDivs.forEach((div) => {
    if (div.dataset.username === chatWith) {
      const userInfo = div.querySelector(".userInfo p");
      const unreadBadge = div.querySelector(".unreadBadge");

      if (userInfo) {
        userInfo.textContent = latestMsg; // Update the latest message
      }

      // **Check if chat is open**
      const isChatOpen = sessionStorage.getItem("currentChatUser") === chatWith;
      // **Only show badge if chat is not open**
      if (isChatOpen) {
        if (unreadBadge) unreadBadge.remove();
      } else if (unread) {
        // **Show badge only if chat is NOT open**
        if (!unreadBadge) {
          const badge = document.createElement("span");
          badge.classList.add("unreadBadge");
          badge.textContent = "1";
          div.querySelector(".userInfo").appendChild(badge);
        } else {
          unreadBadge.textContent = parseInt(unreadBadge.textContent) + 1;
        }
      }
    }
  });
}

function openChat(chatWith) {
  sessionStorage.setItem("currentChatUser", chatWith);

  // **Mark as read & remove unread badge**
  updateLatestMessage(chatWith, "", false);

  // **Send read confirmation to backend**
  socket.emit("markAsRead", {
    sender: chatWith,
    receiver: localStorage.getItem("buyerUsername"),
  });
}

// Function to delete an entire chat with a specific user
function deleteChatUser(username) {
  console.log(`Attempting to delete chat with ${username}`); // Debugging log

  if (!confirm(`Are you sure you want to delete the chat with ${username}?`))
    return;

  // Remove user from UI
  document.querySelectorAll(".chatUser").forEach((div) => {
    if (div.dataset.username === username) {
      div.remove();
    }
  });

  // Send delete request to backend via Socket.IO
  socket.emit("deleteChatUser", {
    user: localStorage.getItem("buyerUsername"),
    chatWith: username,
  });

  // Clear messages if this chat was open
  if (sessionStorage.getItem("currentChatUser") === username) {
    document.getElementById("chatList").innerHTML =
      "<p class='no-chat'>Select a user to start chat.</p>";
    sessionStorage.removeItem("currentChatUser");
  }
}

// Listen for chat deletion confirmation from the server
socket.on("chatDeleted", (username) => {
  console.log(`Chat with ${username} deleted successfully.`);
});

// Function to delete a specific message
function deleteMessage(messageText, messageElement) {
  if (!messageElement) {
    console.error("Invalid message element.");
    return;
  }

  if (
    !confirm(`Are you sure you want to delete this message?\n"${messageText}"`)
  )
    return;

  // Optional: Add a fade-out effect before deletion
  messageElement.style.transition = "opacity 0.3s";
  messageElement.style.opacity = "0.5";
  setTimeout(() => {
    messageElement.remove();
  }, 300);

  // Send delete request to backend via Socket.IO
  socket.emit("deleteMessage", { messageText });
}

// Listen for message deletion confirmation from the server
socket.on("messageDeleted", (messageText) => {
  const messages = document.querySelector(".senderChat, .receiverChat");

  messages.forEach((msg) => {
    if (msg.innerText.trim() === messageText) {
      console.log(`Message "${messageText}" deleted successfully.`);
      msg.closest("div").remove(); // Remove the parent container
    }
  });
});

socket.on("markAsRead", async ({ sender, receiver }) => {
  await Message.updateMany(
    { sender, receiver, isRead: false },
    { $set: { isRead: true } }
  );
});

// Listen for incoming messages
socket.on(`receiveMessage-${localStorage.getItem("buyerUsername")}`, (msg) => {
  console.log("Received message via socket:", msg); // Debugging log
  const isChatOpen = sessionStorage.getItem("currentChatUser") === msg.sender;
  if (isChatOpen) {
    appendMessage(msg.sender, msg.message, msg.timestamp);
    updateLatestMessage(msg.sender, msg.message, !isChatOpen);
    // updateLatestMessage(msg.sender, msg.message);
  } else {
    // Increase unread count
    const userDiv = document.querySelector(`[data-username="${msg.sender}"]`);
    if (userDiv) {
      let badge = userDiv.querySelector(".unreadBadge");
      if (badge) {
        badge.textContent = parseInt(badge.textContent) + 1;
      } else {
        const newBadge = document.createElement("span");
        newBadge.className = "unreadBadge";
        newBadge.textContent = "1";
        userDiv.querySelector(".userInfo").appendChild(newBadge);
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await initializeChat();
});

async function initializeChat() {
  await getUsernameFromEmail();
  await getSellerUsernameFromUserID();
  await loadChatUsers();

  // **Fix: Ensure chatSection exists before modifying it**
  const chatSection = document.getElementById("chatList");
  if (chatSection) {
    chatSection.style.display = "none"; // Hide chat section on load
  }

  // Handle double-click on chat users
  document.querySelectorAll(".chatUser").forEach((chatUser) => {
    chatUser.addEventListener("dblclick", function () {
      let username = this.dataset.username;
      deleteChatUser(username, this);
    });
  });

  // Use event delegation to detect double-click on messages
  document
    .getElementById("chatList")
    .addEventListener("dblclick", function (event) {
      // Ensure the double-click happened on the senderChat or receiverChat
      if (
        event.target.classList.contains("senderChat") ||
        event.target.classList.contains("receiverChat")
      ) {
        let messageElement = event.target; // The actual <p> element containing text
        let messageText = messageElement.innerText.trim();
        let parentDiv = messageElement.closest("div"); // Get the full message container

        console.log(`Deleting message: "${messageText}"`);

        if (messageText) {
          deleteMessage(messageText, parentDiv);
        } else {
          console.error("Error: Message text is empty.");
        }
      } else {
        console.warn("Double-click detected, but not on a message.");
      }
    });

  // Remove previous event listener (if any) and add a fresh one
  const sendButton = document.querySelector(".sendBtn");
  sendButton.removeEventListener("click", sendMessage); // Prevent multiple bindings
  sendButton.addEventListener("click", sendMessage);

  // Prevent multiple event listeners for "Enter" key
  const messageInput = document.getElementById("messageInput");
  messageInput.removeEventListener("keypress", handleKeyPress);
  messageInput.addEventListener("keypress", handleKeyPress);
}

function handleKeyPress(event) {
  if (event.key === "Enter") sendMessage();
}
