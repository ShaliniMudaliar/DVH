window.onload = function () {
  const userName = localStorage.getItem("username");
  if (userName) {
    // Update the greeting message with the user's name
    document.getElementById(
      "greetingMessage"
    ).textContent = `Hi, ${userName}! Nice to meet you.`;
  } else {
    // Fallback in case the name is not stored
    document.getElementById("greetingMessage").textContent =
      "Hi! Nice to meet you.";
  }

  // When the user clicks "I have a question"
  document.getElementById("askQuestionBtn").onclick = function () {
    addChatMessage("sender", "I have a question");
    setTimeout(() => {
      document.getElementById("questionSection").style.display = "block"; // Show questions
      addChatMessage(
        "receiver",
        "Here are some common questions I can answer 👇"
      );
    }, 500);
  };

  // When the user clicks "No questions"
  document.getElementById("noQuestionsBtn").onclick = function () {
    addChatMessage("sender", "No questions");
    setTimeout(() => {
      addChatMessage("receiver", "Okay, feel free to ask anytime!");
    }, 500);
  };
};

// Function to add chat messages to the chat list
function addChatMessage(senderType, message) {
  const chatList = document.getElementById("chatList");
  const chatBubble = document.createElement("div");
  chatBubble.classList.add(senderType);

  if (senderType === "sender") {
    // For sender: Text first, then image
    const chatContent = document.createElement("p");
    chatContent.classList.add(senderType + "Chat");
    chatContent.textContent = message;
    chatBubble.appendChild(chatContent);

    // Add the sender image after the text
    const icon = document.createElement("a");
    icon.href = "#";
    icon.classList.add("chatIcon");

    const img = document.createElement("img");
    img.src = "https://cdn-icons-png.flaticon.com/128/3033/3033143.png"; // sender image
    img.height = 45;

    icon.appendChild(img);
    chatBubble.appendChild(icon);
  } else if (senderType === "receiver") {
    // For receiver (bot): Image first, then text
    const icon = document.createElement("a");
    icon.href = "#";
    icon.classList.add("chatIcon");

    const img = document.createElement("img");
    img.src =
      "https://cdn-icons-png.freepik.com/512/13330/13330183.png?ga=GA1.1.738280883.1724324506"; // bot image
    img.height = 45;

    icon.appendChild(img);
    chatBubble.appendChild(icon);

    // Add the receiver text after the image
    const chatContent = document.createElement("p");
    chatContent.classList.add(senderType + "Chat");
    chatContent.textContent = message;
    chatBubble.appendChild(chatContent);
  }

  chatList.appendChild(chatBubble);
  chatList.scrollTop = chatList.scrollHeight; // Keep chat scrolled to the bottom
}

// Fetch questions from the backend API
fetch("http://localhost:3005/api/getQuestions")
  .then((response) => response.json())
  .then((questions) => {
    const questionsList = document.getElementById("questionsList");

    questions.forEach((question) => {
      const questionElement = document.createElement("p");
      questionElement.classList.add("question");
      questionElement.textContent = question.question;
      questionElement.addEventListener("click", () => {
        // Show the answer when the question is clicked
        addChatMessage("sender", question.question); // Sender's question
        setTimeout(() => {
          addChatMessage("receiver", question.answer); // Receiver's answer
        }, 500);
      });

      questionsList.appendChild(questionElement);
    });
  })
  .catch((error) => console.error("Error fetching questions:", error));

// Show the questions section when the user asks a question
document.getElementById("askQuestionBtn").addEventListener("click", () => {
  document.getElementById("questionSection").style.display = "block";
});
