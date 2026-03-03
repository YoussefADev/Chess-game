class Piece {
    color;
    points;

    constructor(color, points = 0) {
        this.color = color;
        this.points = points;
    }

    isInside(row, col) {
        return row >= 0 && row <= 7 && col >= 0 && col <= 7;
    }

    generateMoves(row, col) {
        return [];
    }
}

class Pawn extends Piece {
    type = "pawn";
    isMoved = false;

    constructor(color) {
        super(color, 1);
    }

    generateMoves(row, col, board) {
        const moves = [];
        const dir = this.color === "white" ? -1 : 1;

        if (this.isInside(row + dir, col) && !board.getPiece(row + dir, col)) {
            moves.push([row + dir, col]);

            if (
                !this.isMoved &&
                this.isInside(row + 2 * dir, col) &&
                !board.getPiece(row + 2 * dir, col)
            ) {
                moves.push([row + 2 * dir, col]);
            }
        }

        const attacks = [
            [row + dir, col - 1],
            [row + dir, col + 1]
        ];

        for (const [r, c] of attacks) {
            if (!this.isInside(r, c)) continue;
            const target = board.getPiece(r, c);
            if (target && target.color !== this.color) {
                moves.push([r, c]);
            }
        }

        return moves;
    }
}

class Bishop extends Piece {
    type = "bishop";

    constructor(color) {
        super(color, 3);
    }

    generateMoves(row, col, board) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 1],
            [1, -1], [1, 1]
        ];

        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;

            while (this.isInside(r, c)) {
                const target = board.getPiece(r, c);

                if (!target) {
                    moves.push([r, c]);
                } else {
                    if (target.color !== this.color) {
                        moves.push([r, c]);
                    }
                    break;
                }

                r += dr;
                c += dc;
            }
        }

        return moves;
    }
}

class Knight extends Piece {
    type = "knight"
    constructor(color) {
        super(color, 3);
    }

    generateMoves(row, col) {
        let moves = [
            [row + 1, col + 2],
            [row - 1, col + 2],
            [row + 2, col + 1],
            [row - 2, col + 1],
            [row + 1, col - 2],
            [row - 1, col - 2],
            [row + 2, col - 1],
            [row - 2, col - 1],
        ];

        return moves.filter(([r, c]) => this.isInside(r, c));
    }
}

class Rook extends Piece {
    type = "rook";

    constructor(color) {
        super(color, 5);
    }

    generateMoves(row, col, board) {
        const moves = [];
        const directions = [
            [-1, 0], [1, 0],
            [0, -1], [0, 1]
        ];

        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;

            while (this.isInside(r, c)) {
                const target = board.getPiece(r, c);

                if (!target) {
                    moves.push([r, c]);
                } else {
                    if (target.color !== this.color) {
                        moves.push([r, c]);
                    }
                    break;
                }

                r += dr;
                c += dc;
            }
        }

        return moves;
    }
}

class Queen extends Piece {
    type = "queen";

    constructor(color) {
        super(color, 9);
    }

    generateMoves(row, col, board) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 1], [1, -1], [1, 1],
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];

        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;

            while (this.isInside(r, c)) {
                const target = board.getPiece(r, c);

                if (!target) {
                    moves.push([r, c]);
                } else {
                    if (target.color !== this.color) {
                        moves.push([r, c]);
                    }
                    break;
                }

                r += dr;
                c += dc;
            }
        }

        return moves;
    }
}

class King extends Piece {
    type = "king"

    constructor(color) {
        super(color, 100);
    }

    generateMoves(row, col, board) {
        let moves = [
            [row, col + 1],
            [row, col - 1],
            [row + 1, col],
            [row - 1, col],
            [row + 1, col + 1],
            [row - 1, col - 1],
            [row + 1, col - 1],
            [row - 1, col + 1],
        ];

        return moves.filter(([r, c]) => this.isInside(r, c));
    }
}