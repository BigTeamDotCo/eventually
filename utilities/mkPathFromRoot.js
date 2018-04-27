const fs = require('fs'),
    path = require('path');

module.exports = function mkPathFromRootSync(rootDir, targetDir) {
    if (!path.isAbsolute(rootDir)) throw new Error('mkPathFromRootSync: Use absolute paths');
    const sep = path.sep;
    const sepRegExp = new RegExp(`${sep}$`);
    if (sepRegExp.test(rootDir)) rootDir = rootDir.substr(0, rootDir.length - 1);
    const targetDirSplit = targetDir.split(sep);
    targetDirSplit.reduce((preDir, curFolder) => {
        const curDir = `${preDir}${sep}${curFolder}`;
        try {
            fs.mkdirSync(curDir);
        } catch (e) {}
        return curDir;
    }, rootDir);
    return;
};
