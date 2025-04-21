## Routes

| Route                   | Request Method | Status Code | Request Description                  | Response Type      | Response Description                    |
| ----------------------- | -------------- | ----------- | ------------------------------------ | ------------------ | --------------------------------------- |
| `/game-options`         | GET            | 200         | Serves game options HTML             | `text/html`        | Returns the game-options page           |
| `/game/`                | GET            | 200         | Serves main game page HTML           | `text/html`        | Returns the game page                   |
| `/game/board`           | GET            | 200         | Get current game board state         | `GameBoard`        | Returns the board layout                |
| `/game/draw-tile`       | GET            | 200         | Draw a new tile from the stack       | `Tile`             | Returns the drawn tile                  |
| `/game/valid-positions` | GET            | 200         | Get valid positions for current tile | `Position[]`       | Returns list of valid placement options |
| `/lobby`                | GET            | 200         | Serves the lobby HTML page           | `text/html`        | Returns the lobby page                  |
| `/login`                | POST           | 200         | Logs in or registers a player        | `LoginResponse`    | Contains session/user data              |
| `/host`                 | POST           | 201         | Hosts a new game room                | `RoomCreated`      | Returns room ID and host info           |
| `/room`                 | GET            | 200         | Retrieves current room/lobby details | `RoomDetails`      | Returns list of players and room state  |
| `/joinRoom`             | POST           | 200         | Join an existing game room           | `JoinRoomResponse` | Confirms player has joined the room     |
| `/*` (static fallback)  | ANY            | 200/404     | Serves static files from `public/`   | `text/html`        | Returns file or 404 if not found        |
