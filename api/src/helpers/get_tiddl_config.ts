import { execSync } from "child_process";
import fs from "fs";

import { TiddlConfig } from "../types";

export function get_tiddl_config() {
  try {
    const token_output = fs.readFileSync("/root/tiddl.json", "utf-8");
    return JSON.parse(token_output) as TiddlConfig;
  } catch (error) {
    return undefined;
  }
}