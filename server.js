// Module varibles.
var express = require('express');
var application = express();
var server = require('http').createServer(application);
var io = require('socket.io').listen(server);

// User and connection arrays.
// Keeps track of how many users there are and how many connections have been made.
users = [];
connections = [];

// Server listening on port 3000.
server.listen(process.env.PORT || 3000);
console.log('Server is running...');

// Server delivers the index.html when connected to port 3000.
application.get('/', function(req, res)
{
	res.sendFile(__dirname + '/index.html');
});

// On a connection to the server, push the connection onto the connection array.
io.sockets.on('connection', function(socket)
{
	connections.push(socket);
	console.log('Connection: %s sockets currently connected.', connections.length);
	
	// On a disconnection, get rid of the user from the user array, get rid of the 
	// the connection in the connection array, and update the usernames.
	socket.on('disconnect', function(data)
	{
		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnection: %s sockets currently connected.', connections.length);
	});
	
	// On a "send message" from the client, emit a new message with the username and message.
	socket.on('send message', function(data)
	{
		console.log('Data sent: ' + data);
		io.sockets.emit('new message', {message: data, user: socket.username});
	});
	
	// On a "new user" from the client, callback, add that user to the user array, and
	// update the usernames.
	socket.on('new user', function(data, callback)
	{
		callback(true);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});
	
	// Function to update the usernames to the client.
	function updateUsernames()
	{
		io.sockets.emit('get users', users);
	}
});