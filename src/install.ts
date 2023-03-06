import {exec} from "child_process";
import os from "os";
import fs from "fs";

export async function doesPackageExist(packageName, version) {
    return new Promise((resolve, reject) => {
        exec(`npm view ${packageName}@${version} version`, (error, stdout, stderr) => {
            if (error) {
                console.log(`Package ${packageName}@${version} does not exist`);
                resolve(false);
                return;
            }
            if (stderr) {
                console.log(`Package ${packageName}@${version} does not exist`);
                resolve(false);
                return;
            }
            console.log(`Package ${packageName}@${version} exists`);
            resolve(true);
        });
    });
}

export function createPackageFolderIfNeeded(packageName, version) {
    const packageFolder = `${os.homedir()}/.gnpm/modules/${packageName}-${version}`;

    if (!fs.existsSync(packageFolder)) {
        fs.mkdirSync(packageFolder);
    }
    return packageFolder;
}

export async function installPackage(packageName,version) {
    const folder = createPackageFolderIfNeeded(packageName, version);
    const command = `
        cd ${folder} &&
        npm install ${packageName}@${version} &&
        mkdir -p ${process.cwd()}/node_modules
    `

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error && error.code === 1) {
                console.log(`Something went wrong while installing package ${packageName}@${version}\n ${error.message}`);
                resolve(false);
                return;
            }
            console.log(`Package ${packageName}@${version} installed`);
            resolve(true);
            return;
        })
    })
}
"ln -s ${process.cwd()}/node_modules/${packageName} ${folder}/node_modules/${packageName}"
export function createSymLinks(packageName,version) {
    console.log("Creating symlinks...")

    const packageFolder = `${os.homedir()}/.gnpm/modules/${packageName}-${version}`;
    const packageNodeModules = `${packageFolder}/node_modules`;

    const folderContents = fs.readdirSync(packageNodeModules);

    let command = `
        cd ${packageNodeModules}`

    folderContents.forEach((dir) => {
        if(!fs.lstatSync(`${packageNodeModules}/${dir}`).isDirectory()) return;
        command += ` && ln -s ${packageNodeModules}/${dir} ${process.cwd()}/node_modules/${dir}`
    })

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`Something went wrong while creating symlinks\n ${error.message}`);
                resolve(false);
                return;
            }
            resolve(true);
        })
    })
}