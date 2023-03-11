import {exec} from "child_process";
import { readPackageJson } from "../lib/packageJson.js";

export async function run(script:string) {
    console.log("Running script", script)
    const packageJson = await readPackageJson();
    const scriptToRun = packageJson.scripts[script];
    if(!scriptToRun) {
        console.log("Script not found in package.json")
        return;
    }
    const child = exec(`${scriptToRun}`, {cwd: process.cwd()});
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
}