import { exec } from "child_process";
import { Request, Response } from "express";
import path from "path";
import config from "../config";
import verifySignature from "./verifySignature";

interface RequestBody extends Request {
  body: { ref: string };
}

const gitPull = (passphrase: string) => (req: RequestBody, res: Response) => {
  if (!verifySignature(req)) {
    res.status(401).end();
    return;
  }
  // Ref can be undefined, be aware handling body payload
  // Add body validation
  if (req.body.ref.split("/").pop() == config.branch) {
    exec(
      `expect ${path.join(
        __dirname,
        "..",
        "..",
        "scripts/git_pull.exp"
      )} '${passphrase}'`,
      (err, stdout) => {
        if (err) {
          res.status(500).end();
          console.error(err);
        } else {
          console.log(stdout);
          res.status(200).end();
        }
      }
    );
  } else {
    res.status(204).end();
  }
};

export default gitPull;
