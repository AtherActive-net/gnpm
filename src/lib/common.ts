import os from "os";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

import { fetchNpm } from "./fetch.js";

export const PACKAGE_JSON_PATH = getClosestPackageJson();

export async function getPackageMetaData(name,version) {
    const versionRegex = /(\d+\.)?(\d+\.)?(\*|\d+)/;
    const foundVersion = versionRegex.exec(version);
    const finalVersion = (version == "latest" ? 'latest' : foundVersion[0])

    console.log("Fetching metadata for: ", name, "@", finalVersion)
    return await fetchNpm('/' + name + '/' + finalVersion);
}

export function getCacheFolder() {
    return `${os.homedir()}/.gnpm`;
}

export function isInstalled(pkg,version) {
    const modulePath = `${getCacheFolder()}/modules/${pkg}-${version}`;
    return fs.existsSync(modulePath);
}

export async function createModuleDir(pkg,version) {
    const modulePath = `${getCacheFolder()}/modules/${pkg}-${version}`;
    if(!fs.existsSync(modulePath)) {
        fs.mkdirSync(modulePath, { recursive: true });
    }
}

export function getVersion(metadata) {
    const versionRegex = /(\d+\.)?(\d+\.)?(\*|\d+)/;
    const foundVersion = versionRegex.exec(metadata.version);
    return foundVersion[0];
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

export async function getClosestPackageJson() {
    let currentPath = process.cwd();
    while(currentPath != "/") {
        const packageJson = path.join(currentPath,"package.json");
        if(fs.existsSync(packageJson)) {
            console.log(`Found package.json at ${packageJson}`)
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