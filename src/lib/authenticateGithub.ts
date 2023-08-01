import { exec } from "child_process";

export default function authenticateGithub() {
  return new Promise((resolve, reject) => {
    exec("ssh-keyscan github.com >> ~/.ssh/known_hosts", (err, stdout) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
}
