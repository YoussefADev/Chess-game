class Board {
    constructor() {
        this.grid = Array.from({ length: 8 }, () => Array(8).fill(null))
    }

    Init() {
        const backRank = [ "rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook" ]
        for (let col = 0; col < 8; col++) {
            const typeWhite = backRank[col]
            const typeBlack = backRank[col]
            this.grid[7][col] = this.createPiece(typeWhite, "white")
            this.grid[0][col] = this.createPiece(typeBlack, "black")
            this.grid[6][col] = this.createPiece("pawn", "white")
            this.grid[1][col] = this.createPiece("pawn", "black")
        }
    }

    createPiece(type, color) {
        switch(type) {
            case "pawn": return new Pawn(color)
            case "rook": return new Rook(color)
            case "knight": return new Knight(color)
            case "bishop": return new Bishop(color)
            case "queen": return new Queen(color)
            case "king": return new King(color)
            default: return null
        }
    }

    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null
        return this.grid[row][col]
    }

    setPiece(row, col, piece) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return
        this.grid[row][col] = piece
    }

    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const p = this.grid[row][col]
                if (p && p.type === "king" && p.color === color) return { row, col }
            }
        }
        return null
    }
}