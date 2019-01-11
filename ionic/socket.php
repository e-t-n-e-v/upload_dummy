<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
	<!--script data-main="scripts/main" src="https://rawgit.com/radu-matei/websocket-manager/master/src/WebSocketManager.Client.TS/dist/WebSocketManager.js"></script>-->
<script type="text/javascript">

	// var connection = new WebSocketManager.Connection('ws://8.8.8.153:5000/app');

	// connection.connectionMethods.onConnected = () => {
	//     //optional
	//     console.log("You are now connected! Connection ID: " + connection.connectionId);
 //    }
	// connection.start();
	var connection = new WebSocket('ws://8.8.8.153:5000/app');

	connection.onopen = function () {
		console.log("Open");

	  connection.send('Ping'); // Send the message 'Ping' to the server
	};
	// Log errors
	connection.onerror = function (error) {
	  console.log('WebSocket Error ' + error);
	};

	// Log messages from the server
	connection.onmessage = function (e) {
	  console.log('Server: ' + e.data);
	};
</script>
</body>
</html>