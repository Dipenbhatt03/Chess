function START_GAME(game)
{

    init(game);
    console.log("Main init called!!");
    ParseFen(START_FEN);
    if(GameBoard.playAgainstEngine)
        GameController.PlayerSide = COLOURS.WHITE;
    else
        GameController.PlayerSide = game.color;
    InitPiecesSquares(GameController.PlayerSide);
    printBoard();
  //  checkBoard();


}

function InitFilesRanksBoard()
{
    var index = 0 ;
    for(index = 0; index < BRD_SQ_NUM ; index ++ )
    {
        FilesBrd[index] = SQUARES.OFFBOARD;
        RanksBrd[index] = SQUARES.OFFBOARD;
    }
    for(var rank = RANKS.RANK_1; rank <= RANKS.RANK_8 ; rank++)
    {
        for(var file = FILES.FILE_A ; file <= FILES.FILE_H ; file++)
        {
            var sq = FR2SQ(file,rank);
            FilesBrd[sq] = file;
            RanksBrd[sq] = rank;
        }
    }

//    console.log("FilesBrd[0]:" + FilesBrd[0] + " RanksBrd[0]:" + RanksBrd[0]);
//    console.log("FilesBrd[SQUARES.A1]" + FilesBrd[SQUARES.A1] + " RanksBrd[SQUARES.A1]" + RanksBrd[SQUARES.A1]);
//    console.log("FilesBrd[SQUARES.E8]" + FilesBrd[SQUARES.E8] + " RanksBrd[SQUARES.E8]" + RanksBrd[SQUARES.E8]);
}

function InitHashKeys()
{
    var i = 0;
    for(;i < 13 * 120 ; i++)
        pieceKeys[i] = RAND_32();

    sideKey = RAND_32();

    for(i = 0;i < 16; i++)
        castleKeys[i] = RAND_32();
}

function InitSq120To64()
{
    var i = 0;
    for(; i < BRD_SQ_NUM; i++)
        Sq120To64[i] = 120;

    for(i = 0; i < 64; i++)
        Sq64To120[i] = 64;
    var sq64 = 0,sqr;
    for(var ranks = RANKS.RANK_1; ranks <= RANKS.RANK_8; ranks++)
    {
        for(var files = FILES.FILE_A; files <= FILES.FILE_H ; files++)
        {
             sqr = FR2SQ(files,ranks);
             Sq120To64[sqr] = sq64;
             Sq64To120[sq64] = sqr;
             sq64++;
        }
    }

}

function initGameBoardHistory()
{
    for(var i = 0;i < MAXGAMEMOVES; i++)
    {
        GameBoard.history.push({
            move : NOMOVE,
            stateKey : 0,
            enPas : SQUARES.NO_SQ,
            fiftyMove : 0,
            castlePerm : 1111
        });
    }
    for(var i = 0; i < PVENTRIES ; i++)
    {
        GameBoard.pvTable.push({
            move : NOMOVE,
            stateKey : 0
    //        depth : 0,
    //        pieceList : [120]
        });
    }
}

function init(game, playAgainstEngine)
{
    console.log("init() called!!");
    InitFilesRanksBoard();
    InitHashKeys();
    InitSq120To64();
    initGameBoardHistory();
    InitAttackerVictimArray();
    InitBoardSquares();
    if(!GameBoard.playAgainstEngine)
    {
        GameBoard.playerName = playerName;
        GameBoard.oponentName = oponentName;

    }

}
