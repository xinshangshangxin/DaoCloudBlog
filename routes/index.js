var express = require('express');
var router = express.Router();

var update = require('../models/update');
var config = require('../config')();

// 更新日志
router
    .get('/', function(req, res) {
        res.render('../public/index.html');
    })
    .get(config.UPLOAD_HISTORY, function(req, res) {
        var token = req.query.token;
        
        if (token == config.WEBHOOK_TOKEN) {
            res.send(JSON.stringify(update.getUpdateHistory()));
        }
        else {
            res.end('加上正确的 token 参数再来好么~');
        }
    })
    .post(config.UPLOAD_PATH, function(req, res) {
        if (req.body.repository || req.body.push_data) {
            update.update(req.body, res);
        }
        else {
            // 本地测试使用
            // var str = '';
            // req.on('data', function(chunk) {
            //     str += chunk;
            // });
            // req.on('end', function() {
            //     update.update(str, res);
            // });

            res.send('ok');
            console.log('验证');
        }
    });

module.exports = router;
