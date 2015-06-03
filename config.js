module.exports = function() {
    return {
        UPLOAD_PATH: '/shang/update',
        UPLOAD_HISTORY: '/shang/uploadhistory',
        WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN || '4test',
        DOWNLOAD_PATH: {}
    }
};