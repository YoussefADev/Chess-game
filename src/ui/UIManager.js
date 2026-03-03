class UIManager {
    selected = null
    validMoves = []

    constructor() {
        this.PIECE_ICONS = {
            white: {
                king:   "assets/pieces/white/wK.svg",
                rook:   "assets/pieces/white/wR.svg",
                bishop: "assets/pieces/white/wB.svg",
                knight: "assets/pieces/white/wN.svg",
                queen:  "assets/pieces/white/wQ.svg",
                pawn:   "assets/pieces/white/wP.svg",
            },
            black: {
                king:   "assets/pieces/black/bK.svg",
                queen:  "assets/pieces/black/bQ.svg",
                rook:   "assets/pieces/black/bR.svg",
                bishop: "assets/pieces/black/bB.svg",
                knight: "assets/pieces/black/bN.svg",
                pawn:   "assets/pieces/black/bP.svg",
            }
        }
    }

    init(boardElement, gameEngine) {
        this.boardElement = boardElement
        this.gameEngine = gameEngine
        this.createChessboard()
        this.renderBoard()
    }

    createChessboard() {
        this.boardElement.innerHTML = ""
        this.boardElement.style.display = "grid"
        this.boardElement.style.gridTemplateColumns = "repeat(8, 60px)"
        this.boardElement.style.gridTemplateRows = "repeat(8, 60px)"
        this.boardElement.style.width = "480px"
        this.boardElement.style.height = "480px"
        this.boardElement.style.border = "2px solid black"

        for (let i = 0; i < 64; i++) {
            const square = document.createElement("div")
            square.classList.add("square")
            const row = Math.floor(i / 8)
            const col = i % 8
            square.dataset.row = row
            square.dataset.col = col
            square.classList.add((row + col) % 2 === 0 ? "light" : "dark")
            square.style.width = "60px"
            square.style.height = "60px"
            this.boardElement.appendChild(square)
        }
    }

    getElementSquare(row, col) {
        return this.boardElement.querySelector(`.square[data-row='${row}'][data-col='${col}']`)
    }

    selectSquare(row, col) {
        this.selected = [row, col]
        const piece = this.gameEngine.board.getPiece(row, col)
        this.validMoves = this.gameEngine.calculateValidMoves(piece, row, col)
        this.highlightValidMoves()
    }

    clearSelection() {
        this.selected = null
        this.validMoves = []
        this.highlightValidMoves()
    }

    highlightValidMoves() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                this.getElementSquare(row, col).classList.remove("highlight")
            }
        }
        for (let [r, c] of this.validMoves) {
            this.getElementSquare(r, c).classList.add("highlight")
        }
    }


    isValidMove(row, col) {
        return this.validMoves.some(moves => moves[0] == row && moves[1] == col)
    }

    renderBoard() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = this.getElementSquare(row, col)
                const piece = this.gameEngine.board.getPiece(row, col)
                square.innerHTML = piece ? `<img src="${this.PIECE_ICONS[piece.color][piece.type]}" />` : ""
            }
        }
        this.highlightValidMoves()
    }

    flipBoard() {
        document.getElementById("chessBoard").classList.toggle("flipped")
    }
}