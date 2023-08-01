import readline from "readline";
import { exec } from "child_process";
import MuteStream from "mute-stream";
import path from "path";
import config from "../config";
import generatePassword from "./generatePassword";
import authenticateGithub from "./authenticateGithub";

export default class SSHKey {
  passphrase: string;
  filename: string;
  key: null | string;

  constructor() {
    this.passphrase = "";
    this.key = null;
    this.filename = `id_${config.key_algorithm}.pub`;
  }

  async init() {
    this.key = await this.getKey();
    await authenticateGithub();
    console.log("Your SSH key: ");
    console.log(this.key);

    return this.passphrase;
  }

  askPass() {
    return new Promise<string>((resolve) => {
      const prompt = "Enter passphrase: ";
      const ms = new MuteStream();
      ms.pipe(process.stdout);
      const rl = readline.createInterface({
        input: process.stdin,
        output: ms,
      });
      rl.question(prompt, (pass) => {
        console.clear();
        rl.close();
        resolve(pass);
      });
      ms.mute();
    });
  }

  getExistingKey() {
    return new Promise<string>((resolve, reject) => {
      exec(`cat ~/.ssh/${this.filename}`, (err, stdout) =>
        err ? reject(err) : resolve(stdout)
      );
    });
  }

  getKey() {
    return new Promise<string>((resolve) => {
      exec("ls ~/.ssh", async (err, stdout) => {
        // Support only key types that appear on both sites
        // https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
        // https://confluence.atlassian.com/bitbucketserver066/ssh-access-keys-for-system-use-978197707.html
        // const supportedFilenames = ["id_rsa.pub", "id_ed25519.pub"];
        if (err || !stdout.includes(this.filename)) {
          this.passphrase = generatePassword();
          await this.generateNewKey();
        } else {
          this.passphrase = await this.askPass();
        }
        resolve(await this.getExistingKey());
      });
    });
  }

  generateNewKey() {
    return new Promise((resolve, reject) => {
      exec(
        `expect ${path.join(
          __dirname,
          "..",
          "..",
          "scripts/generate_new_key.exp"
        )} '${config.email}' '${this.passphrase}' ${config.key_algorithm}`,
        (err, stdout) => {
          if (err) reject(err);
          else {
            resolve(stdout);
          }
        }
      );
    });
  }
}
