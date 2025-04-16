const addUser = async(e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await fetch("/login", { method: "POST", body: formData });
  e.target.reset();
}

const main = () => {
  const form = document.querySelector("form");
  form.addEventListener("submit", addUser)
}


globalThis.onload = main