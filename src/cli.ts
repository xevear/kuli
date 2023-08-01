import SSHKey from "./lib/SSHKey";
import server from "./server";
import startChildProcess from "./lib/startChildProcess";

new SSHKey()
  .init()
  .then((pass) => {
    startChildProcess();
    server(pass);
  })
  .catch(console.error);
