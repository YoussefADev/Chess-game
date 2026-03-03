# ♟️ Chess Web App

A simple chess game built with **JavaScript** that runs directly in the browser.
The project focuses on implementing the full chess rules engine and a clean UI for playing locally.

## Features

* Full chess rules implementation
* Legal move validation
* Check and checkmate detection
* Draw detection
* Castling
* En passant
* Pawn promotion
* Board flip for local play
* Play on the same device

## Project Structure

```
## Project Structure

```
chess-game
│
├── chess.html
├── style.css
│
├── assets/
│   └── pieces/        # SVG chess pieces
│
└── src/
    ├── logic/         # game rules and engine
    │   ├── GameEngine.js
    │   ├── board.js
    │   └── pieces.js
    │
    ├── ui/
    │   └── UIManager.js
    │
    └── MainLogic.js   # connects UI with engine
```

```

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/your-username/chess-project.git
cd chess-project
```

### 2. Run the project

You can open the game directly:

```
open index.html
```

or simply double-click **index.html**.

The game will run in your browser.


## Future Improvements

* Chess AI
* Online multiplayer
* Move history
* Stockfish integration
* Better animations
* Mobile UI improvements

## License

MIT License

