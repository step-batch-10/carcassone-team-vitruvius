function main() {
  const joinBtn = document.getElementById("join-btn");
  joinBtn.addEventListener(
    "click",
    () => (document.location = fetch("join-game.html"))
  );
}

globalThis.addEventListener("DOMContentLoaded", main);
