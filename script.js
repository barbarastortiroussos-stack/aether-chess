const board = document.getElementById("board");
const turnDisplay = document.getElementById("turn");
const restartButton = document.getElementById("restart");

// POSIÇÃO INICIAL
const initialPosition = [
    ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
    ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
    ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

const pieceNames = {
    "♙": "Peão", "♖": "Torre", "♘": "Cavalo",
    "♗": "Bispo", "♕": "Rainha", "♔": "Rei",
    "♟": "Peão", "♜": "Torre", "♞": "Cavalo",
    "♝": "Bispo", "♛": "Rainha", "♚": "Rei"
};

const kings = {
    white: "♔",
    black: "♚"
};

const queens = {
    white: "♕",
    black: "♛"
};

let position = initialPosition.map(row => [...row]);
let selectedSquare = null;
let currentTurn = "white";
let gameOver = false;

// IDENTIFICA A COR DA PEÇA
function getPieceColor(piece) {
    if (!piece) return null;

    return "♙♖♘♗♕♔".includes(piece)
        ? "white"
        : "black";
}

// INFORMAÇÕES DA PEÇA
function getPieceInfo(piece) {
    if (!piece) return null;

    return {
        name: pieceNames[piece],
        color: getPieceColor(piece)
    };
}

// VERIFICA OS LIMITES DO TABULEIRO
function isInsideBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// VERIFICA SE UMA CASA ESTÁ VAZIA
function isSquareEmpty(row, col) {
    return position[row][col] === "";
}

// PEÃO
function getPawnMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Peão") return [];

    const color = getPieceColor(piece);
    const direction = color === "white" ? -1 : 1;
    const moves = [];

    const nextRow = row + direction;

    // Movimento para frente
    if (isInsideBoard(nextRow, col) && isSquareEmpty(nextRow, col)) {
        moves.push({ row: nextRow, col });

        // Movimento inicial de duas casas
        const initialRow = color === "white" ? 6 : 1;
        const doubleRow = row + direction * 2;

        if (row === initialRow && isSquareEmpty(doubleRow, col)) {
            moves.push({ row: doubleRow, col });
        }
    }

    // Capturas diagonais
    for (const offset of [-1, 1]) {
        const targetRow = row + direction;
        const targetCol = col + offset;

        if (!isInsideBoard(targetRow, targetCol)) continue;

        const targetPiece = position[targetRow][targetCol];

        if (
            targetPiece &&
            getPieceColor(targetPiece) !== color &&
            pieceNames[targetPiece] !== "Rei"
        ) {
            moves.push({ row: targetRow, col: targetCol });
        }
    }

    return moves;
}

// TORRE, BISPO E RAINHA
function getSlidingMoves(row, col, directions) {
    const piece = position[row][col];

    if (!piece) return [];

    const color = getPieceColor(piece);
    const moves = [];

    for (const direction of directions) {
        for (let distance = 1; distance < 8; distance++) {
            const targetRow = row + direction.row * distance;
            const targetCol = col + direction.col * distance;

            if (!isInsideBoard(targetRow, targetCol)) break;

            const targetPiece = position[targetRow][targetCol];

            if (!targetPiece) {
                moves.push({ row: targetRow, col: targetCol });
                continue;
            }

            if (
                getPieceColor(targetPiece) !== color &&
                pieceNames[targetPiece] !== "Rei"
            ) {
                moves.push({ row: targetRow, col: targetCol });
            }

            break;
        }
    }

    return moves;
}

// TORRE
function getRookMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Torre") return [];

    return getSlidingMoves(row, col, [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 }
    ]);
}

// BISPO
function getBishopMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Bispo") return [];

    return getSlidingMoves(row, col, [
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 }
    ]);
}

// RAINHA
function getQueenMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Rainha") return [];

    return getSlidingMoves(row, col, [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 }
    ]);
}

// CAVALO
function getKnightMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Cavalo") return [];

    const color = getPieceColor(piece);

    const offsets = [
        [-2, -1], [-2, 1],
        [-1, -2], [-1, 2],
        [1, -2], [1, 2],
        [2, -1], [2, 1]
    ];

    const moves = [];

    for (const [rowOffset, colOffset] of offsets) {
        const targetRow = row + rowOffset;
        const targetCol = col + colOffset;

        if (!isInsideBoard(targetRow, targetCol)) continue;

        const targetPiece = position[targetRow][targetCol];

        if (
            !targetPiece ||
            (
                getPieceColor(targetPiece) !== color &&
                pieceNames[targetPiece] !== "Rei"
            )
        ) {
            moves.push({ row: targetRow, col: targetCol });
        }
    }

    return moves;
}

// REI
function getKingMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Rei") return [];

    const color = getPieceColor(piece);
    const moves = [];

    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) continue;

            const targetRow = row + rowOffset;
            const targetCol = col + colOffset;

            if (!isInsideBoard(targetRow, targetCol)) continue;

            const targetPiece = position[targetRow][targetCol];

            if (
                !targetPiece ||
                (
                    getPieceColor(targetPiece) !== color &&
                    pieceNames[targetPiece] !== "Rei"
                )
            ) {
                moves.push({ row: targetRow, col: targetCol });
            }
        }
    }

    return moves;
}

// MOVIMENTOS BÁSICOS DE CADA PEÇA
function getPseudoMoves(row, col) {
    const piece = position[row][col];

    if (!piece) return [];

    switch (pieceNames[piece]) {
        case "Peão":
            return getPawnMoves(row, col);

        case "Torre":
            return getRookMoves(row, col);

        case "Bispo":
            return getBishopMoves(row, col);

        case "Rainha":
            return getQueenMoves(row, col);

        case "Cavalo":
            return getKnightMoves(row, col);

        case "Rei":
            return getKingMoves(row, col);

        default:
            return [];
    }
}

// ENCONTRA A POSIÇÃO DO REI
function findKing(color) {
    const king = kings[color];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (position[row][col] === king) {
                return { row, col };
            }
        }
    }

    return null;
}

// VERIFICA SE UMA CASA ESTÁ SENDO ATACADA
function isSquareAttacked(targetRow, targetCol, attackerColor) {

    // Ataques dos peões
    const pawn = attackerColor === "white" ? "♙" : "♟";

    const pawnSourceRow =
        targetRow + (attackerColor === "white" ? 1 : -1);

    for (const colOffset of [-1, 1]) {
        const pawnSourceCol = targetCol + colOffset;

        if (
            isInsideBoard(pawnSourceRow, pawnSourceCol) &&
            position[pawnSourceRow][pawnSourceCol] === pawn
        ) {
            return true;
        }
    }

    // Ataques dos cavalos
    const knight = attackerColor === "white" ? "♘" : "♞";

    const knightOffsets = [
        [-2, -1], [-2, 1],
        [-1, -2], [-1, 2],
        [1, -2], [1, 2],
        [2, -1], [2, 1]
    ];

    for (const [dr, dc] of knightOffsets) {
        const row = targetRow + dr;
        const col = targetCol + dc;

        if (
            isInsideBoard(row, col) &&
            position[row][col] === knight
        ) {
            return true;
        }
    }

    // Ataques do rei
    const enemyKing = kings[attackerColor];

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;

            const row = targetRow + dr;
            const col = targetCol + dc;

            if (
                isInsideBoard(row, col) &&
                position[row][col] === enemyKing
            ) {
                return true;
            }
        }
    }

    // Ataques das torres, bispos e rainhas
    const directions = [
        [-1, 0], [1, 0],
        [0, -1], [0, 1],
        [-1, -1], [-1, 1],
        [1, -1], [1, 1]
    ];

    for (const [dr, dc] of directions) {
        let row = targetRow + dr;
        let col = targetCol + dc;

        while (isInsideBoard(row, col)) {
            const piece = position[row][col];

            if (piece) {
                if (getPieceColor(piece) === attackerColor) {
                    const name = pieceNames[piece];
                    const diagonal = dr !== 0 && dc !== 0;

                    if (
                        name === "Rainha" ||
                        (diagonal && name === "Bispo") ||
                        (!diagonal && name === "Torre")
                    ) {
                        return true;
                    }
                }

                break;
            }

            row += dr;
            col += dc;
        }
    }

    return false;
}

// VERIFICA SE O REI ESTÁ EM XEQUE
function isKingInCheck(color) {
    const kingPosition = findKing(color);

    if (!kingPosition) return false;

    const opponent = color === "white" ? "black" : "white";

    return isSquareAttacked(
        kingPosition.row,
        kingPosition.col,
        opponent
    );
}

// FILTRA MOVIMENTOS QUE DEIXARIAM O PRÓPRIO REI EM XEQUE
function getValidMoves(row, col) {
    const piece = position[row][col];

    if (!piece) return [];

    const color = getPieceColor(piece);
    const pseudoMoves = getPseudoMoves(row, col);

    return pseudoMoves.filter(move => {
        const originalPiece = position[move.row][move.col];

        // Simula o movimento
        position[move.row][move.col] = piece;
        position[row][col] = "";

        const kingIsSafe = !isKingInCheck(color);

        // Restaura o tabuleiro
        position[row][col] = piece;
        position[move.row][move.col] = originalPiece;

        return kingIsSafe;
    });
}

// VERIFICA SE O JOGADOR TEM ALGUM MOVIMENTO LEGAL
function hasAnyLegalMove(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = position[row][col];

            if (
                piece &&
                getPieceColor(piece) === color &&
                getValidMoves(row, col).length > 0
            ) {
                return true;
            }
        }
    }

    return false;
}

// ATUALIZA O ESTADO DA PARTIDA
function updateGameStatus() {
    const turnName = currentTurn === "white" ? "Brancas" : "Pretas";
    const opponentName = currentTurn === "white" ? "Pretas" : "Brancas";

    const inCheck = isKingInCheck(currentTurn);
    const hasMoves = hasAnyLegalMove(currentTurn);

    if (!hasMoves && inCheck) {
        gameOver = true;
        turnDisplay.textContent =
            `XEQUE-MATE! ${opponentName} venceram!`;
        return;
    }

    if (!hasMoves && !inCheck) {
        gameOver = true;
        turnDisplay.textContent = "EMPATE! Afogamento.";
        return;
    }

    gameOver = false;

    turnDisplay.textContent = inCheck
        ? `XEQUE! Turno: ${turnName}`
        : `Turno: ${turnName}`;
}

// PROMOÇÃO DO PEÃO
function promotePawnIfNeeded(row, col) {
    const piece = position[row][col];

    if (piece === "♙" && row === 0) {
        position[row][col] = queens.white;
    }

    if (piece === "♟" && row === 7) {
        position[row][col] = queens.black;
    }
}

// MOVIMENTA UMA PEÇA
function movePiece(fromRow, fromCol, toRow, toCol) {
    if (gameOver) return;

    const piece = position[fromRow][fromCol];

    if (!piece || getPieceColor(piece) !== currentTurn) return;

    // Confere novamente se o movimento é legal.
    const legalMove = getValidMoves(fromRow, fromCol).some(
        move => move.row === toRow && move.col === toCol
    );

    if (!legalMove) return;

    position[toRow][toCol] = piece;
    position[fromRow][fromCol] = "";

    promotePawnIfNeeded(toRow, toCol);

    selectedSquare = null;

    currentTurn =
        currentTurn === "white" ? "black" : "white";

    updateGameStatus();
    renderBoard();
}

// SELECIONA E MOVIMENTA PEÇAS
function selectSquare(row, col) {
    if (gameOver) return;

    const piece = position[row][col];

    if (selectedSquare) {
        const moves = getValidMoves(
            selectedSquare.row,
            selectedSquare.col
        );

        const validMove = moves.find(
            move => move.row === row && move.col === col
        );

        if (validMove) {
            movePiece(
                selectedSquare.row,
                selectedSquare.col,
                row,
                col
            );

            return;
        }
    }

    // Seleciona uma peça da vez atual
    if (piece && getPieceColor(piece) === currentTurn) {
        selectedSquare = { row, col };

        const info = getPieceInfo(piece);

        turnDisplay.textContent =
            `Selecionada: ${info.name}`;

    } else {
        selectedSquare = null;
        updateGameStatus();
    }

    renderBoard();
}

// DESENHA O TABULEIRO
function renderBoard() {
    board.innerHTML = "";

    let possibleMoves = [];

    if (selectedSquare) {
        possibleMoves = getValidMoves(
            selectedSquare.row,
            selectedSquare.col
        );
    }

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement("div");

            square.classList.add("square");

            square.classList.add(
                (row + col) % 2 === 1 ? "light" : "dark"
            );

            const piece = position[row][col];

            if (piece) {
                square.textContent = piece;

                square.classList.add(
                    getPieceColor(piece) === "white"
                        ? "white-piece"
                        : "black-piece"
                );
            }

            // Destaca a peça selecionada
            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {
                square.classList.add("selected");
            }

            // Destaca movimentos possíveis
            if (
                possibleMoves.some(
                    move => move.row === row && move.col === col
                )
            ) {
                square.classList.add("possible");
            }

            square.addEventListener("click", () => {
                selectSquare(row, col);
            });

            board.appendChild(square);
        }
    }
}

// REINICIA O JOGO
function restartGame() {
    position = initialPosition.map(row => [...row]);

    selectedSquare = null;
    currentTurn = "white";
    gameOver = false;

    updateGameStatus();
    renderBoard();
}

// EVENTOS
restartButton.addEventListener("click", restartGame);

updateGameStatus();
renderBoard();
