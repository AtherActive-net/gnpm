import {exec} from "child_process"

export async function node(script:string) {
    console.log("Running script", script)

    const child = exec(`node --preserve-symlinks ${script}`, {cwd: process.cwd()});
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

}