import {exec} from "child_process";
import os from "os";
import fs from "fs";
import tar from "tar";

import { fetchArchive, fetchNpm } from "./lib/fetch.js";
import { createModuleDir, getPackageMetaData, getVersion, isInstalled } from "./lib/common.js";

let fetchedDependencies = [];

export async function installPackage(name:string,version:string,root:boolean = false) {
    const metadata:any = await getPackageMetaData(name,version);
    if(metadata === "not found") return false;

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



"ln -s ${process.cwd()}/node_modules/${packageName} ${folder}/node_modules/${packageName}"
export function createSymLink(packageName,version) {

    const packageFolder = `${os.homedir()}/.gnpm/modules/${packageName}-${version}`;


    let command = `ln -sf ${packageFolder} ${process.cwd()}/node_modules/${packageName}`

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