import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT_PATH = process.cwd();

const configurationFiles = {
  env: {
    source: join(ROOT_PATH, ".env.example"),
    destination: join(ROOT_PATH, ".env.development"),
  },
};

function useCreateEnv(): Record<string, string> {
  const PUBLIC_URL = "http://localhost:4321";
  const PUBLIC_MEDIA_URL = ""; // TODO: Add a proper R2 emulation route.

  return {
    PUBLIC_URL,
    PUBLIC_MEDIA_URL,
  };
}

const envExample = readFileSync(configurationFiles.env.source, "utf-8")
  .replace("<your-public-url>", useCreateEnv().PUBLIC_URL)
  .replace("<your-public-media-url>", useCreateEnv().PUBLIC_MEDIA_URL);

writeFileSync(configurationFiles.env.destination, envExample);
console.log(
  `\nCreated file ${configurationFiles.env.destination} with values:\n`,
);

for (let key in useCreateEnv()) {
  console.log(`${key}=${useCreateEnv()[key]}`);
}
