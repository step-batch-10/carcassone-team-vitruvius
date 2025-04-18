const joinRoom = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const response = await fetch("/joinRoom", {
    method: "POST",
    body: formData,
  });

  const { isRoomJoined } = await response.json();

  if (!isRoomJoined) {
    alert("invalid room Id");
    return;
  }

  globalThis.location = (await fetch("/lobby")).url;
};

const main = () => {
  const form = document.getElementById("roomJoiningForm");
  form.addEventListener("submit", joinRoom);
};
globalThis.onload = main;
