//This file is used to represent the state of the chess board. The pieces on it,
//moves made,etc.

function pieceIndex(piece , pieceNum)
{
    return (10 * piece + pieceNum);
}

var GameBoard = {};

//Each square of the board,
//if 0 means its empty,
//if 100 means that is an off board Position,
//and any integer between 1 and 12 means the position is occupied.
//Look in defs.js to see which piece is represented by which integer.This variable gives pieceType on a given square
GameBoard.pieces = [BRD_SQ_NUM];
GameBoard.side = COLOURS.BOTH;
GameBoard.playAgainstEngine = false;
GameBoard.playerName = '';
GameBoard.oponentName = '';
//There is a rule in chess that if no pawn has been moved,or no capture has been done
//even after each player has made 50 moves,then any one player can call draw.
//So we will increase fiftyMove variable each time a move is made and once it hits 100
//the game can be called draw.
GameBoard.fiftyMove = 0;
//This will record moves made in the game,and used as an index for a stack we will made to take back moves.
//Basically gets incremented for each move made by a player.
//Will come at this later.
GameBoard.hisPly = 0;
GameBoard.history = [];
//Ply will be used to know the level we are at in the search tree.So if hisPly = 40,then each side has made 20 moves,
//and then if ply = 6 then 6 future moves has been calculated in search tree.
//Will come at it later.
GameBoard.ply = 0;
GameBoard.enPas = 0;//Google for en passant rule;
/*Castle permission is a rule in chess, this variable is used to keep track weather we have the permission or not.
Search in internet for more info on castle permission.
0001 - WKCA(White king castle permission)
0010 - WQCA
0100 - BKCA
1000 - BQCA
0101 - Only Black And WHITE king has castling permission.
We are using an integer and doing bit manipulation to store the castling permission.

*/
GameBoard.castlePerm = 0;
GameBoard.material = [2]; // WHITE, BLACK material of pieces.
GameBoard.pieceNum = [13]; //Tells the number of pieces of each type.
GameBoard.pieceList = [14 * 10];
GameBoard.stateKey = 0;

GameBoard.moveList = [MAXDEPTH * MAXPOSITIONMOVES]; //
GameBoard.moveScores = [MAXDEPTH * MAXPOSITIONMOVES];
GameBoard.moveListStart = [MAXDEPTH];//'index' for the first move at a given ply.(index is in moveList)

GameBoard.pvTable = [];
GameBoard.pvArray = [MAXDEPTH];
GameBoard.searchHistory = [13 * BRD_SQ_NUM];//Used to store moves that cause alpha cut off
GameBoard.searchKillers = [3 * MAXDEPTH]; // Used to store move that cause beta cutoffs


function checkBoard()
{
    var pieceNum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var sq120, pieceType, piece, material = [0, 0];




    //Checking pieceNum array and material

    for(var sq = 0; sq < 64; sq++)
    {
        sq120 = SQ120(sq);
        pieceType = GameBoard.pieces[sq120];
        material[PieceCol[pieceType]] += PieceVal[pieceType];
        pieceNum[GameBoard.pieces[sq120]]++;

    }

    if(material[0] != GameBoard.material[0] || material[1] != GameBoard.material[1])
    {
        console.log("material error");
        console.log(material);
        console.log(GameBoard.material);
        return false;
    }


    for(pieceType = PIECES.wP; pieceType <= PIECES.bK; pieceType++)
    {

        if(pieceNum[pieceType] != GameBoard.pieceNum[pieceType])
        {
            console.log('PieceNum Error!!');
            return false;
        }
    }



    //Checking if pieceList array is valid or not

    for(pieceType = PIECES.wP; pieceType <= PIECES.bK; pieceType++)
    {
        for(var sq = pieceType * 10; sq < pieceType * 10 + GameBoard.pieceNum[pieceType]; sq++)
        {

            if(GameBoard.pieces[GameBoard.pieceList[sq  ]] != pieceType)
            {

                console.log(' PieceList Error');
                return false;
            }
        }
    }


    //Checking stateKey and sides

    if(GameBoard.side != COLOURS.WHITE && GameBoard.side != COLOURS.BLACK)
    {
        console.log("Side Error");
        return false;
    }

    if(GameBoard.stateKey != GenerateStateKey())
    {
        console.log("StateKey Error");
        console.log("GameBoard.StateKey : " + GameBoard.stateKey + ' GenerateStateKey : ' + GenerateStateKey());
        return false;

    }

    return true;
}


function printBoard()
{
    var sq,file,rank,piece;

    for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--)
    {
        var line = rankChar[rank] + "  ";
        for(file = FILES.FILE_A; file <= FILES.FILE_H; file++)
        {
            sq120 = FR2SQ(file,rank);
            piece = pieceChar[GameBoard.pieces[sq120]];
            line += piece + "  ";
        }
        console.log(line);

    }
    console.log("   a  b  c  d  e  f  g  h");

    console.log('Side : ' + sideChar[GameBoard.side]);
    console.log('enPas : ' + GameBoard.enPas);
    line = "";
    if(GameBoard.castlePerm & CASTLEBIT.WKCA) line += "K";
    if(GameBoard.castlePerm & CASTLEBIT.WQCA) line += "Q";
    if(GameBoard.castlePerm & CASTLEBIT.BKCA) line += "k";
    if(GameBoard.castlePerm & CASTLEBIT.BQCA) line += "q";
    console.log("Castle Permission : " + line);
    console.log('GameBoard state Key : ' + GameBoard.stateKey);
    console.log('Player : ' + GameBoard.playerName + ' Color : ' + GameController.PlayerSide );
    console.log('Oponent : ' + GameBoard.oponentName  + ' Color : ' + GameController.PlayerSide ^ 1);


}


function GenerateStateKey()
{
    var sq = 0;
    var finalKey = 0;
    var piece;
    for(sq = 0; sq < BRD_SQ_NUM; sq ++)
    {
        piece = GameBoard.pieces[sq];
        if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD)
        {
            finalKey ^= pieceKeys[piece * 120 + sq ];

        }
    }


    if(GameBoard.enPas != SQUARES.NO_SQ)
        finalKey ^= pieceKeys[GameBoard.enPas];


    finalKey ^= castleKeys[GameBoard.castlePerm];


    if(GameBoard.side == COLOURS.WHITE)

        finalKey ^= sideKey;




    return finalKey;
}

function printPieceList()
{
    var piece,pieceum;
    for(piece = 1; piece <= 12; piece++) //Max piece number is 12(blackKing).Look into def.js
    {
        for(pieceNum = 0; pieceNum < GameBoard.pieceNum[piece]; pieceNum++)
        {
            console.log('Piece :' + pieceChar[piece] + ' at ' + PrSq(GameBoard.pieceList[piece * 10 + pieceNum]));
        }
    }
}

function UpdateListsMaterial()
{
    var sq,piece,pieceColor;
    for(i = 0;i < 14 * 10; i++)
        GameBoard.pieceList[i] = PIECES.EMPTY;
    for(i = 0;i < 13; i++)
        GameBoard.pieceNum[i] = 0;

    GameBoard.material[0] = GameBoard.material[1] = 0;
    for(var i = 0;i < 64; i++)
    {
        sq = Sq64To120[i];
        piece = GameBoard.pieces[sq];
        if(piece != PIECES.EMPTY)
        {
            pieceColor = PieceCol[piece];
            GameBoard.material[pieceColor] += PieceVal[piece];
            GameBoard.pieceList[piece * 10 + GameBoard.pieceNum[piece]] = sq;
            GameBoard.pieceNum[piece]++;
        }

    }
    //printPieceList();
}

function ResetBoard()
{
    var i = 0;
    for(;i < BRD_SQ_NUM; i++)
        GameBoard.pieces[i] = SQUARES.OFFBOARD;
    for(i = 0; i < 64; i++)
        GameBoard.pieces[SQ120(i)] = PIECES.EMPTY;

    GameBoard.sides = COLOURS.BOTH;
    GameBoard.enPas = SQUARES.NO_SQ;
    GameBoard.castlePerm = 0;
    GameBoard.fiftyMove = 0;
    GameBoard.hisPly = 0;
    GameBoard.ply = 0;
    GameBoard.stateKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}


//Ex fen:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
function ParseFen(fen)
{
    ResetBoard();
    console.log(fen);
    var file = FILES.FILE_A,
        rank = RANKS.RANK_8;
    var count = 0;
    var piece = PIECES.EMPTY;
    var sq120;
    var fenIndex = 0;
    while((rank >= RANKS.RANK_1) && fenIndex < fen.length)
    {
        count = 1;

        switch (fen[fenIndex])
        {
            case 'p': piece = PIECES.bP;break;
            case 'r': piece = PIECES.bR;break;
            case 'n': piece = PIECES.bN;break;
            case 'b': piece = PIECES.bB;break;
            case 'q': piece = PIECES.bQ;break;
            case 'k': piece = PIECES.bK;break;

            case 'P': piece = PIECES.wP;break;
            case 'R': piece = PIECES.wR;break;
            case 'N': piece = PIECES.wN;break;
            case 'B': piece = PIECES.wB;break;
            case 'Q': piece = PIECES.wQ;break;
            case 'K': piece = PIECES.wK;break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                count = parseInt(fen[fenIndex]);
                piece = PIECES.EMPTY;
                break;


            case '/':
            case ' ':

                rank--;
                file = FILES.FILE_A;
                fenIndex++;
                continue;

            default:
                //console.log(fen[fenIndex]);
                console.log("FEN ERROR");
                return;

        }
        for(var i = 0; i < count; i++)
        {
            sq120 = FR2SQ(file,rank);
            GameBoard.pieces[sq120] = piece;
            file++;
        }
        fenIndex++;
    }

    //Ex fen:rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1

    if(fen[fenIndex] == 'w')
        GameBoard.side = COLOURS.WHITE;
    else GameBoard.side = COLOURS.BLACK;

    fenIndex += 2;
    for(var i = 0;i < 4; i++)
    {

        if(fen[fenIndex] == ' ')
            break;
        else
        {
            switch (fen[fenIndex])
            {
                case 'K': GameBoard.castlePerm |= CASTLEBIT.WKCA;break;
                case 'Q': GameBoard.castlePerm |= CASTLEBIT.WQCA;break;
                case 'k': GameBoard.castlePerm |= CASTLEBIT.BKCA;break;
                case 'q': GameBoard.castlePerm |= CASTLEBIT.BQCA;break;

                default: break;

            }
            fenIndex++;
        }
    }
    fenIndex++;
    if(fen[fenIndex] != '-')
    {
        file = fen[fenIndex].charCodeAt() - 'a'.charCodeAt();
        rank = parseInt(fen[fenIndex + 1])-1;
        console.log("file:" + (file + 1) + "   Rank:" + (rank+1));
        GameBoard.enPas = FR2SQ(file,rank);
    }
    GameBoard.stateKey = GenerateStateKey();
    UpdateListsMaterial();
//    printSqAttacked();
}

function printSqAttacked()
{
    var sq,file,rank,piece
    for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--)
    {
        var line = rankChar[rank] + "  ";
        for(file = FILES.FILE_A; file <= FILES.FILE_H; file++)
        {
            sq120 = FR2SQ(file,rank);
            if(SqAttacked(sq120 , GameBoard.side)) piece ='X';
            else piece = '-';
            line += piece + "  ";
        }
        console.log(line);

    }
    console.log("   a  b  c  d  e  f  g  h");
    console.log("");
}

function SqAttacked(sq , side)
{
    var piece;

    //Is there a Pawn attack??
    if(side == COLOURS.WHITE)
    {
        if(GameBoard.pieces[sq - 11] == PIECES.wP || GameBoard.pieces[sq - 9] == PIECES.wP)
            return true;
    }
    else
    {
        if(GameBoard.pieces[sq + 11] == PIECES.bP || GameBoard.pieces[sq + 9] == PIECES.bP)
            return true;
    }



    //Is there a Knight attack??
    for(var i = 0;i < 8; i++)
    {
        var sqr = sq + KnightDir[i];
        piece = GameBoard.pieces[sqr];
        if(piece != SQUARES.OFFBOARD)
        {
            if(PieceCol[piece] == side && PieceKnight[piece])
                return true;
        }
    }

    //Is there a Rook or Queen attack??

    for(var i = 0;i < 4; i++)
    {
        var move = RookQueenDir[i];
        var sqr = sq + move;
        piece = GameBoard.pieces[sqr];
        while(piece != SQUARES.OFFBOARD)
        {
            if(piece != PIECES.EMPTY)
            {
                if(PieceCol[piece] == side && PieceRookQueen[piece])
                    return true;
                else break;
            }
            sqr += move;
            piece = GameBoard.pieces[sqr];
        }
    }

    //Is there any Bishop or Queen attack??

    for(var i = 0;i < 4; i++)
    {
        var move = BishopQueenDir[i];
        var sqr = sq + move;
        piece = GameBoard.pieces[sqr];
        while(piece != SQUARES.OFFBOARD)
        {
            if(piece != PIECES.EMPTY)
            {
                if(PieceCol[piece] == side && PieceBishopQueen[piece])
                    return true;
                else break;
            }
            sqr += move;
            piece = GameBoard.pieces[sqr];
        }
    }

    //Is there a King attack??
    for(var i = 0; i < 8; i++)
    {
        var sqr = sq + KingDir[i];

        piece = GameBoard.pieces[sqr];
        if(piece != SQUARES.OFFBOARD)
        {
            if(PieceCol[piece] == side && PieceKing[piece])
                return true;
        }
    }

    return false;
}
