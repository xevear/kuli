import express from "express";
import { AddressInfo } from "net";
import config from "./config";
import gitPull from "./lib/gitPull";

export default function main(passphrase: string) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post("/api/v1/hooks", gitPull(passphrase));

  const server = app.listen(config.port, () => {
    const { port } = server.address() as AddressInfo;
    console.log("Listening on port:", port);
  });
}
