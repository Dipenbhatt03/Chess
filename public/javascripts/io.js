function PrSq(sq)
{
    return (fileChar[FilesBrd[sq]] + rankChar[RanksBrd[sq]]);
}

function PrMove(move)
{
    var from = FROMSQ(move),
        to = TOSQ(move) , prom = "";
    if(move & MflagPROM)
        prom = pieceChar[PROMOTED(move)];
    var MvStr = PrSq(from) + PrSq(to) + prom;
    return MvStr;

}
function PrintMoveList()
{
    var move;
    console.log('Move List:');
    for(var i = GameBoard.moveListStart[GameBoard.ply]; i < GameBoard.moveListStart[GameBoard.ply + 1]; i++)
    {
        move = GameBoard.moveList[i];
        console.log(PrMove(move));
    }
}
function ParseMove(from, to)
{
    GenerateMoves();
    var FromSquare , ToSquare;
    var move = NOMOVE;
    var promPiece ;
    var found = false;
    console.log(GameBoard.moveListStart[GameBoard.ply],GameBoard.moveListStart[GameBoard.ply + 1]);
    for(var moveNum = GameBoard.moveListStart[GameBoard.ply];
        moveNum < GameBoard.moveListStart[GameBoard.ply + 1]; moveNum++)
    {

        move = GameBoard.moveList[moveNum];
        console.log(PrMove(move));
        FromSquare = FROMSQ(move);
        ToSquare = TOSQ(move);
        if(FromSquare == from && ToSquare == to)
        {
            promPiece = PROMOTED(move);
            if(promPiece != PIECES.EMPTY)
            {

                console.log(promPiece);
            }
            found = true;
            break;
        }
    }
    if(found)
    {
        if(!MakeMove(move))
            return NOMOVE;
        TakeMoveBack();
        return move;
    }
    return NOMOVE;
}
