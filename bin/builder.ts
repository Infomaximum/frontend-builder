#!/usr/bin/env node

import commander from "commander";
import { registerCommands } from "../src/arguments";

const cli = new commander.Command();

process.title = "im-builder";

registerCommands(cli);

cli.parse(process.argv);
