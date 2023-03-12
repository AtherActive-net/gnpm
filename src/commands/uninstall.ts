import { readPackageJson, writePackageJson } from "../lib/packageJson.js";
import { PACKAGE_JSON_PATH } from "../lib/packageJson.js";
import {exec} from "child_process";
import { getPackageMetaData } from "../lib/common.js";
import { installAll } from "./install.js";


export async function uninstallPackageCommand(pkg:string) {
    const pjson = await readPackageJson(await PACKAGE_JSON_PATH);
    const metadata = await getPackageMetaData(pkg, pjson.dependencies[pkg]);

    pkg = metadata["name"];

    pjson.dependencies[pkg] = undefined;
    await writePackageJson(pjson);

    const packageDependencies = await getPacakgeDependencies(pkg);
    await Promise.all(packageDependencies.map(async (dependency) => { await uninstall(dependency) }));
    await installAll();

    console.log(`Uninstalled ${pkg} and obsolute dependencies`);
}

export async function uninstall(packageName:string) {
    await deleteSymLink(packageName);
}

async function deleteSymLink(pkg:string) {
    const workingDir:string = (await PACKAGE_JSON_PATH).replace('/package.json','');
    const symLinkPath:string = `${workingDir}/node_modules/${pkg}`;

    exec(`rm -f ${symLinkPath}`, (err, stdout, stderr) => {
    })
}

async function getPacakgeDependencies(pkg) {
    let totalDependencies = [];
    const pkgJsonPath = (await PACKAGE_JSON_PATH).replace('/package.json','')+`/node_modules/${pkg}/package.json`;
    let packageJson = undefined;
    try {
        packageJson = await readPackageJson(pkgJsonPath);
    } catch {
        return []
    }
    if(!packageJson?.dependencies) return [];
    const dependencies = Object.keys(packageJson.dependencies);

    dependencies.forEach(async (dependency) => {
        totalDependencies.push(dependency);
        totalDependencies = totalDependencies.concat(await getPacakgeDependencies(dependency));
    })

    return totalDependencies;
}
