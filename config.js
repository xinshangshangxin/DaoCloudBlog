module.exports = function() {
    return {
        UPLOAD_PATH: '/shang/update',           // WEBHOOK 的更新路径
        UPLOAD_HISTORY: '/shang/uploadhistory', // 显示更新日志的路径
        WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN || '4test' // WEBHOOK匹配的token; 建议使用环境变量
    }
};