import { readFileSync } from "fs";
import path from "path";
import yaml from "js-yaml";
import { z } from "zod";

const Config = z.object({
  port: z
    .number()
    .default(0)
    .describe("Default webhooks port is 0 which means any available port."),
  branch: z.string().describe("Matched brach to pull."),
  email: z
    .string()
    .describe(
      "Email that used for generating SSH key. Pass it as firt arguments."
    ),
  key_algorithm: z
    .string()
    .default("ed25519")
    .describe("ed25519 (default) or rsa."),
  WEBHOOK_SECRET: z
    .string()
    .describe(
      "Secret token that used for validating webhooks request. Pass it as second arguments."
    ),
  command: z.object({
    build: z.array(z.string()),
    start: z.array(z.string()),
    update: z.array(z.string()),
  }),
});

type Config = z.infer<typeof Config>;

let config: Config;

try {
  config = yaml.load(
    readFileSync(path.resolve(process.cwd(), "kuli.yml"), "utf-8")
  ) as Config;
  if (!config) {
    throw new Error("File is empty");
  }
} catch (err) {
  if (err instanceof Error) {
    console.error("Failed to load ci.yml file: ");
    console.error(err.message);
  } else {
    console.error(err);
  }
  process.exit(1);
}

const argv = process.argv.slice(2);

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  return {
    // @ts-expect-error
    message: `${ctx.defaultError}. ${Config.shape[issue.path[0]].description}`,
  };
};

z.setErrorMap(customErrorMap);

config.email = argv[0];
config.WEBHOOK_SECRET = argv[1];

const parsedConfig = Config.safeParse(config);

if (!parsedConfig.success) {
  console.log("Received invalid configuration: ");
  console.log(parsedConfig.error.issues);
  process.exit(1);
}

config = parsedConfig.data;

export default config;
