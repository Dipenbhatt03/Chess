function ClearPiece(sq)
{
    var piece = GameBoard.pieces[sq];
    var col = PieceCol[piece];
    var pieceIndex;
    var t_pieceNum = -1;
    GameBoard.material[col] -= PieceVal[piece];
    GameBoard.pieces[sq] = PIECES.EMPTY;
    HASH_PIECE(piece, sq);
    for(var i = piece * 10; i < piece * 10 + GameBoard.pieceNum[piece]; i++)
    {
        if(GameBoard.pieceList[i] == sq)
        {
            t_pieceNum = i;
            break;
        }

    }
    GameBoard.pieceList[t_pieceNum] = GameBoard.pieceList[piece * 10 + GameBoard.pieceNum[piece] - 1 ];
    GameBoard.pieceNum[piece]--;
}

function AddPiece(sq, piece)
{
    var col = PieceCol[piece];

    HASH_PIECE(piece, sq);
    GameBoard.material[col] += PieceVal[piece];
    GameBoard.pieces[sq] = piece;
    GameBoard.pieceList[piece * 10 + GameBoard.pieceNum[piece]++] = sq;

}

function MovePiece(from , to)
{
    var pieceType = GameBoard.pieces[from];
    HASH_PIECE(pieceType, from);
    GameBoard.pieces[from] = PIECES.EMPTY;
    HASH_PIECE(pieceType, to);
    GameBoard.pieces[to] = pieceType;
    for(var i = pieceType * 10; i < pieceType * 10 + GameBoard.pieceNum[pieceType]; i++)
    {
        if(GameBoard.pieceList[i] == from)
        {
            GameBoard.pieceList[i] = to;
            break;
        }
    }



}

function MakeMove(move)
{
    var from = FROMSQ(move),
        to = TOSQ(move),
        side = GameBoard.side;


    GameBoard.history[GameBoard.hisPly].stateKey = GameBoard.stateKey;

    if(move & MFlagEPAS )
    {
        if(side == COLOURS.WHITE)
        {
            ClearPiece(to-10);
        }
        else
        {
            ClearPiece(to+10);
        }
    }
    if(move & MFlagCastlePerm)
    {
        switch (to) {
            case SQUARES.C1:
                    MovePiece(SQUARES.A1, SQUARES.D1);
                break;
            case SQUARES.G1:
                    MovePiece(SQUARES.H1, SQUARES.F1);
                break;
            case SQUARES.C8:
                    MovePiece(SQUARES.A8, SQUARES.D8);
                break;
            case SQUARES.G8:
                    MovePiece(SQUARES.H8, SQUARES.F8);
                break;
            default:
                console.log('Castling Error in MakeMove');
                break;

        }
    }

    //Remember that only one enPassant square can be set at a time. So if in previous move lets say black
    //made an enpassant move. First we need to hash out that enpassant move and hash in again if any new
    //enpassant square is set. If no new square is set then old enpassant square is hashed in again.


    if(GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();

    HASH_CA();

    GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.hisPly].castlePerm = GameBoard.castlePerm;

    GameBoard.enPas = SQUARES.NO_SQ;

    GameBoard.castlePerm &= CastlePerm[from] & CastlePerm[to];

    HASH_CA();

    //console.log("GameBoard.StateKey : " + GameBoard.stateKey + ' GenerateStateKey : ' + GenerateStateKey());


    GameBoard.fiftyMove++;
    if(CAPTURED(move) && !(move & MFlagEPAS))
    {
        ClearPiece(to);
        GameBoard.fiftyMove = 0;
    }

    if(PiecePawn[GameBoard.pieces[from]])
    {
        GameBoard.fiftyMove = 0;

        if(move & MFlagPS)
        {

            if(side == COLOURS.WHITE)
                GameBoard.enPas = to - 10;
            else GameBoard.enPas = to + 10;

            HASH_EP();
        }

    }
    GameBoard.hisPly++;
    GameBoard.ply++;

    MovePiece(from,to);

    if(move & MflagPROM)
    {
        ClearPiece(to);
        AddPiece(to,PROMOTED(move));
    }
    GameBoard.side ^= 1;
    HASH_SIDE();



    if(SqAttacked(GameBoard.pieceList[Kings[side] * 10], GameBoard.side))
    {
        TakeMoveBack();
        //console.log('For move : ' + PrMove(move) + " King in check");
        return false;
    }



    return true;


}


function TakeMoveBack()
{
    GameBoard.hisPly--;
    GameBoard.ply--;
    var from = FROMSQ(GameBoard.history[GameBoard.hisPly].move),
        to = TOSQ(GameBoard.history[GameBoard.hisPly].move),
        move = GameBoard.history[GameBoard.hisPly].move;

    if(GameBoard.enPas != SQUARES.NO_SQ)
        HASH_EP();

    HASH_CA();
    GameBoard.castlePerm = GameBoard.history[GameBoard.hisPly].castlePerm;
    GameBoard.enPas = GameBoard.history[GameBoard.hisPly].enPas;
    GameBoard.fiftyMove = GameBoard.history[GameBoard.hisPly].fiftyMove;

    if(GameBoard.enPas != SQUARES.NO_SQ)
        HASH_EP();

    HASH_CA();

    GameBoard.side ^= 1;

    HASH_SIDE();

    if(move & MFlagEPAS)
    {
        if(GameBoard.side == COLOURS.WHITE)
        {
            AddPiece(to - 10, PIECES.bP);
        }
        else AddPiece(to + 10 , PIECES.wP);
    }

    if(move & MFlagCastlePerm)
    {
        switch (to) {
            case SQUARES.C1:
                //rook from d1 to a1
                MovePiece(SQUARES.D1, SQUARES.A1);
                break;
            case SQUARES.G1:
                //move rook from f1 to h1
                MovePiece(SQUARES.F1, SQUARES.H1);
                break;
            case SQUARES.C8:
                //move rook from d8 to a8
                MovePiece(SQUARES.D8, SQUARES.A8);
                break;
            case SQUARES.G8:
                //move rook from f8 to h8
                MovePiece(SQUARES.F8, SQUARES.H8);
                break;
            default:
                console.log('Castling Error in TakeMove');
                break;

        }
    }

    if(move & MflagPROM)
    {
        ClearPiece(to);
        if(GameBoard.side == COLOURS.WHITE)
            AddPiece(to, PIECES.wP);
        else AddPiece(to, PIECES.bP);
    }

    MovePiece(to,from);

    var captured = CAPTURED(move);
    if(captured && !(move & MFlagEPAS))
    {
        AddPiece(to, captured);
    }
    

}
