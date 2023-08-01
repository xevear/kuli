import { Request, Response } from "express";
import path from "path";
import { z } from "zod";

import config from "../config";
import verifySignature from "./verifySignature";
import exec from "./exec";

const schema = z.object({ ref: z.string() });

type Schema = z.infer<typeof schema>;

interface RequestBody extends Request {
  body: Schema;
}

const gitPull =
  (passphrase: string) => async (req: RequestBody, res: Response) => {
    if (!verifySignature(req)) {
      res.status(401).end();
      return;
    }

    const payload = schema.safeParse(req.body);

    if (!payload.success) {
      res.status(400).json({ errors: payload.error.flatten() });
      return;
    }

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
