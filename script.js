
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
    "♙": "Peão", "♖": "Torre",
    "♘": "Cavalo", "♗": "Bispo",
    "♕": "Rainha", "♔": "Rei",
    "♟": "Peão", "♜": "Torre",
    "♞": "Cavalo", "♝": "Bispo",
    "♛": "Rainha", "♚": "Rei"
};

let position = initialPosition.map(row => [...row]);
let selectedSquare = null;
let currentTurn = "white";

// IDENTIFICA A COR DA PEÇA
function getPieceColor(piece) {
    if (!piece) return null;

    return "♙♖♘♗♕♔".includes(piece)
        ? "white"
        : "black";
}

// RETORNA INFORMAÇÕES DA PEÇA
function getPieceInfo(piece) {
    if (!piece) return null;

    return {
        name: pieceNames[piece],
        color: getPieceColor(piece)
    };
}

// VERIFICA SE UMA CASA ESTÁ VAZIA
function isSquareEmpty(row, col) {
    return position[row][col] === "";
}

// PEÃO
function getPawnMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Peão") {
        return [];
    }

    const color = getPieceColor(piece);
    const direction = color === "white" ? -1 : 1;
    const moves = [];

    const nextRow = row + direction;

    // Movimento para frente
    if (
        nextRow >= 0 &&
        nextRow <= 7 &&
        isSquareEmpty(nextRow, col)
    ) {
        moves.push({ row: nextRow, col });

        // Movimento inicial de duas casas
        const initialRow = color === "white" ? 6 : 1;
        const doubleRow = row + direction * 2;

        if (
            row === initialRow &&
            isSquareEmpty(doubleRow, col)
        ) {
            moves.push({ row: doubleRow, col });
        }
    }

    // Capturas diagonais
    for (const offset of [-1, 1]) {
        const targetRow = row + direction;
        const targetCol = col + offset;

        if (
            targetRow < 0 || targetRow > 7 ||
            targetCol < 0 || targetCol > 7
        ) {
            continue;
        }

        const targetPiece = position[targetRow][targetCol];

        if (
            targetPiece !== "" &&
            getPieceColor(targetPiece) !== color &&
            pieceNames[targetPiece] !== "Rei"
        ) {
            moves.push({
                row: targetRow,
                col: targetCol
            });
        }
    }

    return moves;
}

// MOVIMENTOS EM LINHA RETA OU DIAGONAL
function getSlidingMoves(row, col, directions) {
    const piece = position[row][col];

    if (!piece) return [];

    const color = getPieceColor(piece);
    const moves = [];

    for (const direction of directions) {
        for (let distance = 1; distance < 8; distance++) {
            const targetRow = row + direction.row * distance;
            const targetCol = col + direction.col * distance;

            // Verifica os limites do tabuleiro
            if (
                targetRow < 0 || targetRow > 7 ||
                targetCol < 0 || targetCol > 7
            ) {
                break;
            }

            const targetPiece = position[targetRow][targetCol];

            // Casa vazia
            if (targetPiece === "") {
                moves.push({
                    row: targetRow,
                    col: targetCol
                });

                continue;
            }

            // Captura uma peça adversária
            if (
                getPieceColor(targetPiece) !== color &&
                pieceNames[targetPiece] !== "Rei"
            ) {
                moves.push({
                    row: targetRow,
                    col: targetCol
                });
            }

            // Nenhuma peça pode ser atravessada
            break;
        }
    }

    return moves;
}

// TORRE
function getRookMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Torre") {
        return [];
    }

    const directions = [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 }
    ];

    return getSlidingMoves(row, col, directions);
}

// BISPO
function getBishopMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Bispo") {
        return [];
    }

    const directions = [
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 }
    ];

    return getSlidingMoves(row, col, directions);
}

// RAINHA
function getQueenMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Rainha") {
        return [];
    }

    const directions = [
        // Retas
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },

        // Diagonais
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 }
    ];

    return getSlidingMoves(row, col, directions);
}

// CAVALO
function getKnightMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Cavalo") {
        return [];
    }

    const color = getPieceColor(piece);
    const moves = [];

    const directions = [
        { row: -2, col: -1 },
        { row: -2, col: 1 },
        { row: -1, col: -2 },
        { row: -1, col: 2 },
        { row: 1, col: -2 },
        { row: 1, col: 2 },
        { row: 2, col: -1 },
        { row: 2, col: 1 }
    ];

    for (const direction of directions) {
        const targetRow = row + direction.row;
        const targetCol = col + direction.col;

        // Verifica se o destino existe
        if (
            targetRow < 0 || targetRow > 7 ||
            targetCol < 0 || targetCol > 7
        ) {
            continue;
        }

        const targetPiece = position[targetRow][targetCol];

        // O cavalo pode saltar sobre outras peças
        if (
            targetPiece === "" ||
            (
                getPieceColor(targetPiece) !== color &&
                pieceNames[targetPiece] !== "Rei"
            )
        ) {
            moves.push({
                row: targetRow,
                col: targetCol
            });
        }
    }

    return moves;
}

// REI
function getKingMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Rei") {
        return [];
    }

    const color = getPieceColor(piece);
    const moves = [];

    // O rei pode andar uma casa em qualquer direção
    const directions = [
        { row: -1, col: -1 },
        { row: -1, col: 0 },
        { row: -1, col: 1 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 }
    ];

    for (const direction of directions) {
        const targetRow = row + direction.row;
        const targetCol = col + direction.col;

        if (
            targetRow < 0 || targetRow > 7 ||
            targetCol < 0 || targetCol > 7
        ) {
            continue;
        }

        const targetPiece = position[targetRow][targetCol];

        if (
            targetPiece === "" ||
            (
                getPieceColor(targetPiece) !== color &&
                pieceNames[targetPiece] !== "Rei"
            )
        ) {
            moves.push({
                row: targetRow,
                col: targetCol
            });
        }
    }

    return moves;
}

// RECONHECE OS MOVIMENTOS DE CADA PEÇA
function getValidMoves(row, col) {
    const piece = position[row][col];

    if (!piece) return [];

    const pieceName = pieceNames[piece];

    if (pieceName === "Peão") {
        return getPawnMoves(row, col);
    }

    if (pieceName === "Torre") {
        return getRookMoves(row, col);
    }

    if (pieceName === "Bispo") {
        return getBishopMoves(row, col);
    }

    if (pieceName === "Rainha") {
        return getQueenMoves(row, col);
    }

    if (pieceName === "Cavalo") {
        return getKnightMoves(row, col);
    }

    if (pieceName === "Rei") {
        return getKingMoves(row, col);
    }

    return [];
}

// MOVIMENTA UMA PEÇA
function movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = position[fromRow][fromCol];

    position[toRow][toCol] = piece;
    position[fromRow][fromCol] = "";

    selectedSquare = null;

    currentTurn =
        currentTurn === "white" ? "black" : "white";

    turnDisplay.textContent =
        currentTurn === "white"
            ? "Turno: Brancas"
            : "Turno: Pretas";

    renderBoard();
}

// SELECIONA E MOVIMENTA PEÇAS
function selectSquare(row, col) {
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

        turnDisplay.textContent =
            currentTurn === "white"
                ? "Turno: Brancas"
                : "Turno: Pretas";
    }

    renderBoard();
}

// RENDERIZA O TABULEIRO
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

    turnDisplay.textContent = "Turno: Brancas";

    renderBoard();
}

restartButton.addEventListener("click", restartGame);

renderBoard();


