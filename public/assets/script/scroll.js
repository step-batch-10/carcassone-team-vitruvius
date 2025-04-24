const atTopEdge = () => globalThis.scrollY <= 0;
const atLeftEdge = () => globalThis.scrollX <= 0;

const atBottomEdge = () =>
  globalThis.scrollY + globalThis.innerHeight >= document.body.scrollHeight;

const atRightEdge = () =>
  globalThis.scrollX + globalThis.innerWidth >= document.body.scrollWidth;

const removeAlert = () => alertDiv.remove();

const createAlert = (content) => {
  const alertDiv = document.createElement("div");
  alertDiv.classList.add("custom-alert");
  alertDiv.textContent = content;
  return alertDiv;
};

const alertOnBoardEdge = (content) => {
  createAlert(content);
  document.body.append(alertDiv);
  setTimeout(removeAlert, 1000);
};

const scroll = ({ predicate, direction, chord }) => {
  const node = document.querySelector(`#${direction}-navigator`);

  node.addEventListener("click", () => {
    if (!predicate()) {
      globalThis.scrollBy({
        ...chord,
        behavior: "smooth",
      });
    } else {
      alertOnBoardEdge(`You are already in the ${direction} edge`);
    }
  });
};

const addScrollFeatures = () => {
  const directions = [
    {
      predicate: atRightEdge,
      direction: "right",
      chord: { left: 450 },
    },
    {
      predicate: atLeftEdge,
      direction: "left",
      chord: { left: -450 },
    },
    {
      predicate: atTopEdge,
      direction: "top",
      chord: { top: -450 },
    },
    {
      predicate: atBottomEdge,
      direction: "bottom",
      chord: { top: 450 },
    },
  ];

  directions.forEach(scroll);
};

export default addScrollFeatures;
