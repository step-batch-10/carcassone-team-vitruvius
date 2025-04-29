import API from "./api.js";

const closeRuleBook = () => {
  const rulesContainer = document.getElementById("rules-container");
  rulesContainer.innerHTML = "";
  rulesContainer.classList.remove("bg-blur");
  rulesContainer.style.zIndex = "-1";
  rulesContainer.style.pointerEvents = "none";

  const form = document.querySelectorAll(".form-container")[0];
  form.classList.remove("background");
};

const addEventListnerToCloseBtn = (rulesDiv) => {
  const btn = rulesDiv.querySelector("#close-btn");
  console.log("btn");

  btn.addEventListener("click", closeRuleBook);
};

const main = () => {
  const joinBtn = document.getElementById("join-btn");
  joinBtn.addEventListener("click", async () => {
    const res = await API.joinPage();

    document.location.href = res.url;
  });
  const rules = document.getElementById("rules");

  rules.addEventListener("click", () => {
    const rulesContainer = document.querySelectorAll("#rules-container")[0];
    rulesContainer.classList.add("bg-blur");
    rulesContainer.style.zIndex = "2";
    rulesContainer.style.pointerEvents = "auto";
    const form = document.querySelectorAll(".form-container")[0];
    form.classList.add("background");

    const rulesDiv = document.createElement("div");
    rulesContainer.appendChild(rulesDiv);

    rulesDiv.classList.add("custom-alert");
    rulesDiv.setAttribute("id", "description");
    rulesDiv.innerHTML = `
    <button id="close-btn">X</button>
        <h2>🎯 Goal:</h2>
        <p>Score the most points by completing <strong>cities</strong>, <strong>roads</strong>, <strong>monasteries</strong>, and <strong>fields</strong>.</p>

        <h2>▶️ On Your Turn:</h2>
        <ol>
          <li><strong>Place a Tile:</strong>
              You will receive a tile.
              <div class="note">🔄 You can rotate the tile before placing it to fit the board better!</div>
              Place it adjacent to existing tiles by matching roads, cities, and fields.
          </li>
          <li><strong>Place a Meeple (Optional):</strong>
              After placing the tile, you can place one of your meeples on an unoccupied feature.
          </li>
          <li><strong>Score Points:</strong>
              If you complete a feature (road, city, monastery), score immediately and retrieve your meeples.
          </li>
        </ol>

        <div class="note">⚡ Remember: You can only claim a feature if no other meeple is already there!</div>

        <h2>🏰 Scoring:</h2>
        <h3>During the Game:</h3>
        <ul>
          <li>Road: 1 point per tile</li>
          <li>City: 2 points per tile + 2 points per pennant</li>
          <li>Monastery: 9 points when surrounded</li>
        </ul>

        <h3>At Game End:</h3>
        <ul>
          <li>Incomplete Road: 1 point per tile</li>
          <li>Incomplete City: 1 point per tile + 1 per pennant</li>
          <li>Incomplete Monastery: 1 point per adjacent tile</li>
          <li>Fields (Farms): 3 points per completed city</li>
        </ul>

        <div class="note">🔥 Shared features? All tied players score full points!</div>

        <h2>🏆 Winning:</h2>
        <p>The player with the highest score wins!</p>
        `;
    addEventListnerToCloseBtn(rulesDiv);
  });
};

globalThis.addEventListener("DOMContentLoaded", main);
