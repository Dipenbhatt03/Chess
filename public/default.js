
var socket;
var usersOnline = [];
var username;
var playerName;
var oponentName;
var socket = io();




socket.on('login', function(users)
{
    usersOnline = users.usersOnline;

    console.log(usersOnline);
    UpdateUsersOnlineList();
});

socket.on('joinedLobby', function(username)
{
    addUser(username);
    UpdateUsersOnlineList();
});

socket.on('leaveLobby', function(username)
{
    console.log(username);
    removeUser(username);
});

socket.on('joingame', function(game)
{
    if(game.color == COLOURS.WHITE)
    {
        playerName = game.game.users['white'];
        oponentName = game.game.users['black'];
    }
    else
    {
        playerName = game.game.users['black'];
        oponentName = game.game.users['white'];
    }
    START_GAME(game);
    $('#page-login').hide();
    $('#page-lobby').hide();
    $('#Game').show();
    $('#EngineStatus').hide();
});

socket.on('Move', function(moveData)
{

    MakeMove(moveData.move);
    GameBoard.ply = 0;
    InitPiecesSquares(GameController.PlayerSide);
    printBoard();
    CheckGame();


});

$('#playEngine').on('click', function()
{
    console.log("hello");
    GameBoard.playAgainstEngine = true;
    START_GAME({});
    $('#page-login').hide();
    $('#page-lobby').hide();
    $('#Game').show();

});

$("#login").on('click',function()
{
    username = $('#username').val();

    if(username.length > 0)
    {

        $('#userLabel').text(username);
        socket.emit('login', username);
        console.log($('page-login'));
        $('#page-login').hide();
        $('#page-lobby').show();
    }
});


function addUser(username)
{
    usersOnline.push(username);

}

function removeUser(username)
{
    var index = usersOnline.indexOf(username);
    if(index > -1)
    {
        usersOnline.splice(index, 1);
    }


    UpdateUsersOnlineList();
}


function UpdateUsersOnlineList()
{
    document.getElementById('userList').innerHTML = '';
    usersOnline.forEach(function(user)
    {


        $('#userList').append($('<button>')
                        .text(user)
                        .on('click',function()
                        {
                            socket.emit('invite', user);
                        }));
    });
}

$(function()
{
    $('#Game').hide();
    $('#page-lobby').hide();
});
