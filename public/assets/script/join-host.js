function main() {
  const joinBtn = document.getElementById("join-btn");
  joinBtn.addEventListener("click", async () => {
    const res = await fetch("html/join-game.html");

    document.location.href = res.url;
  });
}

globalThis.addEventListener("DOMContentLoaded", main);
