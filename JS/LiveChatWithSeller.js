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
