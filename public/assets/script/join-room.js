import API from "./api.js";

const getJoinRoomId = () => {
  const formData = new FormData();
  const boxes = document.querySelectorAll(".join-box");
  const roomID = Array.from(boxes)
    .map((input) => input.value)
    .join("");

  formData.append("roomID", roomID);
  return formData;
};

const sendLobbyRequest = async () => {
  const formData = getJoinRoomId();

  return await API.joinRoom(formData);
};

const createAlertDiv = () => {
  const alertDiv = document.createElement("div");

  alertDiv.classList.add("custom-alert");
  alertDiv.textContent = "Please Enter Valid Room ID";
  document.body.append(alertDiv);

  return alertDiv;
};

const joinRoom = async (event) => {
  event.preventDefault();

  const { isRoomJoined } = await sendLobbyRequest();

  if (!isRoomJoined) {
    const alertDiv = createAlertDiv();

    setTimeout(() => alertDiv.remove(), 2000);

    return;
  }

  globalThis.location = (await API.lobby()).url;
};

const focusNext = (input, inputs, index) => {
  return () => {
    const containsDigit = input.value.length === 1;
    const nextInput = inputs[index + 1];

    if (containsDigit && Boolean(nextInput)) {
      nextInput.focus();
      return;
    }

    if (!nextInput) {
      const join = document.querySelector("#join-button");
      join.focus();
    }
  };
};

const focusPrevious = (input, inputs, index) => {
  return (e) => {
    const containsDigit = input.value.length === 1;
    const previousInput = inputs[index - 1];
    if (!containsDigit && Boolean(previousInput) && e.key === "Backspace") {
      previousInput.focus();
    }
  };
};

const main = () => {
  const form = document.getElementById("roomJoiningForm");
  const inputs = document.querySelectorAll("input");
  const join = document.querySelector("#join-button");

  inputs.forEach((input, index) => {
    input.addEventListener("input", focusNext(input, inputs, index));
    input.addEventListener("keydown", focusPrevious(input, inputs, index));
    join.addEventListener("keydown", (e) => {
      if (e.key === "Backspace") {
        inputs[5].focus();
      }
    });
  });

  form.addEventListener("submit", joinRoom);
};
globalThis.onload = main;
