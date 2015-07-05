/**
 * Protorust
 * An OxideMod Plugin
 *
 * @title 		Protorust
 * @author 		VisionMise
 * @version  	0.1.1
 * 
 *	Copyright 2015 VisionMise (Known Alias)
 *
 *	Licensed under the Apache License, Version 2.0 (the "License");
 *	you may not use this file except in compliance with the License.
 *	You may obtain a copy of the License at
 *
 *   	http://www.apache.org/licenses/LICENSE-2.0
 *
 *	Unless required by applicable law or agreed to in writing, software
 *	distributed under the License is distributed on an "AS IS" BASIS,
 *	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *	See the License for the specific language governing permissions and
 *	limitations under the License.
 */


/**
 * Server information
 */
var host 		= 'server.protorust.com';
var ssl 		= false;
var token 		= 'dfde64ccf5ed9490e5e699cc23b62838';


/**
 * Plugin information
 */
var title 		= 'protorust';
var version 	= V(0,1,1);
var author 		= 'VisionMise';
var resourceId 	= 0;


/**
 * Protorust Object
 */
var $ 			= function(context) {

	var self 		= this;

	this.context 	= {};

	this.init 		= function(context) {
		this.context 	= context;
		return this;
	};

	this.object 	= function() {
		if (!this.context) return {};

		var baseObject  = {
            "Title":        this.context.name,
            "Version":      this.context.version,
            "ResourceId":   this.context.resourceId,
            "Author":       this.context.author,
            "self":         this.context
        };

        for (var hook in this.context.hook) {
            baseObject[hook]    = this.context.hook[hook];
        }

        return baseObject;
	};

	this.console 	= function(textStr) {
		if (this.context && this.context.name) {
			print('[' + this.context.name + '] ' + textStr);
		} else {
			print(textStr);
		}

		return this;
	};

	this.broadcast 	= function() {
		return this;
	};

	this.data 		= function() {
		if (!this.context) return false;
		return this.context.data.GetData(this.context.name);
	};

	this.save 		= function() {
		if (!this.context) return false;
		this.context.data.SaveData(this.context.name);
		return this;
	};

	this.config 	= function() {
		if (!this.context) return false;
		return this.context.Config.Settings;
	};

	this.plugin 	= function() {
		if (!this.context) return false;
		return this.context.Plugin;
	};

	this.rust 		= function() {
		if (!this.context) return false;
		return this.context.rust;
	};

	this.consoleCommand = function(command, callback) {
		if (!this.context) return false;
		this.context.AddConsoleCommand(this.context.name + '.' + command, this.context.Plugin, callback);
		return this;
	};

	this.chatCommand 	= function(command, callback) {
		if (!this.context) return false;
		this.context.AddChatCommand(command, this.context.Plugin, callback);
		return this;
	};

	this.request 		= function(url, data, callback) {

		this.console("[" + this.context.type + "] Connecting to: " + url);
		webrequests.EnqueuePost(url, data, callback.bind(this.context), this.context.Plugin);

	};

	this.hook 			= function(hook, callback) {
		if (!this.context) return false;

		if (this.context.type == 'plugin') {
			this.context.hook[hook] 	= callback;
		} else if (this.context.type == 'server') {
			this.context.addListener(hook, callback);
		}

		return self;
	};

	return this.init(context);
};


var protoPlugin = function(pluginName, author, version, resourceId) {

	var self 	= this;

	this.name 		= pluginName;
	this.author 	= author;
	this.version 	= version;
	this.resourceId = resourceId;
	this.hook 		= {};
	this.type 		= null;

	this.init 		= function() {		
		this.type 	= 'plugin';
		return this;
	};

	return this.init();

};


var protoServer = function(host, token, ssl, client) {

	var self 		= this;

	this.url 		= '';
	this.host 		= '';
	this.ssl 		= false;
	this.type 		= null;
	this.hook 		= {};
	this.plugin 	= {};
	this.name 		= 'Server';

	this.init 		= function(host, token, ssl, client) {
		this.host 	= host;
		this.token 	= token;
		this.ssl 	= ssl;
		this.plugin = client;

		this.url 	= (this.ssl) ? 'https://' : 'http://';
		this.url   += this.host;
		this.type 	= 'server';

		return this;
	};


	this.addListener= function(eventHook, callback) {

		$(self.plugin).hook(eventHook, function(a1, a2, a3, a4, a5, a6) {
			print("Event: " + eventHook)
			var argStr 			= "event=" + eventHook + "&token=" + self.token;
			/**testing*/
			if (typeof a1 == 'object') {
				var type 	= a1.GetType();
				var api 	= $(self);
				var func 	= api[type];
				func(a1);
			}

			if (a1) argStr +=  "&0=" + JSON.stringify(a1);
			if (a2) argStr +=  "&1=" + JSON.stringify(a2);
			if (a3) argStr +=  "&2=" + JSON.stringify(a3);
			if (a4) argStr +=  "&3=" + JSON.stringify(a4);
			if (a5) argStr +=  "&4=" + JSON.stringify(a5);
			if (a6) argStr +=  "&5=" + JSON.stringify(a6);

			$(self.plugin).request(self.url, argStr, callback);
		});

	};


	return this.init(host, token, ssl, client);
};


var pluginObject= new protoPlugin(title, author, version, resourceId);
var hostObject 	= new protoServer(host, token, ssl, pluginObject);



$(pluginObject).hook('Init', function() {
	$(this).console("Initialized");
});

$(pluginObject).hook('OnServerInitialized', function() {
	$(this).console("Server Initialized");
});

$(pluginObject).hook('OnPlayerInit', function(player) {
	$(this).console(player.name + " Connected");
});

$(hostObject).hook('Init', function(code, result) {
	$(pluginObject).console("[" + code + "]: " + result);
});



var protorust = $(pluginObject).object();