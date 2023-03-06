import fs from 'fs';
export function createFolderIfNotExists(folderPath) {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        fs.mkdirSync(folderPath + "/modules");
    }
}