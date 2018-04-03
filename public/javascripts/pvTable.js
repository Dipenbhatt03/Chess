function printBoard2()
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
    console.log("");
    console.log("");

}

function GetPathStart(depth)
{

	var move = GetPvMove();
	var count = 0;

	while(move != NOMOVE && count < depth)
	{

		if( MoveExists(move))
		{

			MakeMove(move);
			//printBoard2();
        	GameBoard.pvArray[count++] = move;

		}
		else
		{

			break;
		}
		move = GetPvMove();
	}
	//console.log(count);
	var c = count;
	while(c)
	{
		TakeMoveBack();
		c--;
	}

	return count;

}

function GetPvMove()
{
	var index = GameBoard.stateKey % PVENTRIES;

	if(GameBoard.pvTable[index].stateKey == GameBoard.stateKey) {
		return GameBoard.pvTable[index].move;
	}

	return NOMOVE;
}


function StorePvMove(move)
{
	var index = GameBoard.stateKey % PVENTRIES;
	GameBoard.pvTable[index].stateKey = GameBoard.stateKey;
    GameBoard.pvTable[index].move = move;

}
