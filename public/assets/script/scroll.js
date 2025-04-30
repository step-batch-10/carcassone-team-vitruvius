const atTopEdge = () => globalThis.scrollY <= 0;
const atLeftEdge = () => globalThis.scrollX <= 0;

const atBottomEdge = () =>
  globalThis.scrollY + globalThis.innerHeight >= document.body.scrollHeight;

const atRightEdge = () =>
  globalThis.scrollX + globalThis.innerWidth >= document.body.scrollWidth;

const removeAlert = (alertPopUp) => alertPopUp.remove();

const createPopUp = (content) => {
  const popUp = document.createElement("div");

  popUp.classList.add("custom-alert");
  popUp.textContent = content;

  return popUp;
};

const showPopUpOnBoardEdge = (content) => {
  const popUp = createPopUp(content);
  document.body.append(popUp);

  setTimeout(() => removeAlert(popUp), 1000);
};

const createScrollEvent =
  ({ predicate, direction, chord }) =>
  () => {
    if (!predicate()) {
      return globalThis.scrollBy({ ...chord, behavior: "smooth" });
    }

    showPopUpOnBoardEdge(`You are already in the ${direction} edge`);
  };

const addScrollEvents = (scrollEventHandlers, navigators) => {
  navigators.forEach((navigator, index) => {
    navigator.addEventListener("click", scrollEventHandlers.at(index));
  });
};

const mapScrollEventsWithArrowKeys = (scrollEventHandlers, arrowKeys) => {
  document.addEventListener("keydown", (event) => {
    event.preventDefault();

    arrowKeys.forEach((arrowKey, index) => {
      if (event.key === arrowKey) scrollEventHandlers.at(index)();
    });
  });
};

const capitalize = (text) => text.at(0).toUpperCase().concat(text.slice(1));

const addScrollFeatures = () => {
  const scrollDirections = [
    {
      predicate: atRightEdge,
      direction: "right",
      arrowKey: "right",
      chord: { left: 450 },
    },
    {
      predicate: atLeftEdge,
      direction: "left",
      arrowKey: "left",
      chord: { left: -450 },
    },
    {
      predicate: atTopEdge,
      direction: "top",
      arrowKey: "up",
      chord: { top: -450 },
    },
    {
      predicate: atBottomEdge,
      direction: "bottom",
      arrowKey: "down",
      chord: { top: 450 },
    },
  ];

  const scrollEventHandlers = scrollDirections.map(createScrollEvent);
  const navigators = scrollDirections.map(({ direction }) =>
    document.querySelector(`#${direction}-navigator`)
  );
  const arrowKeys = scrollDirections.map(({ arrowKey }) =>
    "Arrow".concat(capitalize(arrowKey.toLowerCase()))
  );

  addScrollEvents(scrollEventHandlers, navigators);
  mapScrollEventsWithArrowKeys(scrollEventHandlers, arrowKeys);
};

export default addScrollFeatures;
