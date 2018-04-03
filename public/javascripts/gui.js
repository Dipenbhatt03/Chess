$('.setFen').click(function()
{
    var fen = $('.fenIn').val();
    NewGame(fen);
    CheckGame();
    printBoard();

});

function ClickedSquareInfo(e)
{

    var classString = e.attr("class").split(" ");
    var fileClass = classString[2];
    var rankClass = classString[1];
    var file = FILES[fileClass];
    var rank = RANKS[rankClass];
    SelectSquare(getSquare(fileClass, rankClass));
    return FR2SQ(file,rank);
}


function SelectSquare(square)
{
    square.attr("class", square.attr("class")  + ' Selected')

}

function getSquare(fileClass, rankClass)
{
    fileClass = '.' + fileClass;
    rankClass = '.' + rankClass;
    var square = $('.Square'+fileClass + rankClass);
    return square;
}



function DeSelectSquare(square)
{
    square.removeClass('Selected');
}

$(document).on('click','.Piece',function()
{
    if(UserMove.from == SQUARES.NO_SQ)
    {
        console.log('Piece Clicked');
        UserMove.from = ClickedSquareInfo($(this));

    }
    else
    {
        var square = ClickedSquareInfo($(this));
        var from = UserMove.from;
        if(PieceCol[GameBoard.pieces[UserMove.from]] != PieceCol[GameBoard.pieces[square]])
            UserMove.to = square;

        else UserMove.from = SQUARES.NO_SQ;


        var rankClass = "RANK_" +  (RanksBrd[from] + 1),
            fileClass ="FILE_" +  String.fromCharCode(parseInt(FilesBrd[from]) + 65);
        DeSelectSquare(getSquare(fileClass,rankClass));
        rankClass = "RANK_" +  (RanksBrd[square] + 1);
        fileClass ="FILE_" +  String.fromCharCode(parseInt(FilesBrd[square]) + 65);
        //console.log(fileClass,rankClass);

        DeSelectSquare(getSquare(fileClass,rankClass));

    }
    MakeUserMove();

});


$(document).on('click' , '.Square', function()
{
    if(UserMove.from != SQUARES.NO_SQ)
    {
        UserMove.to = ClickedSquareInfo($(this));

        var rankClass = "RANK_" +  (RanksBrd[UserMove.from] + 1),
            fileClass ="FILE_" +  String.fromCharCode(parseInt(FilesBrd[UserMove.from]) + 65);

        DeSelectSquare(getSquare(fileClass,rankClass));
        DeSelectSquare($(this));

        MakeUserMove();
    }
});

function TakeBackMove()
{
    if(GameBoard.hisPly > 0)
    {
        TakeMoveBack();
        GameBoard.ply = 0;
        InitPiecesSquares();
        printBoard();
        CheckGame();

    }

}

$("#MoveButton").on('click', function()
{
    if(GameBoard.side == COLOURS.BLACK)
        PreSearch();
    else
    {
        ShowBestMove();
    }
});

function MakeUserMove()
{
    if(GameBoard.side == GameController.PlayerSide)
    {

        if(UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ)
        {

            var move = ParseMove(UserMove.from, UserMove.to);

            if(move != NOMOVE)
            {

                MakeMove(move);
                InitPiecesSquares(GameController.PlayerSide);
                printBoard();
                CheckGame();
                console.log(GameBoard.ply);
                if(!GameBoard.playAgainstEngine)
                    socket.emit('Move', { move : move, enemy : GameBoard.oponentName});
                else
                    PreSearch();
            }

            UserMove.from = SQUARES.NO_SQ;
            UserMove.to = SQUARES.NO_SQ;
        }
    }
}

function NewGame(fen)
{
    ParseFen(fen);
    InitPiecesSquares();
}


$('#NewGameButton').on('click', function()
{
    NewGame(START_FEN);
});


function InitBoardSquares()
{
	var FileClass,
		RankClass,
		file,
		rank,
		Background,
		DivString = "",
		IsLight = 0;



	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--)
	{
		IsLight ^= 1;
		RankClass = "RANK_" + (rank + 1);
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++)
		{

			FileClass = "FILE_" + String.fromCharCode(parseInt(file) + 65);
			if(IsLight)
				Background = "Light";
			else Background = "Dark";

			DivString = "<div class = '" + "Square" + " " +
						 RankClass + " " + FileClass + " " + Background +"'></div>";
			IsLight ^= 1;
			$("#board").append(DivString);
			//console.log(DivString);
		}
	}



}

function ClearAllPiecesOnBoard()
{
    $('.Piece').remove();
}

function InitPiecesSquares(color)
{
    ClearAllPiecesOnBoard();
    var FileClass,
		RankClass,
		file,
		rank,
        sq,
        piece,
        ImageElement;

    for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--)
    {
        RankClass = "RANK_" + (rank + 1);
        for(file = FILES.FILE_A; file <= FILES.FILE_H; file++)
        {
            FileClass = "FILE_" + String.fromCharCode(parseInt(file) + 65);
            piece = GameBoard.pieces[FR2SQ(file, rank)];
            if(piece >= PIECES.wP && piece <= PIECES.bK)
            {
                ImageElement = "<img src = 'images/" + piece + ".png'" + " class = 'Piece " +
                                RankClass + " " + FileClass + " '>";

                $('#board').append(ImageElement);


            //    console.log(ImageElement);
            }
        }

    }

    if(color == COLOURS.BLACK && !GameBoard.playAgainstEngine)
    {
        $('#board').css({'transform' : 'rotate('+ 180 +'deg)'})
        $('.Piece').css({'transform' : 'rotate('+ 180 +'deg)'})
    }

    piece = GameBoard.pieces[FR2SQ(file, rank)];
}
