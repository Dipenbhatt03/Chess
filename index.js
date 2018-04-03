var express = require("express");
var morgan = require('morgan')
var nunjucks = require("nunjucks");
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser")
var routes = require('./routes/router')
var http = require('http');

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);


//app.use(morgan('dev'));

nunjucks.configure("views" , {
	autoescape : true,
	express : app
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

var lobbyUsers = {};
var users = {};
var activeGames = {};
var white = '0', black = '1';

io.on('connection', function(socket)
{

	console.log('Socket Connected : ' + socket.id);

	socket.on('login', function(username)
	{
		socket.userid = username;
		users[username] = {username : socket, games : {}};

		socket.emit('login', { usersOnline : Object.keys(lobbyUsers)});

		lobbyUsers[username] = socket;

		socket.broadcast.emit('joinedLobby', username);

	});


	socket.on('invite', function(username)
	{
		console.log('Invide came from : ' + socket.userid + ' to : ' + username);

		socket.broadcast.emit('leaveLobby', socket.userid);
		socket.broadcast.emit('leaveLobby', username);

		var game = {
						id : Math.floor(Math.random() * 100000  + 1),
						GameBoard : {},
						users : { white : socket.userid, black : username }
					};
		socket.gameId = game.id;
		activeGames[game.id] = game;

		users[game.users.white].games[game.id] = game.id;
		users[game.users.black].games[game.id] = game.id;


		lobbyUsers[game.users.white].emit('joingame', { game : game , color : white });
		lobbyUsers[game.users.black].emit('joingame', { game : game , color : black });





		delete lobbyUsers[socket.userid];
		delete lobbyUsers[username];



	});

	socket.on('Move', function(moveData)
	{
		console.log('Move From ; ' + socket.userid + ' oponentName : ' + moveData.enemy);
	//	console.log(users[moveData.enemy].username);

		users[moveData.enemy].username.emit('Move', { move : moveData.move });
	});

});

app.use('/', routes.Router);


server.listen(8080);

module.exports = app;
