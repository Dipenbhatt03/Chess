var PawnTable = [
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
10	,	10	,	0	,	-10	,	-10	,	0	,	10	,	10	,
5	,	0	,	0	,	5	,	5	,	0	,	0	,	5	,
0	,	0	,	10	,	20	,	20	,	10	,	0	,	0	,
5	,	5	,	5	,	10	,	10	,	5	,	5	,	5	,
10	,	10	,	10	,	20	,	20	,	10	,	10	,	10	,
20	,	20	,	20	,	30	,	30	,	20	,	20	,	20	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0
];


var KnightTable = [
0	,	-10	,	0	,	0	,	0	,	0	,	-10	,	0	,
0	,	0	,	0	,	5	,	5	,	0	,	0	,	0	,
0	,	0	,	10	,	10	,	10	,	10	,	0	,	0	,
0	,	0	,	10	,	20	,	20	,	10	,	5	,	0	,
5	,	10	,	15	,	20	,	20	,	15	,	10	,	5	,
5	,	10	,	10	,	20	,	20	,	10	,	10	,	5	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0
];

var BishopTable = [
0	,	0	,	-10	,	0	,	0	,	-10	,	0	,	0	,
0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
0	,	0	,	0	,	0	,	0	,	0	,	0	,	0
];

var RookTable = [
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,
0	,	0	,	5	,	10	,	10	,	5	,	0	,	0
];

var BishopPair = 40;


function Evaluate() {

	var score = GameBoard.material[COLOURS.WHITE] - GameBoard.material[COLOURS.BLACK];

	var pce;
	var sq;
	var pieceNum;
	pce = PIECES.wP;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score += PawnTable[SQ64(sq)];
	}

	pce = PIECES.bP;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score -= PawnTable[Mirror64[SQ64(sq)]];
	}

	pce = PIECES.wN;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score += KnightTable[SQ64(sq)];
	}

	pce = PIECES.bN;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score -= KnightTable[Mirror64[SQ64(sq)]];
	}

	pce = PIECES.wB;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score += BishopTable[SQ64(sq)];
	}

	pce = PIECES.bB;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score -= BishopTable[Mirror64[SQ64(sq)]];
	}

	pce = PIECES.wR;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score += RookTable[SQ64(sq)];
	}

	pce = PIECES.bR;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score -= RookTable[Mirror64[SQ64(sq)]];
	}

	pce = PIECES.wQ;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score += RookTable[SQ64(sq)];
	}

	pce = PIECES.bQ;
	for(pieceNum = 0; pieceNum < GameBoard.pieceNum[pce]; ++pieceNum) {
		sq = GameBoard.pieceList[pce * 10 + pieceNum];
		score -= RookTable[Mirror64[SQ64(sq)]];
	}

	if(GameBoard.pieceNum[PIECES.wB] >= 2) {
		score += BishopPair;
	}

	if(GameBoard.pieceNum[PIECES.bB] >= 2) {
		score -= BishopPair;
	}

	if(GameBoard.side == COLOURS.WHITE) {
		return score;
	} else {
		return -score;
	}

}
