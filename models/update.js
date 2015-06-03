var q = require('q');
var exec = require('child_process').exec;
var update_history = [];

var config = require('../config')();

var COMMANDS = {
    'git': 'git clone {DOWNLOAD_PATH}',
    'rm_exists': 'rm -rf {DIR_PATH}',
    'rm_public': 'rm -rf ./public',
    'mkdri_public': 'mkdir public',
    'cp': 'cp -rf ./{DIR_PATH}/* ./public/'
};

var GITNAMEOPTION = ['oschina', 'coding'];

function update(str, res) {
    var hookInfo = {};
    if (typeof str === 'object') {
        hookInfo = str;
    }
    else {
        try {
            hookInfo = JSON.parse(str);
        }
        catch (e) {
        }
    }

    var answer = {};

    // https://git.oschina.net/xinshangshangxin/ngMusic.git
    // https://github.com/xinshangshangxin/ngMusic.git
    // https://git.coding.net/xinshangshangxin/DaoCloudBlog.git

    // coding
    if (hookInfo.repository) {
        answer.url = hookInfo.repository.https_url;
        answer.token = hookInfo.token;
    }// gitoschina
    else if (hookInfo.push_data && hookInfo.push_data.repository) {
        answer.url = hookInfo.push_data.repository.homepage.replace(/^http/, 'https');
        answer.token = hookInfo.password;
    }
    else {
        console.log(hookInfo.push_data);
        res.send('验证回复');
        console.log('验证');
        return;
    }

    var gitName = '';
    for (var i = 0; i < GITNAMEOPTION.length; i++) {
        if (new RegExp('[\\/\\.]' + GITNAMEOPTION[i] + '\\.').test(answer.url)) {
            gitName = GITNAMEOPTION[i];
            break;
        }
    }
    answer.hookInfo = hookInfo;

    var isnext = saveIntoHistotry(answer);
    if (!isnext) {
        res.send('token 错误');
    }
    else {
        var dirName = answer.url.replace(/.*\//i, '').replace('.git', '');
        if (dirName.length === 0) {
            res.send('dirName 错误');
            return;
        }

        var cmds = [
            COMMANDS.rm_exists.replace('{DIR_PATH}', dirName),
            COMMANDS.git.replace('{DOWNLOAD_PATH}', answer.url),
            COMMANDS.rm_public,
            COMMANDS.mkdri_public,
            COMMANDS.cp.replace('{DIR_PATH}', dirName)
        ];

        execCmdStack(cmds, function(error) {
            var history = {
                type: 'update',
                updated_at: new Date().toString()
            };
            history.status = error ? 'error' : 'success';
            update_history.push(history);
        });

        res.send('开始执行');
    }
}

function execCmdStack(cmds, callback) {

    execCmd(cmds[0])
        .then(function() {
            return execCmd(cmds[1])
        })
        .then(function() {
            return execCmd(cmds[2])
        })
        .then(function() {
            return execCmd(cmds[3])
        })
        .then(function() {
            return execCmd(cmds[4])
        })
        .then(function() {
            callback && callback('success');
        })
        .catch(function(e) {
            console.log(e);
            callback && callback(e);
        });

    //var cmd = cmds.shift();
    //if (cmd) {
    //    if (typeof cmd === 'function') {
    //        try {
    //            cmd();
    //        }
    //        catch (e) {
    //            console.log('cmd error', e);
    //        }
    //    }
    //    else {
    //        execCmd(cmd, function(error) {
    //            if (!error) {
    //                execCmdStack(cmds, callback);
    //            }
    //            if (cmds.length === 0) {
    //                callback && callback(error);
    //            }
    //        });
    //    }
    //}
    //else {
    //    callback && callback();
    //}
}

function execCmd(cmd) {
    var defered = q.defer();
    console.log('Executing command: ', cmd);
    exec(cmd, function(error, stdout, stderr) {
        //console.error('stdout: ' + stdout);
        //console.error('stderr: ' + stderr);
        if (error !== null) {
            defered.reject(error);
            console.error('exec error: ' + error);
        }
        else {
            defered.resolve('success');
            console.log('success');
        }
    });

    return defered.promise;
}

function saveIntoHistotry(args) {
    if (args.token == config.WEBHOOK_TOKEN) {
        var history = generateHistory(args);
        update_history.push(history);
        return true;
    }
    return false;
}

function generateHistory(args) {
    var history = {};
    history.updated_at = new Date().toString();
    history.type = 'webhook';
    history.info = args.hookInfo;
    return history;
}

exports.update = update;
exports.getUpdateHistory = function() {
    return update_history;
};