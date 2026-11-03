

const board = document.getElementById("board");
const turnDisplay = document.getElementById("turn");
const restartButton = document.getElementById("restart");

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

// Identifica a cor da peça
function getPieceColor(piece) {
    if (!piece) return null;

    return "♙♖♘♗♕♔".includes(piece)
        ? "white"
        : "black";
}

// Retorna informações da peça
function getPieceInfo(piece) {
    if (!piece) return null;

    return {
        name: pieceNames[piece],
        color: getPieceColor(piece)
    };
}

// Verifica se uma casa está vazia
function isSquareEmpty(row, col) {
    return position[row][col] === "";
}

// Calcula os movimentos de um peão
function getPawnMoves(row, col) {

    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Peão") {
        return [];
    }

    const color = getPieceColor(piece);
    const direction = color === "white" ? -1 : 1;

    const moves = [];

    const nextRow = row + direction;

    // Movimento de uma casa
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
            moves.push({
                row: doubleRow,
                col
            });
        }
    }

    // Capturas diagonais
    for (const offset of [-1, 1]) {

        const targetRow = row + direction;
        const targetCol = col + offset;

        // Verifica os limites do tabuleiro
        if (
            targetRow < 0 || targetRow > 7 ||
            targetCol < 0 || targetCol > 7
        ) {
            continue;
        }

        const targetPiece = position[targetRow][targetCol];

        if (
            targetPiece !== "" &&
            getPieceColor(targetPiece) !== color
        ) {
            moves.push({
                row: targetRow,
                col: targetCol
            });
        }
    }

    return moves;
}

// Calcula os movimentos de uma torre
function getRookMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Torre") {
        return [];
    }

    const color = getPieceColor(piece);
    const moves = [];

    // Quatro direções possíveis
    const directions = [
        { row: -1, col: 0 }, // Cima
        { row: 1, col: 0 },  // Baixo
        { row: 0, col: -1 }, // Esquerda
        { row: 0, col: 1 }   // Direita
    ];

    for (const direction of directions) {
        for (let distance = 1; distance < 8; distance++) {
            const targetRow = row + direction.row * distance;
            const targetCol = col + direction.col * distance;

            // Saiu dos limites do tabuleiro?
            if (
                targetRow < 0 || targetRow > 7 ||
                targetCol < 0 || targetCol > 7
            ) {
                break;
            }

            const targetPiece = position[targetRow][targetCol];

            // Casa vazia: pode continuar andando
            if (targetPiece === "") {
                moves.push({ row: targetRow, col: targetCol });
                continue;
            }

            // Peça adversária: pode capturar, mas não atravessar
            if (getPieceColor(targetPiece) !== color) {
                moves.push({ row: targetRow, col: targetCol });
            }

            // Encontrou qualquer peça: encerra essa direção
            break;
        }
    }

    return moves;
}
// Calcula os movimentos de um bispo
function getBishopMoves(row, col) {
    const piece = position[row][col];

    if (!piece || pieceNames[piece] !== "Bispo") {
        return [];
    }

    const color = getPieceColor(piece);
    const moves = [];

    // Quatro diagonais possíveis
    const directions = [
        { row: -1, col: -1 }, // Cima e esquerda
        { row: -1, col: 1 },  // Cima e direita
        { row: 1, col: -1 },  // Baixo e esquerda
        { row: 1, col: 1 }    // Baixo e direita
    ];

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

            // Casa vazia: movimento permitido
            if (targetPiece === "") {
                moves.push({ row: targetRow, col: targetCol });
                continue;
            }

            // Peça adversária: permite captura
            if (getPieceColor(targetPiece) !== color) {
                moves.push({ row: targetRow, col: targetCol });
            }

            // Não pode atravessar nenhuma peça
            break;
        }
    }

    return moves;
}

// Retorna os movimentos de acordo com o tipo da peça
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

    return [];
}
// Movimenta uma peça
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

// Seleciona e movimenta peças
function selectSquare(row, col) {

    const piece = position[row][col];

    // Se já existe uma peça selecionada,
    // verificamos se o destino é permitido.
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

    // Seleciona apenas peças do jogador atual
    if (piece && getPieceColor(piece) === currentTurn) {

        selectedSquare = { row, col };

        const info = getPieceInfo(piece);

        turnDisplay.textContent =
            `Selecionada: ${info.name}`;

    } else if (!piece || getPieceColor(piece) !== currentTurn) {

        selectedSquare = null;

        turnDisplay.textContent =
            currentTurn === "white"
                ? "Turno: Brancas"
                : "Turno: Pretas";
    }

    renderBoard();
}

// Renderiza o tabuleiro
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

            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {
                square.classList.add("selected");
            }

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

// Reinicia o jogo
function restartGame() {

    position = initialPosition.map(row => [...row]);

    selectedSquare = null;
    currentTurn = "white";

    turnDisplay.textContent = "Turno: Brancas";

    renderBoard();
}

restartButton.addEventListener("click", restartGame);

renderBoard();

