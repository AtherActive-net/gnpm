#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
import {exec} from "child_process";
import { Command } from "commander";
import pjson from "../package.json" assert {type: "json"};
import { readPackageJson, writePackageJson } from "./lib/packageJson.js";

import { node } from "./commands/node";
import { installPackage} from "./commands/install.js";
import { run } from "./commands/run.js";

const program = new Command();

program
    .name("gnpm")
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
        await node(script);
    })

program.command("run")
    .description("Run a script defined in your package.json")
    .argument("<script>", "Script to run")
    .action(async (script:string) => {
        await run(script);
    })

program.parse();