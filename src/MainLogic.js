const lobby = document.getElementById("lobby")
const game = document.getElementById("game")
const chessBoardElement = document.getElementById("chessBoard")

let UiManager = new UIManager()
let gameEngine = new GameEngine(new Board())

document.getElementById("human-btn").addEventListener("click", () => startGame("human"))
document.getElementById("bot-btn").addEventListener("click", () => startGame("bot"))

function startGame(mode) {
    lobby.style.display = "none"
    game.style.display = "grid"
    gameEngine = new GameEngine(new Board(), mode)
    UiManager.init(chessBoardElement, gameEngine)
}

// function renderBoard() {
//     for (let row = 0; row < 8; row++) {
//         for (let col = 0; col < 8; col++) {
//             const square = chessBoardElement.querySelector(`[data-row='${row}'][data-col='${col}']`)
//             const piece = gameEngine.board.getPiece(row, col)
//             square.innerHTML = piece ? `<img src="${piece.icon}" />` : ""
//             square.classList.remove("highlight")
//         }
//     }
//     if (UiManager.selected) {
//         for (let [r, c] of UiManager.validMoves) {
//             chessBoardElement.querySelector(`[data-row='${r}'][data-col='${c}']`).classList.add("highlight")
//         }
//     }
// }

chessBoardElement.addEventListener("click", e => {
    const square = e.target.closest(".square")
    if (!square) return

    const row = Number(square.dataset.row)
    const col = Number(square.dataset.col)
    const clickedPiece = gameEngine.board.getPiece(row, col)

    if (UiManager.selected) {
        const [fromRow, fromCol] = UiManager.selected
        if (UiManager.isValidMove(row, col)) {
            gameEngine.movePiece(fromRow, fromCol, row, col)
            UiManager.clearSelection()
            UiManager.renderBoard()
            UiManager.flipBoard()
            const state = gameEngine.evaluateGameState()
            if (state === "checkmate") alert(`${gameEngine.turnToPlay} loses!`)
            if (state === "stalemate") alert("Draw by stalemate!")
            if (gameEngine.mode === "bot") aiMove()
            return
        } else {
            UiManager.clearSelection()
        }
    }

    if (clickedPiece && clickedPiece.color === gameEngine.turnToPlay) {
        UiManager.selectSquare(row, col)
        UiManager.renderBoard()
    }
})

function aiMove() {
    // Placeholder for bot logic, soon
    const moves = []
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameEngine.board.getPiece(row, col)
            if (piece && piece.color === gameEngine.turnToPlay) {
                const validMoves = UiManager.calculateValidMoves(piece, row, col, gameEngine)
                validMoves.forEach(move => moves.push({ from: [row, col], to: move }))
            }
        }
    }
    if (moves.length === 0) return
    const choice = moves[Math.floor(Math.random() * moves.length)]
    gameEngine.movePiece(choice.from[0], choice.from[1], choice.to[0], choice.to[1])
    UiManager.renderBoard()
}