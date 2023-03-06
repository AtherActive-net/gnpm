import os from "os";
import {exec} from "child_process";
import { Command } from "commander";
import pjson from "../package.json" assert {type: "json"};

import { createFolderIfNotExists } from "./prereqs.js";
import { 
    doesPackageExist,
    installPackage,
    createSymLinks,
 } from "./install.js";

const program = new Command();
createFolderIfNotExists(os.homedir() + "/.gnpm");

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
        if(!await doesPackageExist(pkg, options.version)) return
        if(!await installPackage(pkg, options.version)) return
        if(!await createSymLinks(pkg, options.version)) return
    });

program.parse();