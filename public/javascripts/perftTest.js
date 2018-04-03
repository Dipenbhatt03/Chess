var leafNodes = 0;
var moveNum;

function perft(depth)
{
    if(depth == 0)
    {
        leafNodes++;
        return;
    }

    GenerateMoves();
    var index, move;


    for(index = GameBoard.moveListStart[GameBoard.ply]; index < GameBoard.moveListStart[GameBoard.ply + 1]; index++)
    {
        move = GameBoard.moveList[index];

        if(!MakeMove(move))
            continue;

        perft(depth-1);
        TakeMoveBack();
    }
}

function perftTesting(depth)
{
    console.log('Starting Perft test at Depth:' + depth);
    leafNodes = 0;
    GenerateMoves();

    var index, move , end = GameBoard.moveListStart[GameBoard.ply + 1];
     moveNum = 0;

    for(index = GameBoard.moveListStart[GameBoard.ply]; index < end;index++)
    {
        move = GameBoard.moveList[index];
        if(!MakeMove(move))
        {
            continue;
        }
        moveNum++;
        var x = leafNodes;
        perft(depth-1);
        var newNodes = leafNodes - x;


        TakeMoveBack();
    }
    console.log(moveNum);
    console.log('Test Complete : ' + leafNodes + ' visited');

}
