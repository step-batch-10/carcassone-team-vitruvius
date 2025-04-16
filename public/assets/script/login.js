const addUser = async(e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  await fetch("/login", { method: "POST", body: formData });
  e.target.reset();
}

const main = () => {
  const date = document.querySelector("#dob");
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 14);
  date.max = maxDate.toISOString().split("T")[0];

  const form = document.querySelector("form");
  form.addEventListener("submit", addUser)
}


globalThis.onload = main