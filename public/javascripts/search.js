var SearchController = {};

SearchController.nodes;
SearchController.bestMove;
SearchController.bestScore;
SearchController.thinking;
SearchController.depth;
SearchController.start;
SearchController.stop;
SearchController.time;
SearchController.firstCutoff;
SearchController.Cutoffs;


function PickBestMove(index)
{
    var swapIndex = index;
    for (var i = index + 1; i < GameBoard.moveListStart[GameBoard.ply + 1]; i++)
    {
        if(GameBoard.moveScores[i] > GameBoard.moveScores[swapIndex])
            swapIndex = i;
    }
    var temp = GameBoard.moveScores[swapIndex];
    GameBoard.moveScores[swapIndex] = GameBoard.moveScores[index];
    GameBoard.moveScores[index] = temp;
    temp = GameBoard.moveList[swapIndex];
    GameBoard.moveList[swapIndex] = GameBoard.moveList[index];
    GameBoard.moveList[index] = temp;

}

function ClearPVTable()
{
    for(var i = 0; i < PVENTRIES ; i++)
    {
        GameBoard.pvTable[i].move = NOMOVE;
        GameBoard.pvTable[i].stateKey = 0;
    }
}

function CheckTimer()
{
    //console.log('Start : ' + SearchController.start + ' Now : ' + $.now() + ' Time : ' + SearchController.time *1000 + SearchController.start );
    if(($.now() - SearchController.start) >= (SearchController.time * 1000 ))
    {
        SearchController.stop = true;
        console.log('Stop');
    }
}

function IsRepeated()
{
    var index = 0;
    for(index = GameBoard.hisPly - GameBoard.fiftyMove; index < GameBoard.hisPly - 1; index++)
    {
        if(GameBoard.stateKey == GameBoard.history[index].stateKey)
            return true;
    }
    return false;
}

function QuiescenceSearch(alpha,beta)
{

    if(SearchController.nodes % 2048 == 0)
    {
        CheckTimer();

    }
    SearchController.nodes++;
    if((IsRepeated() || GameBoard.fiftyMove >= 100) && GameBoard.hisPly != 0)
        return 0;

    if(GameBoard.ply > MAXDEPTH - 1 )
        return Evaluate();


    var score = Evaluate();

    if(score >= beta)
        return beta;
    if(score > alpha)
        alpha = score;

    GenerateCaptureMoves();
    var move, moveNum , bestMove = NOMOVE;

    var legal = 0;

    for(moveNum = GameBoard.moveListStart[GameBoard.ply]; moveNum < GameBoard.moveListStart[GameBoard.ply + 1]; moveNum++)
    {
        PickBestMove(moveNum);
        move = GameBoard.moveList[moveNum];
        if(!MakeMove(move))
            continue;
        score = -QuiescenceSearch(-beta,-alpha);
        legal++;
        TakeMoveBack();

        if(SearchController.stop)
            return 0;



        if(score > alpha)
        {
            if(score >= beta)
            {
                if(legal == 1)
                    SearchController.firstCutoff++;
                SearchController.Cutoffs++;
                return beta;
            }
            alpha = score;
            bestMove = move;
        }

    }
    if(bestMove != NOMOVE)
        StorePvMove(move);
    return alpha;
}


function AlphaBeta(depth, alpha, beta)
{

    if(depth <= 0)
    {
        return QuiescenceSearch(alpha, beta);
    }
    if(SearchController.nodes % 2048 == 0)
    {
        CheckTimer();
    }

    SearchController.nodes++;
    //fiftyMove rule or if a position is Repeated
    if((IsRepeated() || GameBoard.fiftyMove >= 100) && GameBoard.hisPly != 0)
        return 0;

    if(GameBoard.ply > MAXDEPTH - 1 )
        return Evaluate();

    var InCheck = SqAttacked(GameBoard.pieceList[Kings[GameBoard.side] * 10] , GameBoard.side ^ 1 );
	if(InCheck)  {
		depth++;
	}


    var score = -INFINITE;

    GenerateMoves();

    var Move = NOMOVE, MoveNum = 0, BestMove = NOMOVE;
    var legal = 0; // To see weather any legal moves are possible
    var start = GameBoard.moveListStart[GameBoard.ply], end = GameBoard.moveListStart[GameBoard.ply + 1];

    var PreviosSearchBestMove = GetPvMove();
	if(PreviosSearchBestMove != NOMOVE)
    {
        for(MoveNum = start; MoveNum < end; MoveNum++)
        {
			if(GameBoard.moveList[MoveNum] == PreviosSearchBestMove)
            {
				GameBoard.moveScores[MoveNum] = 2000000;
				break;
			}
		}
	}



    for(MoveNum = start; MoveNum < end; MoveNum++)
    {
        PickBestMove(MoveNum);
        Move = GameBoard.moveList[MoveNum];

        if(!MakeMove(Move))
            continue;
        legal++;

        score = -AlphaBeta(depth - 1, -beta, -alpha);

        TakeMoveBack();

        if(SearchController.stop)
            return 0;


        if(score > alpha)
        {
            if(score >= beta)
            {
                if(legal == 1)
                    SearchController.firstCutoff++;
                SearchController.Cutoffs++;
                if(!CAPTURED(Move))
                {
                    GameBoard.searchKillers[GameBoard.ply + MAXDEPTH] =
                                GameBoard.searchKillers[GameBoard.ply];
                    GameBoard.searchKillers[GameBoard.ply] = Move;
                }

                return beta;
            }

            if(!CAPTURED(Move))
            {
                GameBoard.searchHistory[GameBoard.pieces[FROMSQ(Move)] * BRD_SQ_NUM + TOSQ(Move) ] +=
                    depth * depth;
            }

            alpha = score;
            BestMove = Move;
        }

    }

    if(legal == 0)
    {
        if (SqAttacked(GameBoard.pieceList[Kings[GameBoard.side] * 10] , GameBoard.side ^ 1))
        {
            return -MATE + GameBoard.ply;
        }
        else return 0;
    }
    if(BestMove != NOMOVE)
    {
        StorePvMove(BestMove);
    }

    return alpha;

}

function ClearForSearch()
{
    for(var i = 0; i < 3 * MAXDEPTH; i ++)
        GameBoard.searchKillers[i] = 0;
    for(var i = 0; i < 13 * BRD_SQ_NUM; i ++)
        GameBoard.searchHistory[i] = 0;

    ClearPVTable();
    GameBoard.ply = 0;
    SearchController.firstCutoff = 0;
    SearchController.Cutoffs = 0;
    SearchController.nodes = 0;
    SearchController.start = $.now();
    SearchController.bestMove = NOMOVE;
    SearchController.bestScore = -INFINITE;
    SearchController.stop = false;
    console.log();
}

function SearchFunctionController()
{
    var bestMove = NOMOVE;
    var bestScore = -INFINITE;
    var currentDepth = 0;
    ClearForSearch();

    console.log('');

    for(currentDepth = 1; currentDepth <= 8; currentDepth++)
    {
        if(SearchController.stop)
        {
            console.log('BestMove :  ' + PrMove(bestMove));
            break;
        }

        bestScore = AlphaBeta(currentDepth, -INFINITE, INFINITE);
        bestMove = GetPvMove();
        if(bestMove != NOMOVE)
        {
            SearchController.bestMove = bestMove;
            SearchController.bestScore = bestScore;
            var str = "Depth : " + currentDepth + ' Move : ' + PrMove(bestMove) + " Nodes : " + SearchController.nodes + ' Score : ' + bestScore + " PV:";
            var count = GetPathStart(currentDepth);
            for(var i = 0; i < count; i++)
                str += PrMove(GameBoard.pvArray[i]) + " ";
            if(currentDepth != 1)
            str += " CuttingOff : " + SearchController.firstCutoff/SearchController.Cutoffs * 100 + "%";
            console.log(str);

            console.log('BestMove :  ' + PrMove(bestMove));

        }



    }


    console.log('BestMove :  ' + PrMove(SearchController.bestMove));

    SearchController.depth = currentDepth;
    SearchController.thinking = false;

    UpdateScores();
}

function UpdateScores()
{
    //console.log(PrMove(SearchController.bestMove));
    $('#BestMove').text(PrMove(SearchController.bestMove));
    $('#Depth').text(SearchController.depth);
    $('#Score').text(SearchController.bestScore);
    $('#Time').text(($.now() - SearchController.start)/1000);
    $('#Ordering').text(SearchController.firstCutoff/SearchController.Cutoffs * 100 + "%");
    $('#Nodes').text(SearchController.nodes);

}
