var Emitter = require('events').EventEmitter,
	protocol = require('./protocol.js'),
	MESSAGE_TYPE = protocol.MESSAGE_TYPE,
	PROTOCOL_NAME = protocol.NAME,
	WebSocketConnection = require('./WebSocketConnection.js'),
	its = require('its'),
	P;

P = module.exports = function(emitter){
	its.defined(emitter);
	this.emitter = emitter;

    this.connectionMap = {};
    this.connectionList = [];
};

P.create = function(options){
	options = options || {};
	var emitter = options.emitter || new Emitter(),
		p = new P(emitter);

	return p.getApi();
};

P.prototype.getApi = function(){
	var api = {};

	api.on = this.on.bind(this);
	api.removeListener = this.removeListener.bind(this);
	api.to = this.to.bind(this);

	Object.defineProperty(api, 'connections', {
		get: this.getConnections.bind(this)
	});

	return api;
};

P.prototype.getConnections = function(){
	return this.connectionList.slice(0);
};

P.prototype.createWebSocketConnection = WebSocketConnection.create;

P.prototype.to = function(address){
	var webSocketConnection = this.createWebSocketConnection(this, address),
		api = webSocketConnection.getApi();

	// When the connection opens, add it to the connection pool
	api.on('open', this.connectionHandler.bind(this, api));
	
	return api;
};

P.prototype.on = function(){
	this.emitter.on.apply(this.emitter, arguments);
	return this;
};

P.prototype.removeListener = function(){
	this.emitter.removeListener.apply(this.emitter, arguments);
	return this;
};

P.prototype.connectionHandler = function(connection){
	connection.on('connection', this.connectionHandler.bind(this));
    connection.on('close', this.connectionCloseHandler.bind(this, connection));
    
    this.connectionMap[connection.id] = connection;
    this.connectionList.push(connection);
    
    this.emitter.emit("connection", connection);
};

P.prototype.connectionCloseHandler = function(connection){
    var index = this.connectionList.indexOf(connection);
    this.connectionList.splice(index, 1);
    delete this.connectionMap[connection.id];

    this.emitter.emit("disconnection", connection);
};