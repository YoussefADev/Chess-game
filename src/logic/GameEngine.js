class GameEngine {
    board
    turnToPlay = "white"
    mode
    points = { white: 0, black: 0 }
    moveHistory = []
    redoStack = []
    kingPositions = { white: null, black: null }
    castlingRights = {
        white: { short: true, long: true },
        black: { short: true, long: true }
    }
    enPassantTarget = null

    constructor(board, mode) {
        this.board = board
        this.mode = mode
        this.startGame()
    }

    startGame() {
        this.board.Init()
        this.kingPositions.white = this.board.findKing("white")
        this.kingPositions.black = this.board.findKing("black")
    }

    isSquareAttacked(row, col, byColor) {
        const isInside = (r, c) => r >= 0 && r <= 7 && c >= 0 && c <= 7
        const pawnDir = byColor === "white" ? 1 : -1
        const pawnLeft = [row + pawnDir, col - 1]
        const pawnRight = [row + pawnDir, col + 1]

        for (let [r, c] of [pawnLeft, pawnRight]) {
            if (isInside(r, c)) {
                const p = this.board.getPiece(r, c)
                if (p && p.color === byColor && p.type === "pawn") return true
            }
        }

        const knightOffsets = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ]
        for (let [dr, dc] of knightOffsets) {
            const r = row + dr, c = col + dc
            if (!isInside(r, c)) continue
            const p = this.board.getPiece(r, c)
            if (p && p.color === byColor && p.type === "knight") return true
        }

        const rookDirs = [[1,0],[-1,0],[0,1],[0,-1]]
        for (let [dr, dc] of rookDirs) {
            let r = row + dr, c = col + dc
            while (isInside(r, c)) {
                const p = this.board.getPiece(r, c)
                if (p) {
                    if (p.color === byColor && (p.type === "rook" || p.type === "queen")) return true
                    break
                }
                r += dr; c += dc
            }
        }

        const bishopDirs = [[1,1],[1,-1],[-1,1],[-1,-1]]
        for (let [dr, dc] of bishopDirs) {
            let r = row + dr, c = col + dc
            while (isInside(r, c)) {
                const p = this.board.getPiece(r, c)
                if (p) {
                    if (p.color === byColor && (p.type === "bishop" || p.type === "queen")) return true
                    break
                }
                r += dr; c += dc
            }
        }

        const kingOffsets = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]
        for (let [dr, dc] of kingOffsets) {
            const r = row + dr, c = col + dc
            if (!isInside(r, c)) continue
            const p = this.board.getPiece(r, c)
            if (p && p.color === byColor && p.type === "king") return true
        }

        return false
    }

    movePiece(fromRow, fromCol, toRow, toCol, isSimulation = false) {
        const piece = this.board.getPiece(fromRow, fromCol)
        if (!piece || piece.color !== this.turnToPlay) return false

        let captured = this.board.getPiece(toRow, toCol)
        const move = {
            fromRow, fromCol, toRow, toCol,
            piece,
            captured,
            pieceIsMoved: piece.isMoved ?? null,
            prevCastlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
            prevEnPassant: this.enPassantTarget ? { ...this.enPassantTarget } : null,
            wasCastling: false,
            wasEnPassant: false,
            promotion: null,
            rookMove: null
        }

        if (piece.type === "pawn" && this.enPassantTarget) {
            const ep = this.enPassantTarget
            if (toRow === ep.targetRow && toCol === ep.targetCol && piece.color !== ep.color) {
                captured = this.board.getPiece(ep.pawnRow, ep.pawnCol)
                move.captured = captured
                move.wasEnPassant = true
                this.board.setPiece(ep.pawnRow, ep.pawnCol, null)
            }
        }

        if (captured) this.points[piece.color] += captured.points

        if (piece.type === "king" && Math.abs(toCol - fromCol) === 2) {
            move.wasCastling = true
            if (toCol === 6) {
                const rook = this.board.getPiece(fromRow, 7)
                this.board.setPiece(fromRow, 5, rook)
                this.board.setPiece(fromRow, 7, null)
                move.rookMove = { fromRow, fromCol: 7, toRow: fromRow, toCol: 5, rook }
            }
            if (toCol === 2) {
                const rook = this.board.getPiece(fromRow, 0)
                this.board.setPiece(fromRow, 3, rook)
                this.board.setPiece(fromRow, 0, null)
                move.rookMove = { fromRow, fromCol: 0, toRow: fromRow, toCol: 3, rook }
            }
        }

        this.board.setPiece(toRow, toCol, piece)
        this.board.setPiece(fromRow, fromCol, null)
        if (piece.isMoved !== undefined) piece.isMoved = true

        if (piece.type === "king") {
            this.kingPositions[piece.color] = { row: toRow, col: toCol }
            this.castlingRights[piece.color] = { short: false, long: false }
        }

        if (piece.type === "rook") {
            if (fromCol === 0) this.castlingRights[piece.color].long = false
            if (fromCol === 7) this.castlingRights[piece.color].short = false
        }

        if (piece.type === "pawn") {
            if (Math.abs(toRow - fromRow) === 2) {
                this.enPassantTarget = {
                    pawnRow: toRow,
                    pawnCol: toCol,
                    targetRow: (fromRow + toRow) / 2,
                    targetCol: toCol,
                    color: piece.color
                }
            } else {
                this.enPassantTarget = null
            }
            
            const lastRow = piece.color === "white" ? 0 : 7
            if (toRow === lastRow && !isSimulation) {
                this.board.setPiece(fromRow, fromCol, null)
                this.promotePawn(toRow, toCol, piece.color)
            }
        }

        this.moveHistory.push(move)
        this.redoStack = []
        this.turnToPlay = this.turnToPlay === "white" ? "black" : "white"
        return true
    }

    promotePawn(row, col, color) {
        const choice = prompt("Choose promotion: Q, R, B, N").toUpperCase();
        let newPiece;
        switch(choice) {
            case "R": newPiece = new Rook(color); break;
            case "B": newPiece = new Bishop(color); break;
            case "N": newPiece = new Knight(color); break;
            default: newPiece = new Queen(color);
        }
        this.board.setPiece(row, col, newPiece);
    }

    undoMove() {
        if (!this.moveHistory.length) return
        const move = this.moveHistory.pop()

        const {
            fromRow, fromCol, toRow, toCol,
            piece, captured,
            pieceIsMoved,
            prevCastlingRights,
            prevEnPassant,
            wasCastling,
            wasEnPassant,
            rookMove
        } = move

        this.board.setPiece(fromRow, fromCol, piece)
        this.board.setPiece(toRow, toCol, null)

        if (wasEnPassant) {
            this.board.setPiece(
                prevEnPassant.pawnRow,
                prevEnPassant.pawnCol,
                captured
            )
        } else if (captured) {
            this.board.setPiece(toRow, toCol, captured)
        }

        if (pieceIsMoved !== null) piece.isMoved = pieceIsMoved

        if (wasCastling && rookMove) {
            this.board.setPiece(rookMove.fromRow, rookMove.fromCol, rookMove.rook)
            this.board.setPiece(rookMove.toRow, rookMove.toCol, null)
        }

        if (piece.type === "king")
            this.kingPositions[piece.color] = { row: fromRow, col: fromCol }

        this.castlingRights = prevCastlingRights
        this.enPassantTarget = prevEnPassant

        this.turnToPlay = piece.color
        this.redoStack.push(move)
    }

    redoMove() {
        if (!this.redoStack.length) return
        const move = this.redoStack.pop()
        this.movePiece(move.fromRow, move.fromCol, move.toRow, move.toCol)
    }

    calculateValidMoves(piece, row, col) {
        if (!piece) return []
        const moves = piece.generateMoves(row, col, this.board)

        const legalMoves = []

        if (piece.type === "pawn" && this.enPassantTarget) {
            const ep = this.enPassantTarget
            const dir = piece.color === "white" ? -1 : 1
            if (ep.color !== piece.color &&
                row + dir === ep.targetRow &&
                (col - 1 === ep.targetCol || col + 1 === ep.targetCol)) {
                moves.push([ep.targetRow, ep.targetCol])
            }
        }

        for (let [r, c] of moves) {
            if (r < 0 || r > 7 || c < 0 || c > 7) continue
            const captured = this.board.getPiece(r, c)
            if (captured && captured.color === piece.color) continue

            this.movePiece(row, col, r, c, true)
            const kingPos = this.kingPositions[piece.color]
            const inCheck = this.isSquareAttacked(
                kingPos.row, kingPos.col,
                piece.color === "white" ? "black" : "white"
            )
            this.undoMove()

            if (!inCheck) legalMoves.push([r, c])
        }

        if (piece.type === "king") {
            const dir = [[2, "short"], [-2, "long"]]
            for (const [offset, side] of dir) {
                if (!this.castlingRights[piece.color][side]) continue

                const pathClear = this.isCastlingPathClear(row, col, offset)
                const safePath = this.isCastlingPathSafe(row, col, offset, piece.color)
                if (pathClear && safePath) legalMoves.push([row, col + offset])
            }
        }
        
        return legalMoves
    }


    isCastlingPathClear(row, col, offset) {
        const step = offset > 0 ? 1 : -1
        const endCol = col + offset
        for (let c = col + step; c !== endCol; c += step) {
            if (this.board.getPiece(row, c)) return false
        }
        return true
    }

    isCastlingPathSafe(row, col, offset, color) {
        const step = offset > 0 ? 1 : -1
        for (let c = col; c !== col + offset + step; c += step) {
            if (this.isSquareAttacked(row, c, color === "white" ? "black" : "white")) return false
        }
        return true
    }

    calculateAllLegalMoves(color) {
        const moves = []
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPiece(row, col)
                if (!piece || piece.color !== color) continue
                const legal = this.calculateValidMoves(piece, row, col)
                for (const move of legal) {
                    moves.push({ piece, from: [row, col], to: move })
                }
            }
        }
        return moves
    }

    evaluateGameState() {
        const color = this.turnToPlay
        const opponent = color === "white" ? "black" : "white"
        const kingPos = this.kingPositions[color]
        const inCheck = this.isSquareAttacked(kingPos.row, kingPos.col, opponent)
        const legalMoves = this.calculateAllLegalMoves(color)
        if (inCheck && legalMoves.length === 0) return "checkmate"
        if (!inCheck && legalMoves.length === 0) return "stalemate"
        return "playing"
    }
}