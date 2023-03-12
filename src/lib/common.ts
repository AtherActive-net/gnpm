import os from "os";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

import { fetchNpm } from "./fetch.js";
import {PACKAGE_JSON_PATH} from "./packageJson.js"

export async function getPackageMetaData(name,version) {
    const versionRegex = /(\d+\.)?(\d+\.)?(\*|\d+)/;
    const foundVersion = versionRegex.exec(version);
    const finalVersion = (version == "latest" ? 'latest' : (foundVersion == undefined ? "latest" : foundVersion[0]))

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

