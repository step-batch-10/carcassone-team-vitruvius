const joinRoom = async (event) => {
  event.preventDefault();

  const formData = new FormData();
  const boxes = document.querySelectorAll(".join-box");
  const roomID = Array.from(boxes)
    .map((input) => input.value)
    .join("");

  formData.append("roomID", roomID);

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
