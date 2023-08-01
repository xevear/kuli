import { exec as nodeExec } from "child_process";
import util from "util";

const exec = util.promisify(nodeExec);

export default exec;
