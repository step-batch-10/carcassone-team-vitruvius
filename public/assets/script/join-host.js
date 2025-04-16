const hostRequest = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  console.log(formData.get("noOfPlayers"));
};

function main() {
  const form = document.querySelector("form");
  form.addEventListener("submit", hostRequest);
}

globalThis.addEventListener("DOMContentLoaded", main);
