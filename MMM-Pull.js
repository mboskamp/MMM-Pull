Module.register("MMM-Pull", {

    defaults: {
        defaultModules: ["alert", "calendar", "clock", "compliments", "currentweather", "helloworld", "newsfeed", "updatenotification", "weatherforcast"],
        excludeModules: []
    },

    start: function () {
        //Nothing to do here. Waiting for notification.
        Log.log(this.name + ' is started!');
    },

    notificationReceived: function (notification, payload) {
        if (notification === 'ALL_MODULES_STARTED') {
            //All modules started. Start execution of module.
            this.getModuleNames();
        }
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "PULL_RESULT") {
            if (Object.keys(payload).length > 0) {
                for (var module in payload) {
                    var item = payload[module].data.summary;
                    var changes = item.changes;
                    var insertions = item.insertions;
                    var deletions = item.deletions;

                    if (payload[module].status === "resolved") {
                        var result = this.translate("TELEGRAM_PULL_SUCCESS", {"module": module});
                        var isResult = false;
                        if (typeof changes == "number" && changes > 0) {
                            result += "\r\nChanges: " + changes;
                            isResult = true;
                        }
                        if (typeof insertions == "number" && insertions > 0) {
                            result += "\r\nInsertions: " + insertions;
                            isResult = true;
                        }
                        if (typeof deletions == "number" && deletions > 0) {
                            result += "\r\nDeletions: " + deletions;
                            isResult = true;
                        }
                        if (!isResult) {
                            result += "\r\nAlready up to date."
                        }
                        this.sendNotification('TELBOT_TELL_ADMIN', result);
                    }
                    else {
                        this.sendNotification('TELBOT_TELL_ADMIN', this.translate("TELEGRAM_PULL_FAILED", {"module": module}));
                    }
                }
            }
        }else if(notification === "EXECUTION_ERROR"){
            console.log(notification + payload);
            this.sendNotification('TELBOT_TELL_ADMIN', this.translate("TELEGRAM_EXECUTION_FAILED") + (typeof payload === "string" ? "\r\nstderr: " + payload : ""));
        }else if(notification === "EXECUTION_SUCCESS"){
            console.log(typeof payload === "string");
            this.sendNotification('TELBOT_TELL_ADMIN', this.translate("TELEGRAM_EXECUTION_SUCCESS") + (typeof payload === "string" ? "\r\nstdout: " + payload : ""));
        }
    },

    getTranslations: function () {
        return {
            en: "translations/en.json",
            de: "translations/de.json"
        }
    },

    getModuleNames: function () {
        var self = this;
        var modules = MM.getModules();
        var tempModules = [];
        console.log(modules);
        modules.forEach(function (module) {
                if (self.config.defaultModules.indexOf(module.name) < 0 && self.config.excludeModules.indexOf(module.name) < 0) {
                    tempModules.push(module.name);
                }
            }
        );
        this.config.modules = tempModules;
        console.log(this.config.modules);
    },

    pullModule: function (commander, handler) {
        var module = handler.args;
        if (module == null) {
            handler.reply("TEXT", this.translate("TELEGRAM_MODULE_NOT_SPECIFIED"));
        } else if (this.config.defaultModules.indexOf(module) >= 0) {
            handler.reply("TEXT", this.translate("TELEGRAM_DEFAULT_MODULE_NOT_SUPPORTED", {module: module}));
        } else if (this.config.excludeModules.indexOf(module) >= 0) {
            handler.reply("TEXT", this.translate("TELEGRAM_MODULE_EXCLUDED", {module: module}));
        } else if (this.config.modules.indexOf(module) < 0) {
            handler.reply("TEXT", this.translate("TELEGRAM_MODULE_NOT_FOUND", {module: module}));
        } else {
            handler.reply("TEXT", this.translate("TELEGRAM_PULLING_ONE", {module: module}));
            this.sendSocketNotification("PULL", module);
        }
    },

    pullAllModules: function (commander, handler) {
        handler.reply("TEXT", this.translate("TELEGRAM_PULLING_ALL", {list: this.config.modules.join(",\r\n")}));
        this.sendSocketNotification("PULL_ALL_MODULES", this.config.modules);
    },

    pullMirror: function (commander, handler) {
        handler.reply("TEXT", this.translate("TELEGRAM_PULLING_MIRROR"));
        this.sendSocketNotification("PULL_MIRROR");
    },

    pullEverything: function (commander, handler) {
        handler.reply("TEXT", this.translate("TELEGRAM_PULLING_EVERYTHING", {list: this.config.modules.join(",\r\n")}));
        this.sendSocketNotification("PULL_EVERYTHING", this.config.modules);
    },

    restart: function (commander, handler) {
        handler.reply("TEXT", this.translate("TELEGRAM_EXECUTE_SCRIPT", {"script": this.config.restartScript}));
        this.sendSocketNotification("EXECUTE_SCRIPT", this.config.restartScript);
    },

    getCommands: function (commander) {
        commander.add({
            command: "pull",
            callback: "pullModule",
            description: "Pulls the latest version of the specified module.",
        });
        commander.add({
            command: "pullAllModules",
            callback: "pullAllModules",
            description: "Pulls the latest version of all active modules.",
        });
        commander.add({
            command: "pullMirror",
            callback: "pullMirror",
            description: "Pulls the latest version of MagicMirror.",
        });
        commander.add({
            command: "pullEverything",
            callback: "pullEverything",
            description: "Pulls all active modules, then pulls MagicMirror.",
        });
        if(this.config.restartScript){
            commander.add({
                command: "restart",
                callback: "restart",
                description: "Executes the restart script stated in MMM-Pull config."
            });
        }
    }
})
;