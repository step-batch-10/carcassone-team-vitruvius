import API from "./api.js";

const addUser = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const res = await API.login(formData);
  event.target.reset();

  globalThis.location = res.url;
};

const main = () => {
  const form = document.querySelector("form");
  form.addEventListener("submit", addUser);
};

globalThis.onload = main;
