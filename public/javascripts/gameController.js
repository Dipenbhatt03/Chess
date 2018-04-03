var GameController = {};
//GameController.EngineSide = COLOURS.BLACK;
GameController.PlayerSide = COLOURS.BOTH;
GameController.GameOver = false;



var UserMove = {};
UserMove.from = SQUARES.NO_SQ;
UserMove.to = SQUARES.NO_SQ;


function StaleMate()
{
    GenerateMoves();
    for(var moveNum = GameBoard.moveListStart[GameBoard.ply];
        moveNum < GameBoard.moveListStart[GameBoard.ply + 1]; moveNum++)
    {
        if(!MakeMove(GameBoard.moveList[moveNum]))
            continue;
        TakeMoveBack();
        return false;
    }
    return true;
}

function ThreeFoldRepetition()
{
    var count = 0;
    for(var index = GameBoard.hisPly - 1; index >= 0; index--)
    {
        if(GameBoard.history[index].stateKey == GameBoard.stateKey)
            count++;
        if(count >= 2)
            return true;
    }
    return false;
}

function MaterialDraw()
{
    if(GameBoard.pieceNum[PIECES.wP] > 0 || GameBoard.pieceNum[PIECES.bP] > 0)  return false;

    if(GameBoard.pieceNum[PIECES.wQ] > 0 || GameBoard.pieceNum[PIECES.bQ] > 0
        || GameBoard.pieceNum[PIECES.wR] > 0 || GameBoard.pieceNum[PIECES.bR] > 0)  return false;

    if(GameBoard.pieceNum[PIECES.wB] > 1 || GameBoard.pieceNum[PIECES.bB] > 1)  return false;

    if(GameBoard.pieceNum[PIECES.wN] > 1 || GameBoard.pieceNum[PIECES.bN] > 1)  return false;

    if((GameBoard.pieceNum[PIECES.wN] > 0 && GameBoard.pieceNum[PIECES.wB] > 0) ||
        (GameBoard.pieceNum[PIECES.bN] > 0 && GameBoard.pieceNum[PIECES.bB] > 1))  return false;



    return true;
}

function CheckGameState()
{
    if(GameBoard.fiftyMove >= 100)
    {
        $('#GameStatus').text('Game Drawn(Fifty Move rule)');
        return true;
    }
    if(MaterialDraw())
    {
        $('#GameStatus').text('Game Drawn(Insufficient material)');
        return true;
    }
    if(ThreeFoldRepetition())
    {
        $('#GameStatus').text('Game Drawn(Three Fold Repetition rule)');
        return true;
    }
    if(StaleMate())
    {

        var InCheck = SqAttacked(GameBoard.pieceList[Kings[GameBoard.side] * 10], GameBoard.side^1);
        if(InCheck)
        {
            console.log('Stale Mate');
            if(GameBoard.side == COLOURS.WHITE)
            {
                $('#GameStatus').text('Game Over Black Wins');
                return true;
            }
            else
            {
                $('#GameStatus').text('Game Over White Wins');
                return true;
            }
        }
    }

    return false;

}

function CheckGame()
{
    if(CheckGameState())
    {
        GameController.GameOver = true;
    }
    else
    {
        GameController.GameOver = false;
        $('#GameStatus').text('');

    }
}

function PreSearch()
{
    if(!GameController.GameOver)
    {
        setTimeout(
            function()
            {
                StartSearch();
            },300
        );
    }
}

function StartSearch()
{
    SearchController.time = $('#ThinkingTime').val();
    SearchFunctionController();

    MakeMove(SearchController.bestMove);
    InitPiecesSquares(GameController.PlayerSide);
    printBoard();
    CheckGame();
}
function ShowBestMove()
{
    SearchController.time = $('#ThinkingTime').val();
    SearchFunctionController();

    UpdateScores();


}
