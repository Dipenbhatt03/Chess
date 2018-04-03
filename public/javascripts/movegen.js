var MvvLvv = [0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600];
var MvvLvvScores = [14 * 14];

function InitAttackerVictimArray()
{
    var attacker, victim;
    for(attacker = PIECES.wP; attacker <= PIECES.bK; attacker++)
    {
        for(victim = PIECES.wP; victim <= PIECES.bK; victim++)
        {
            MvvLvvScores[victim * 14 + attacker] = (MvvLvv[victim] + 6) - MvvLvv[attacker] / 100;
        }
    }
}

function MoveExists(move)
{
    GenerateMoves();
    for(var i = GameBoard.moveListStart[GameBoard.ply]; i < GameBoard.moveListStart[GameBoard.ply + 1]; i++)
    {
        if(!MakeMove(GameBoard.moveList[i]))
            continue;
        TakeMoveBack();
        if(move == GameBoard.moveList[i])
            return true;
    }
    console.log('Move : ' + PrMove(move) + " does not exist at depth : " + GameBoard.ply);
    return false;
}

function MOVE(from, to, captured, promoted, flag)
{
    return (from | (to << 7) | (captured << 14) | (promoted << 20) | flag);
}

function AddCaptureMove(move)
{
    var attacker =
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] =
                        MvvLvvScores[GameBoard.pieces[FROMSQ(move)] + CAPTURED(move) * 14] + 1000000;
    GameBoard.moveListStart[GameBoard.ply + 1]++;
}
function AddQuiteMove(move)
{
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 0;
    if(move == GameBoard.searchKillers[GameBoard.ply])
    {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 900000;
    }
    else if(move == GameBoard.searchKillers[GameBoard.ply + MAXDEPTH])
    {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 800000;
    }
    else
    {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] =
                GameBoard.searchHistory[GameBoard.pieces[FROMSQ(move)] * BRD_SQ_NUM + TOSQ(move) ];
    }

    GameBoard.moveListStart[GameBoard.ply + 1]++;
}
function AddEnPassantMove(move)
{
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply + 1]] = move;
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply + 1]] = 105 + 1000000;
    GameBoard.moveListStart[GameBoard.ply + 1]++;
}

function AddWhitePawnCaptureMove(from , to , cap)
{
    if(RanksBrd[from] == RANKS.RANK_7)
    {
        AddCaptureMove( MOVE(from , to , cap , PIECES.wB , 0) );
        AddCaptureMove( MOVE(from , to , cap , PIECES.wQ , 0) );
        AddCaptureMove( MOVE(from , to , cap , PIECES.wR , 0) );
        AddCaptureMove( MOVE(from , to , cap , PIECES.wN , 0) );

    }
    else
    {
        AddCaptureMove( MOVE(from , to , cap , PIECES.EMPTY , 0) );
    }
}
function AddBlackPawnCaptureMove(from , to , cap)
{
    if(RanksBrd[from] == RANKS.RANK_2)
    {
        AddCaptureMove( MOVE(from , to , cap , PIECES.bQ , 0) );
        AddCaptureMove( MOVE(from , to , cap , PIECES.bB , 0) );
        AddCaptureMove( MOVE(from , to , cap , PIECES.bR , 0) );
        AddCaptureMove( MOVE(from , to , cap , PIECES.bN , 0) );

    }
    else
    {
        AddCaptureMove( MOVE(from , to , cap , PIECES.EMPTY , 0) );
    }
}

function AddWhitePawnQuiteMove(from , to )
{
    if(RanksBrd[from] == RANKS.RANK_7)
    {
        AddQuiteMove( MOVE(from , to , PIECES.EMPTY , PIECES.wB , 0) );
        AddQuiteMove( MOVE(from , to , PIECES.EMPTY , PIECES.wQ , 0) );
        AddQuiteMove( MOVE(from , to , PIECES.EMPTY , PIECES.wN , 0) );
        AddQuiteMove( MOVE(from , to , PIECES.EMPTY , PIECES.wR , 0) );

    }
    else
    {
        AddQuiteMove( MOVE(from , to , PIECES.EMPTY , PIECES.EMPTY , 0) );
    }
}
function AddBlackPawnQuiteMove(from , to)
{
    if(RanksBrd[from] == RANKS.RANK_2)
    {
        AddQuiteMove( MOVE(from , to , PIECES.EMPTY , PIECES.bQ , 0) );
        AddQuiteMove( MOVE(from , to , PIECES.EMPTY , PIECES.bB , 0) );
        AddQuiteMove( MOVE(from , to , PIECES.EMPTY , PIECES.bN , 0) );
        AddQuiteMove( MOVE(from , to , PIECES.EMPTY , PIECES.bR , 0) );

    }
    else
    {
        AddCaptureMove( MOVE(from , to , PIECES.EMPTY , PIECES.EMPTY , 0) );
    }
}




function GenerateMoves()
{
    GameBoard.moveListStart[GameBoard.ply + 1] = GameBoard.moveListStart[GameBoard.ply];
    var pieceType, sq;
    var pieceIndex,piece,t_sq;
    if(GameBoard.side == COLOURS.WHITE)
    {
        pieceType = PIECES.wP;
        for(var pieceNum = 0; pieceNum < GameBoard.pieceNum[pieceType]; pieceNum++)
        {
            var sq = GameBoard.pieceList[pieceType * 10 + pieceNum];
            if (GameBoard.pieces[sq + 10] == PIECES.EMPTY)
            {
                AddWhitePawnQuiteMove(sq , sq + 10);

                if(RanksBrd[sq] == RANKS.RANK_2 && GameBoard.pieces[sq + 20] == PIECES.EMPTY)
                {
                    AddQuiteMove( MOVE(sq, sq + 20, PIECES.EMPTY, PIECES.EMPTY, MFlagPS) );
                }

            }
            if(GameBoard.pieces[sq + 9] != SQUARES.OFFBOARD && PieceCol[GameBoard.pieces[sq + 9]] == COLOURS.BLACK)
            {
                AddWhitePawnCaptureMove(sq , sq + 9, GameBoard.pieces[sq + 9]);
            }
            if(GameBoard.pieces[sq + 11] != SQUARES.OFFBOARD && PieceCol[GameBoard.pieces[sq + 11]] == COLOURS.BLACK)
            {
                AddWhitePawnCaptureMove(sq , sq + 11, GameBoard.pieces[sq + 11]);
            }
            if(GameBoard.enPas != SQUARES.NO_SQ)
            {
                if((sq + 9) == GameBoard.enPas)
                {
                    AddEnPassantMove( MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFlagEPAS) );
                }
                if((sq + 11) == GameBoard.enPas)
                {
                    AddEnPassantMove( MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFlagEPAS) );
                }
            }

        }

        if(GameBoard.castlePerm & CASTLEBIT.WKCA)
        {
            if(GameBoard.pieces[SQUARES.F1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G1] == PIECES.EMPTY)
            {
                if(!SqAttacked(SQUARES.E1,COLOURS.BLACK) && !SqAttacked(SQUARES.F1,COLOURS.BLACK) && !SqAttacked(SQUARES.G1,COLOURS.BLACK) )
                {
                    AddQuiteMove(MOVE(SQUARES.E1, SQUARES.G1, PIECES.EMPTY, PIECES.EMPTY, MFlagCastlePerm));
                }
            }
        }
        if(GameBoard.castlePerm & CASTLEBIT.WQCA)
        {
            if(GameBoard.pieces[SQUARES.D1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C1] == PIECES.EMPTY  && GameBoard.pieces[SQUARES.B1] == PIECES.EMPTY)
            {
                if(!SqAttacked(SQUARES.E1,COLOURS.BLACK) && !SqAttacked(SQUARES.D1,COLOURS.BLACK) && !SqAttacked(SQUARES.C1,COLOURS.BLACK) )
                {
                    AddQuiteMove(MOVE(SQUARES.E1, SQUARES.C1, PIECES.EMPTY, PIECES.EMPTY, MFlagCastlePerm));
                }
            }
        }


    }
    else
    {
        pieceType = PIECES.bP;
        for(var pieceNum = 0; pieceNum < GameBoard.pieceNum[pieceType]; pieceNum++)
        {
            var sq = GameBoard.pieceList[pieceType * 10 + pieceNum];
            if (GameBoard.pieces[sq - 10] == PIECES.EMPTY)
            {
                //Add Pawn MOVE
                AddBlackPawnQuiteMove(sq , sq - 10);

                if(RanksBrd[sq] == RANKS.RANK_7 && GameBoard.pieces[sq - 20] == PIECES.EMPTY)
                {
                    AddQuiteMove( MOVE(sq, sq - 20, PIECES.EMPTY, PIECES.EMPTY, MFlagPS) );
                }

            }
            if(GameBoard.pieces[sq - 9] != SQUARES.OFFBOARD && PieceCol[GameBoard.pieces[sq - 9]] == COLOURS.WHITE)
            {
                AddBlackPawnCaptureMove(sq , sq - 9, GameBoard.pieces[sq - 9]);
            }
            if(GameBoard.pieces[sq - 11] != SQUARES.OFFBOARD && PieceCol[GameBoard.pieces[sq - 11]] == COLOURS.WHITE)
            {
                AddBlackPawnCaptureMove(sq , sq - 11, GameBoard.pieces[sq - 11]);
            }
            if(GameBoard.enPas != SQUARES.NO_SQ)
            {
                if((sq - 9) == GameBoard.enPas)
                {
                    AddEnPassantMove( MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFlagEPAS) );
                }
                if((sq - 11) == GameBoard.enPas)
                {
                    AddEnPassantMove( MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFlagEPAS) );
                }
            }

        }


        if(GameBoard.castlePerm & CASTLEBIT.BKCA)
        {
            if(GameBoard.pieces[SQUARES.F8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G8] == PIECES.EMPTY)
            {
                if(!SqAttacked(SQUARES.E8,COLOURS.WHITE) && !SqAttacked(SQUARES.F8,COLOURS.WHITE) && !SqAttacked(SQUARES.G8,COLOURS.WHITE))
                {

                    AddQuiteMove(MOVE(SQUARES.E8, SQUARES.G8, PIECES.EMPTY, PIECES.EMPTY, MFlagCastlePerm));
                }
            }
        }
        if(GameBoard.castlePerm & CASTLEBIT.BQCA)
        {
            if(GameBoard.pieces[SQUARES.D8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.B8] == PIECES.EMPTY)
            {
                if(!SqAttacked(SQUARES.E8,COLOURS.WHITE) && !SqAttacked(SQUARES.D8,COLOURS.WHITE) && !SqAttacked(SQUARES.C8,COLOURS.WHITE) )
                {
                    AddQuiteMove(MOVE(SQUARES.E8, SQUARES.C8, PIECES.EMPTY, PIECES.EMPTY, MFlagCastlePerm));
                }
            }
        }



    }
    pieceIndex = LoopNonSlideIndex[GameBoard.side];
    pieceType = LoopNonSlidePiece[pieceIndex++];
    while (pieceType)
    {
        for(var i = 0;i < GameBoard.pieceNum[pieceType]; i++)
        {
            sq = GameBoard.pieceList[pieceType * 10 + i];
            for(var index = 0; index < DirNum[pieceType]; index++)
            {
                t_sq = sq + PieceDir[pieceType][index];
                if(GameBoard.pieces[t_sq] == SQUARES.OFFBOARD)
                {
                    continue;
                }
                if(GameBoard.pieces[t_sq] != PIECES.EMPTY)
                {

                    if(PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side)
                    {
                    //    console.log('Capture Move for pieceType : ' + pieceChar[pieceType] + ' From : ' + sq +' target square : ' + t_sq);
                        AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                    }
                }
                else
                {
                    AddQuiteMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                }
            }
        }
        pieceType = LoopNonSlidePiece[pieceIndex++];
    }

    pieceIndex = LoopSlideIndex[GameBoard.side];
    pieceType = LoopSlidePiece[pieceIndex++];

    while (pieceType)
    {
        for(var i = 0; i < GameBoard.pieceNum[pieceType]; i++)
        {
            sq = GameBoard.pieceList[pieceType * 10 + i];

            for(var index = 0; index < DirNum[pieceType]; index++)
            {
                dir = PieceDir[pieceType][index];
                t_sq = sq + dir;
                //if(pieceType == PIECES.wR)
                //    console.log('SQ : ' + sq);

                while(GameBoard.pieces[t_sq] != SQUARES.OFFBOARD)
                {
                //    if(pieceType == PIECES.wR)
                //        console.log('for dir:' + dir + ' t_sq : ' + t_sq);
                    if(GameBoard.pieces[t_sq] != PIECES.EMPTY)
                    {
                        if(PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side)
                        {
                            AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                        }
                        break;
                    }
                    AddQuiteMove(MOVE(sq, t_sq, PIECES.EMPTY, PIECES.EMPTY, 0));
                    t_sq += dir;
                }

            }
        }
        pieceType = LoopSlidePiece[pieceIndex++];
    }
}

function GenerateCaptureMoves()
{
    GameBoard.moveListStart[GameBoard.ply + 1] = GameBoard.moveListStart[GameBoard.ply];
    var pieceType, sq;
    var pieceIndex,piece,t_sq;
    if(GameBoard.side == COLOURS.WHITE)
    {
        pieceType = PIECES.wP;
        for(var pieceNum = 0; pieceNum < GameBoard.pieceNum[pieceType]; pieceNum++)
        {
            var sq = GameBoard.pieceList[pieceType * 10 + pieceNum];

            if(GameBoard.pieces[sq + 9] != SQUARES.OFFBOARD && PieceCol[GameBoard.pieces[sq + 9]] == COLOURS.BLACK)
            {
                AddWhitePawnCaptureMove(sq , sq + 9, GameBoard.pieces[sq + 9]);
            }
            if(GameBoard.pieces[sq + 11] != SQUARES.OFFBOARD && PieceCol[GameBoard.pieces[sq + 11]] == COLOURS.BLACK)
            {
                AddWhitePawnCaptureMove(sq , sq + 11, GameBoard.pieces[sq + 11]);
            }
            if(GameBoard.enPas != SQUARES.NO_SQ)
            {
                if((sq + 9) == GameBoard.enPas)
                {
                    AddEnPassantMove( MOVE(sq, sq + 9, PIECES.EMPTY, PIECES.EMPTY, MFlagEPAS) );
                }
                if((sq + 11) == GameBoard.enPas)
                {
                    AddEnPassantMove( MOVE(sq, sq + 11, PIECES.EMPTY, PIECES.EMPTY, MFlagEPAS) );
                }
            }

        }


    }
    else
    {
        pieceType = PIECES.bP;
        for(var pieceNum = 0; pieceNum < GameBoard.pieceNum[pieceType]; pieceNum++)
        {
            var sq = GameBoard.pieceList[pieceType * 10 + pieceNum];
            if(GameBoard.pieces[sq - 9] != SQUARES.OFFBOARD && PieceCol[GameBoard.pieces[sq - 9]] == COLOURS.WHITE)
            {
                AddBlackPawnCaptureMove(sq , sq - 9, GameBoard.pieces[sq - 9]);
            }
            if(GameBoard.pieces[sq - 11] != SQUARES.OFFBOARD && PieceCol[GameBoard.pieces[sq - 11]] == COLOURS.WHITE)
            {
                AddBlackPawnCaptureMove(sq , sq - 11, GameBoard.pieces[sq - 11]);
            }
            if(GameBoard.enPas != SQUARES.NO_SQ)
            {
                if((sq - 9) == GameBoard.enPas)
                {
                    AddEnPassantMove( MOVE(sq, sq - 9, PIECES.EMPTY, PIECES.EMPTY, MFlagEPAS) );
                }
                if((sq - 11) == GameBoard.enPas)
                {
                    AddEnPassantMove( MOVE(sq, sq - 11, PIECES.EMPTY, PIECES.EMPTY, MFlagEPAS) );
                }
            }

        }



    }
    pieceIndex = LoopNonSlideIndex[GameBoard.side];
    pieceType = LoopNonSlidePiece[pieceIndex++];
    while (pieceType)
    {
        for(var i = 0;i < GameBoard.pieceNum[pieceType]; i++)
        {
            sq = GameBoard.pieceList[pieceType * 10 + i];
            for(var index = 0; index < DirNum[pieceType]; index++)
            {
                t_sq = sq + PieceDir[pieceType][index];
                if(GameBoard.pieces[t_sq] == SQUARES.OFFBOARD)
                {
                    continue;
                }
                if(GameBoard.pieces[t_sq] != PIECES.EMPTY)
                {

                    if(PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side)
                    {
                    //    console.log('Capture Move for pieceType : ' + pieceChar[pieceType] + ' From : ' + sq +' target square : ' + t_sq);
                        AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                    }
                }
            }
        }
        pieceType = LoopNonSlidePiece[pieceIndex++];
    }

    pieceIndex = LoopSlideIndex[GameBoard.side];
    pieceType = LoopSlidePiece[pieceIndex++];

    while (pieceType)
    {
        for(var i = 0; i < GameBoard.pieceNum[pieceType]; i++)
        {
            sq = GameBoard.pieceList[pieceType * 10 + i];

            for(var index = 0; index < DirNum[pieceType]; index++)
            {
                dir = PieceDir[pieceType][index];
                t_sq = sq + dir;
                //if(pieceType == PIECES.wR)
                //    console.log('SQ : ' + sq);

                while(GameBoard.pieces[t_sq] != SQUARES.OFFBOARD)
                {
                //    if(pieceType == PIECES.wR)
                //        console.log('for dir:' + dir + ' t_sq : ' + t_sq);
                    if(GameBoard.pieces[t_sq] != PIECES.EMPTY)
                    {
                        if(PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side)
                        {
                            AddCaptureMove(MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0));
                        }
                        break;
                    }

                    t_sq += dir;
                }

            }
        }
        pieceType = LoopSlidePiece[pieceIndex++];
    }
}
