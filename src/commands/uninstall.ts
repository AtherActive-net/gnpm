import { readPackageJson, writePackageJson } from "../lib/packageJson.js";
import { PACKAGE_JSON_PATH } from "../lib/packageJson.js";
import {exec} from "child_process";


export async function uninstallPackage(pkg:string) {
    // TODO: Resolve dependencies
    const packageJson = await readPackageJson();
    delete packageJson.dependencies[pkg];
    await writePackageJson(packageJson);
    await deleteSymLink(pkg);
}

async function deleteSymLink(pkg:string) {
    const workingDir:string = (await PACKAGE_JSON_PATH).replace('/package.json','');
    const symLinkPath:string = `${workingDir}/node_modules/${pkg}`;
    console.log('done')

    exec(`rm ${symLinkPath}`, (err, stdout, stderr) => {
        if (err) {
            console.log(err);
            return;
        }

        console.log(`Uninstalled package ${pkg}`)
    })
}

async function getPacakgeDependencies(pkg) {
    // Find the dependencies of the package, and the dependencies of the dependencies etc..
    let totalDependencies = [];
    const pkgJsonPath = (await PACKAGE_JSON_PATH).replace('/package.json','')+`/node_modules/${pkg}/package.json`;
    const packageJson = await readPackageJson(pkgJsonPath);
    if(!packageJson.dependencies) return [];
    const dependencies = Object.keys(packageJson.dependencies);

    dependencies.forEach(async (dependency) => {
        totalDependencies.push(dependency);
        totalDependencies.push(await getPacakgeDependencies(dependency));
    })

    return totalDependencies;
}