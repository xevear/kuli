import { execSync } from "child_process";
import config from "../config";

export default function startChildProcess() {
  [...config.command.build, ...config.command.start].forEach((cmd) => {
    console.log(`Executing '${cmd}' at ${process.cwd()}`);
    const stdout = execSync(cmd, { cwd: process.cwd() });
    console.log(stdout.toString());
  });
}
