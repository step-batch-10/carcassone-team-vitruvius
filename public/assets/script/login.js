const addUser = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch("/login", { method: "POST", body: formData });
  e.target.reset();

  globalThis.location = res.url;
};

const main = () => {
  const form = document.querySelector("form");
  form.addEventListener("submit", addUser);
};

globalThis.onload = main;
