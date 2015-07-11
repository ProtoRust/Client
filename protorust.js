/**
 * Protorust
 * An OxideMod Plugin
 *
 * @title 		Protorust
 * @author 		VisionMise
 * @version  	0.1.3
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
var version 	= V(0,1,3);
var author 		= 'VisionMise';
var resourceId 	= 0;


/**
 * Advanced Control
 */
var checkinInterval = 100;
var printLevel      = 1;


/** 
 * Definitions
 */
var core = function() {

    this.objects    = {};


    this.event_Init                 = {
        'type': ['null']
    };

    this.event_OnTick               = {
        'type': ['null']
    };

    this.event_OnServerInitialized  = {
        'type': ['null']
    };

    this.event_OnPlayerInit         = {
        'type': ['player']
    };

    this.event_OnPlayerDisconnected = {
        'type': ['player']
    };

    this.event_OnPlayerRespawned    = {
        'type': ['player']
    };

    this.event_OnEntityTakeDamage   = {
        'type': ['combatEntity', 'hitInfo']
    };

    this.objects.player             = function(objectRef) {
        return {
            'displayName':          objectRef.displayName   || 'string',
            'userID':               objectRef.userID        || 'string'
        };
    };

    this.objects.combatEntity       = function(objectRef) {

    };

    this.objects.hitInfo            = function(objectRef) {

    };

    return this;
};


/**
 * Protorust Object
 */
var $ 			= function(context) {

	var self 		= this;

	this.context 	= {};
    this.core       = core;
    this.printLevel = 1;
    
	this.init 		= function(context) {
		this.context 	= context;
        this.printLevel = printLevel;
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

	this.console 	= function(textStr, weight) {
        if (!weight) weight = this.printLevel;

        var source  = (weight == -1) ? '[Error] ' : '';
        if (this.context && this.context.name) {
            source += "(" + this.context.name + ") ";
        } else {
            source += "(Protorust) ";
        }

        var output  = source + textStr;
        if (parseInt(weight) <= parseInt(this.printLevel)) {
            print(output);            
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

    this.sleep      = 0;
    this.sleepTime  = 100;

	this.init 		= function() {		
		this.type         = 'plugin';
        this.sleepTime    = checkinInterval;
		return this;
	};

    this.serverCheckin  = function(host) {        
        $(this).request(host.url, 'token=' + host.token + '&event=checkin', function(code, result) {
            $(this).console("Checked In [" + code + "]: " + result, 3);
        });
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
    this.token      = '';

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
            $(self.plugin).console("Server Event: " + eventHook, 3);

            var args            = [a1,a2,a3,a4,a5,a6];
            var argStr          = "event=" + eventHook + "&token=" + self.token;
            var typeFunc        = "event_" + eventHook;
            var typeNames       = $(self.plugin).core()[typeFunc]['type'];
            var argBuffer       = {};

            for (var i = 0; i <= typeNames.length - 1; i++) {
                var typeName    = typeNames[i];

                if (typeName != 'null') {
                    var objDef  = JSON.stringify($(self.plugin).core().objects[typeName](args[i]));
                    argStr += "&type=" + typeName + "&object=" + objDef;
                    argBuffer[typeName] = args[i];
                }
            };
            
            $(self.plugin).console("Sending: " + argStr, 3);
            $(self.plugin).request(self.url, argStr, function(code, result) {
                callback(code, result, argBuffer, self.url, argStr);
            });
        });

    };

    this.parseResult    = function(result) {

    };


	return this.init(host, token, ssl, client);
};


var pluginObject= new protoPlugin(title, author, version, resourceId);
var hostObject 	= new protoServer(host, token, ssl, pluginObject);



$(pluginObject).hook('Init', function() {
	$(this).console("Initialized", 1);
});

$(pluginObject).hook('OnServerInitialized', function() {
	$(this).console("Server Initialized", 1);
});

$(pluginObject).hook('OnPlayerInit', function(player) {
	$(this).console(player.name + " Connected", 2);
});

$(pluginObject).hook('OnTick', function() {
    pluginObject.sleep++;

    if (pluginObject.sleep >= pluginObject.sleepTime) {
        $(pluginObject).console("Checkin", 3);
        pluginObject.sleep  = 1;
        pluginObject.serverCheckin(hostObject);
    }

});

$(hostObject).hook('Init', function(code, result, argBuffer) {
	$(pluginObject).console("[" + code + "]: " + result, 3);
});

$(hostObject).hook('OnPlayerInit', function(code, result, argBuffer) {
    $(pluginObject).console("[" + code + "]: " + result + " - " + argBuffer.player.displayName, 3);
});

$(hostObject).hook('OnPlayerDisconnected', function(code, result, argBuffer) {
    $(pluginObject).console("[" + code + "]: " + result, 3);
});

$(hostObject).hook('OnPlayerRespawned', function(code, result, argBuffer) {
    $(pluginObject).console("[" + code + "]: " + result, 3);
});

var protorust = $(pluginObject).object();