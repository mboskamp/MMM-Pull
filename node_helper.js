const git = require('simple-git/promise');
const path = require("path");
const promiseReflect = require("promise-reflect");
const { exec } = require('child_process');

var repositories = {};

module.exports = NodeHelper.create({

    socketNotificationReceived: function (notification, payload) {
        var self = this;
        if (notification === "PULL") {
            this.pullModule(payload);
        } else if (notification === "PULL_ALL_MODULES") {
            this.pullAllModules(payload);
        } else if (notification === "PULL_MIRROR") {
            this.pullMirror();
        } else if (notification === "PULL_EVERYTHING") {
            this.pullEverything(payload);
        } else if (notification === "TEST"){
            self.sendSocketNotification("TEST", "test");
        }else if(notification === "EXECUTE_SCRIPT"){
            exec(payload, (err, stdout, stderr) => {
                if(err){
                    self.sendSocketNotification("EXECUTION_ERROR", stderr);
                }else{
                    self.sendSocketNotification("EXECUTION_SUCCESS", stdout);
                }
            });
            return;
        }
        if (Object.keys(repositories).length > 0) {
            var result = {};
            var pullPromises = Object.values(repositories).map(this.pullRepository);
            Promise.all(pullPromises.map(promiseReflect)).then(pullResults => {
                console.log(pullResults);
                pullResults.forEach(function (item, index) {
                    result[Object.keys(repositories)[index]] = item;
                });
                self.sendSocketNotification('PULL_RESULT', result);
            });
        }
    },

    pullModule: function (moduleName) {
        repositories[moduleName] = path.normalize(__dirname + "/../../modules/" + moduleName);
    },

    pullAllModules: function (modules) {
        var self = this;
        modules.forEach(function (module) {
            self.pullModule(module);
        });
    },

    pullMirror: function () {
        repositories["mirror"] = path.normalize(__dirname + "/../../");
    },

    pullEverything: function (modules) {
        this.pullAllModules(modules);
        this.pullMirror();
    },

    pullRepository: async function (localPath) {
        console.log("pulling repository at " + localPath);
        var repository = git(localPath);
        return await repository.pull();
    }
});
