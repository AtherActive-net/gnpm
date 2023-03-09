import os from "os";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

export const PACKAGE_JSON_PATH = getClosestPackageJson();

export async function getClosestPackageJson() {
    let currentPath = process.cwd();
    while(currentPath != "/") {
        const packageJson = path.join(currentPath,"package.json");
        if(fs.existsSync(packageJson)) {
            return packageJson;
        }
        currentPath = path.dirname(currentPath);
    }
    await createPackageJson();
    return await getClosestPackageJson();
}

export async function readPackageJson() {
    const file = fs.readFileSync(await PACKAGE_JSON_PATH);
    return JSON.parse(file.toString());
}

export async function writePackageJson(data) {
    fs.writeFileSync(await PACKAGE_JSON_PATH, JSON.stringify(data,null,4));
}

export async function createPackageJson() {
    return new Promise((resolve,reject) => {
        const child = exec(`npm init -y`, {cwd: process.cwd()});
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        child.on("exit", () => {
            resolve(true);
        })
    })
}