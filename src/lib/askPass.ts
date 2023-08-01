import readline from "readline";
import MuteStream from "mute-stream";

export default function askPass() {
  return new Promise<string>((resolve) => {
    const prompt = "Enter passphrase: ";
    const ms = new MuteStream();
    ms.pipe(process.stdout);
    const rl = readline.createInterface({
      input: process.stdin,
      output: ms,
    });
    rl.question(prompt, resolve);
    ms.mute();
  });
}
