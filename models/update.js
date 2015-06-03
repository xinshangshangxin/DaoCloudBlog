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

var GITNAMEOPTION = ['oschina', 'github', 'coding'];


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

    if (!hookInfo.repository) {
        res.send('ok');
        console.log('验证');
        return;
    }


    var answer = {};
    answer.url = hookInfo.repository.https_url;
    // https://git.oschina.net/xinshangshangxin/ngMusic.git
    // https://github.com/xinshangshangxin/ngMusic.git
    // https://git.coding.net/xinshangshangxin/DaoCloudBlog.git

    var gitName = '';
    for (var i = 0; i < GITNAMEOPTION.length; i++) {
        if (new Regex(GITNAMEOPTION[i] + '\\.').test(answer.url) ) {
            gitName = GITNAMEOPTION[i];
            break;
        }
    }

    console.log(gitName);

    answer.token = exactToken(hookInfo, gitName || 'coding');
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
    var cmd = cmds.shift();
    if (cmd) {
        if (typeof cmd === 'function') {
            try {
                cmd();
            }
            catch (e) {
                console.log('cmd error', e);
            }
        }
        else {
            execCmd(cmd, function(error) {
                if (!error) {
                    execCmdStack(cmds, callback);
                }
                if (cmds.length === 0) {
                    callback && callback(error);
                }
            });
        }
    }
    else {
        callback && callback();
    }
}

function execCmd(cmd, callback) {
    console.log('Executing command: ', cmd);
    return child = exec(cmd, function(error, stdout, stderr) {
        console.error('stdout: ' + stdout);
        console.error('stderr: ' + stderr);
        if (error !== null) {
            console.error('exec error: ' + error);
        }
        callback(error);
    });
}


function exactToken(obj, gitname) {
    if (gitname === 'coding') {
        return obj.token;
    }
    else {
        return obj.password;
    }
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