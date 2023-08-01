import { Request, Response } from "express";
import path from "path";
import config from "../config";
import verifySignature from "./verifySignature";
import exec from "./exec";

interface RequestBody extends Request {
  body: { ref: string };
}

const gitPull =
  (passphrase: string) => async (req: RequestBody, res: Response) => {
    if (!verifySignature(req)) {
      res.status(401).end();
      return;
    }
    // Ref can be undefined, be aware handling body payload
    // Add body validation
    if (req.body.ref.split("/").pop() == config.branch) {
      try {
        await exec(
          `expect ${path.join(
            __dirname,
            "..",
            "..",
            "scripts/git_pull.exp"
          )} '${passphrase}'`
        );
        for (const cmd of [...config.command.build, ...config.command.update]) {
          await exec(cmd);
        }
        res.status(200).end();
      } catch (err) {
        console.error(err);
        res.status(500).end();
      }
    } else {
      res.status(204).end();
    }
  };

export default gitPull;
