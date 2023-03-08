#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
import os from "os";
import {exec} from "child_process";
import { Command } from "commander";
import pjson from "../package.json" assert {type: "json"};

import { createFolderIfNotExists } from "./prereqs.js";
import { installPackage} from "./install.js";
import { PACKAGE_JSON_PATH, readPackageJson, writePackageJson } from "./lib/common.js";

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
        let packageJson = await readPackageJson();
        options.version = options.version ? options.version : "latest"

        console.log("Installing package", pkg, "with version", options.version)
        const metadata = await installPackage(pkg,options.version,true);
        if(!metadata) return;

        if(!packageJson.dependencies) packageJson.dependencies = {};
        packageJson.dependencies[pkg] = metadata.version;
        await writePackageJson(packageJson);
    });

program.command("node")
    .description("Run a script with node")
    .argument("<script>", "Script to run")
    .action(async (script:string) => {
        console.log("Running script", script)

        const child = exec(`node --preserve-symlinks ${script}`, {cwd: process.cwd()});
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

    })

program.parse();