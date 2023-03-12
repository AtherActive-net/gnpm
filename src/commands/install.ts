import {exec} from "child_process";
import os from "os";
import fs from "fs";
import tar from "tar";

import { fetchArchive, fetchNpm } from "../lib/fetch.js";
import { createModuleDir, getPackageMetaData, getVersion, isInstalled } from "../lib/common.js";
import {PACKAGE_JSON_PATH, readPackageJson, writePackageJson} from "../lib/packageJson.js";

let fetchedDependencies = [];

export async function installAll() {
    let packageJson = await readPackageJson();
    const dependencies = Object.keys(packageJson.dependencies);
    for(const dependency of dependencies) {
        const metadata = await installPackage(dependency,packageJson.dependencies[dependency],true);
        if(!metadata) continue;
        packageJson.dependencies[dependency] = metadata.version;
    }
    await writePackageJson(packageJson);
}

export async function installPackage(name:string,version:string,root:boolean = false) {
    if(version  == "*") version = "latest";
    const metadata:any = await getPackageMetaData(name,version);
    if(metadata === "not found" || metadata == null) return false;

    version = getVersion(metadata)
    metadata.version = version;

    if(!isInstalled(name,version)) {
        await downloadPackage(metadata);
    } else {
        console.log(`Package ${name}@${version} found in cache`);
    }

    await createSymLink(metadata.name,metadata.version);

    if(metadata?.dependencies) await installDependencies(metadata);
    if(root) fetchedDependencies = new Array();
    return metadata
}

export async function downloadPackage(metadata) {
    console.log(`Downloading package ${metadata.name}@${metadata.version}...`)

    const archive = await fetchArchive(metadata.dist.tarball);
    if(archive === null) return false;

    await createModuleDir(metadata.name,metadata.version)

    // Write and extract tarball
    const packageFolder = `${os.homedir()}/.gnpm/modules/${metadata.name}-${metadata.version}`;
    fs.writeFileSync(`${packageFolder}/package.tar`, Buffer.from(archive));
    await extractTarball(packageFolder);
}


async function extractTarball(packageFolder: string) {
    await tar.x({
        file: `${packageFolder}/package.tar`,
        cwd: packageFolder,
        strip: 1
    });
}

async function installDependencies(metadata) {
    const dependencies = metadata.dependencies;

    const promises = [];
    for(const dependency in dependencies) {
        if(fetchedDependencies.includes(`${dependency}`)) continue;

        fetchedDependencies.push(`${dependency}`);
        promises.push(installPackage(dependency,dependencies[dependency]));
    }
    await Promise.all(promises);
}


export async function createSymLink(packageName,version) {
    const workingDir:string = (await PACKAGE_JSON_PATH).replace('/package.json','');
    if(!fs.existsSync(`${workingDir}/node_modules`)) fs.mkdirSync(`${workingDir}/node_modules`);

    const packageFolder = `${os.homedir()}/.gnpm/modules/${packageName}-${version}`;
    if(packageName.includes('/') && packageName.includes("@")) {
        const splitName = packageName.split('/')
        fs.mkdirSync(`${workingDir}/node_modules/${splitName[0]}`, {recursive: true})
    }

    let command = `ln -sf ${packageFolder} ${workingDir}/node_modules/${packageName}`
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`Something went wrong while creating symlinks\n ${error.message}`);
                resolve(false);
                return;
            }
            console.log(`Symlink created for ${packageName}@${version}`)
            resolve(true);
        })
    })
}