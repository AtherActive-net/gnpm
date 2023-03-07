#!/opt/homebrew/bin/node
import os from "os";
import {exec} from "child_process";
import { Command } from "commander";
import pjson from "../package.json" assert {type: "json"};

import { createFolderIfNotExists } from "./prereqs.js";
import { installPackage} from "./install.js";

const program = new Command();

program
    .name("test")
    .version(pjson.version)
    .description(pjson.description);

program.command("install")
    .description("Install a package")
    .argument("<package>", "Package to install")
    .option('-v, --version <version>', 'Version to install')
    .action(async (pkg:string, options) => {
        options.version = options.version ? options.version : "latest"

        console.log("Installing package", pkg, "with version", options.version)
        await installPackage(pkg,options.version,true);
    });

program.command("run")
    .description("Run a script")
    .argument("<script>", "Script to run")
    .action(async (script:string) => {
        console.log("Running script", script)

        const child = exec(`node --preserve-symlinks ${script}`, {cwd: process.cwd()});
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

    })

program.parse();