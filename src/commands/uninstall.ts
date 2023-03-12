import { readPackageJson, writePackageJson } from "../lib/packageJson.js";
import { PACKAGE_JSON_PATH } from "../lib/packageJson.js";
import {exec} from "child_process";
import { getPackageMetaData } from "../lib/common.js";


export async function uninstallPackageCommand(pkg:string) {
    const pjson = await readPackageJson();
    const metadata = await getPackageMetaData(pkg, pjson.dependencies[pkg]);

    pkg = metadata["name"];

    const packageDependencies = await getPacakgeDependencies(pkg);

    console.log(`Uninstalled ${pkg} and obsolute dependencies`);

    for(const dependency of packageDependencies) {
        await uninstall(dependency);
    }
}

export async function uninstall(packageName:string) {

    try {
        const packageJson = await readPackageJson();
        if(packageJson && packageJson.dependencies && packageJson.dependencies[packageName]) delete packageJson.dependencies[packageName];
        await writePackageJson(packageJson);
        await deleteSymLink(packageName);
    } catch {
        await deleteSymLink(packageName);
    }

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
    const packageJson = await readPackageJson(pkgJsonPath);

    if(!packageJson.dependencies) return [];
    const dependencies = Object.keys(packageJson.dependencies);

    dependencies.forEach(async (dependency) => {
        totalDependencies.push(dependency);
        totalDependencies = totalDependencies.concat(await getPacakgeDependencies(dependency));
    })

    return totalDependencies;
}
