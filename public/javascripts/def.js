const PIECES = { EMPTY : 0 ,
    wP : 1, wN : 2, wB : 3, wR : 4, wQ : 5, wK : 6,
    bP : 7, bN : 8, bB : 9, bR : 10, bQ : 11, bK : 12

 }

 const BRD_SQ_NUM = 120;

 const FILES = { FILE_A : 0, FILE_B : 1, FILE_C : 2,
     FILE_D : 3, FILE_E : 4, FILE_F : 5, FILE_G : 6, FILE_H : 7,
     FILE_NONE : 8
   }

const RANKS = { RANK_1 : 0, RANK_2 : 1, RANK_3 : 2,
      RANK_4 : 3, RANK_5 : 4, RANK_6 : 5, RANK_7 : 6, RANK_8 : 7,
      RANK_NONE : 8
    }


const COLOURS = { WHITE :0, BLACK : 1, BOTH : 2 };
//const BOOL = { FALSE : 0, TRUE : 1 };

var MAXGAMEMOVES = 2048; //Max number of moves made in game(Will come at it later)
var MAXPOSITIONMOVES = 256;//Max number of possible moves generated at any position.
var MAXDEPTH = 64;//Max depth of the search tree.
var INFINITE = 30000;
var MATE = 29000;
var PVENTRIES = 10000;

var CASTLEBIT = { WKCA : 1, WQCA : 2, BKCA : 4, BQCA : 8 };

const SQUARES = {
    A1 : 21, B1 : 22, C1 : 23, D1 : 24, E1 : 25, F1 : 26, G1 : 27, H1 : 28,
    A8 : 91, B8 : 92, C8 : 93, D8 : 94, E8 : 95, F8 : 96, G8 : 97, H8 : 98,
    NO_SQ : 99 , OFFBOARD : 100
};

var FilesBrd = [BRD_SQ_NUM];
var RanksBrd = [BRD_SQ_NUM];

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
//var START_FEN = "2rr3k/pp3pp1/1nnqbN1p/3pN3/2pP4/2P3Q1/PPB4P/R4RK1 w - - ";
//var START_FEN = "rnb1k2r/pp2qppp/3p1n2/2pp2B1/1bP5/2N1P3/PP2NPPP/R2QKB1R w KQkq -";
//var START_FEN = "1br3k1/p4p2/2p1r3/3p1b2/3Bn1p1/1P2P1Pq/P3Q1BP/2R1NRK1 b - -";

//var START_FEN = "r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1 ";
//var START_FEN = "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1";

var pieceChar = '.PNBRQKpnbrqk';
var fileChar = 'abcdefgh';
var rankChar = '12345678';
var sideChar = 'wb-';



function FR2SQ(f,r)
{
    return (( f + 21 ) + ( r * 10 ) );
}

/*
All pieces except pawn are big.
Only king , queen and rook are major pieces.
Bishop and Knight are minor pieces.

*/




var PieceBig = [ 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1 ];
var PieceMaj = [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1 ];
var PieceMin = [ 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0 ];
var PieceVal= [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
	COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];

/*Arrays used to know to whom a given piece number belongs to.
ex : if piecenum = 4 or 10 (i.e. a black or white rook);
then PieceRookQueen[piecenum] will give true;
*/
var PiecePawn = [ 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0 ];
var PieceKnight = [ 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0 ];
var PieceKing = [ 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1 ];
var PieceRookQueen = [ 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0 ];
var PieceBishopQueen = [ 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0 ];
var PieceSlides = [ 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0 ];

var KnightDir = [ -8, -19,	-21, -12, 8, 19, 21, 12 ];
var RookQueenDir = [ -1, -10,	1, 10 ];
var BishopQueenDir = [ -9, -11, 11, 9 ];
var KingDir = [ -1, -10,	1, 10, -9, -11, 11, 9 ];

var DirNum = [0 , 0, 8, 4, 4, 8, 8, 0, 8, 4, 4, 8, 8];
var PieceDir = [0, 0, KnightDir, BishopQueenDir, RookQueenDir, KingDir, KingDir, 0, KnightDir, BishopQueenDir, RookQueenDir, KingDir, KingDir];
var LoopNonSlidePiece = [PIECES.wN, PIECES.wK, 0, PIECES.bN, PIECES.bK, 0];
var LoopNonSlideIndex = [0 , 3];
var LoopSlidePiece = [PIECES.wB, PIECES.wR, PIECES.wQ, 0, PIECES.bB, PIECES.bR, PIECES.bQ, 0];
var LoopSlideIndex = [0, 4];

//variables to store hashes of every possible combinations of pieces on board. i.e. below variables are x'ored together to represent the state of the board
var pieceKeys = [13 * 120];
var sideKey ;
var castleKeys = [16];

var Sq120To64 = [120];
var Sq64To120 = [64];

function RAND_32() {

	return (Math.floor((Math.random()*255)+1) << 23) | (Math.floor((Math.random()*255)+1) << 16)
		 | (Math.floor((Math.random()*255)+1) << 8) | Math.floor((Math.random()*255)+1);

}


var Mirror64 = [
    56, 57, 58, 59, 60, 61, 62, 63,
    48, 49, 50, 51, 52, 53, 54, 55,
    40, 41, 42, 43, 44, 45, 46, 47,
    32, 33, 34, 35, 36, 37, 38, 39,
    24, 25, 26, 27, 28, 29, 30, 31,
    16, 17, 18, 19, 20, 21, 22, 23,
     8,  9, 10, 11, 12, 13, 14, 15,
     0,  1,  2,  3,  4,  5,  6,  7

];


function SQ64(sq120)
{
    return Sq120To64[sq120];
}
function SQ120(sq64)
{
    return Sq64To120[sq64];
}

var Kings = [PIECES.wK, PIECES.bK];

var CastlePerm = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 7 , 15, 15, 15,  3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,

];


/*

0000 0000 0000 0000 0000 0111 1111 -> From 0x7f
0000 0000 0000 0011 1111 1000 0000 -> To >> 7 & 0x7f
0000 0000 0011 1100 0000 0000 0000 -> Captured >> 14 ,0xF
0000 0000 0100 0000 0000 0000 0000 -> EnPass 0x40000
0000 0000 1000 0000 0000 0000 0000 -> Pawn Start 0x80000
0000 1111 0000 0000 0000 0000 0000 -> Promoted piece >>20 0xF
0001 0000 0000 0000 0000 0000 0000 -> Castle 0x1000000

*/


function FROMSQ(m) {return m & 0x7F;}
function TOSQ(m) {return (m >> 7) & 0x7F;}
function CAPTURED(m) {return (m >> 14) & 0xF;}
function PROMOTED(m) {return (m >> 20) & 0xF;}

var MFlagEPAS = 0x40000; //Flag set when enpassant capture
var MFlagPS = 0x80000;
var MFlagCastlePerm = 0x1000000;
var MFlagCAP = 0x7C000;
var MflagPROM = 0xF00000;

var NOMOVE = 0;
function PCEINDEX(pce, pceNum) {
	return (pce * 10 + pceNum);
}


function HASH_PIECE(piece , sq) { GameBoard.stateKey ^= pieceKeys[120 * piece + sq]; }

function HASH_CA() { GameBoard.stateKey ^= castleKeys[GameBoard.castlePerm]; }

function HASH_EP() { GameBoard.stateKey ^= pieceKeys[GameBoard.enPas]; }

function HASH_SIDE() { GameBoard.stateKey ^= sideKey; }
