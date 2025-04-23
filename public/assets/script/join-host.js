import API from "./api.js";

function main() {
  const joinBtn = document.getElementById("join-btn");
  joinBtn.addEventListener("click", async () => {
    const res = await API.joinPage();

    document.location.href = res.url;
  });
}

globalThis.addEventListener("DOMContentLoaded", main);
