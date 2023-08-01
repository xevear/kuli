import { execSync } from "child_process";
import config from "../config";

export default function startChildProcess() {
  [...config.command.build, ...config.command.start].forEach((cmd) => {
    console.log(`Executing '${cmd}'`);
    const stdout = execSync(cmd);
    console.log(stdout.toString());
  });
}
