// Builds the sandbox image that runs submitted solutions (judge/Dockerfile),
// unless it is already present. `predev` and `prebuild` run this.
//
// Docker not being available is not an error here: the site still starts, and
// a submission then fails with a message naming `npm run judge:build`.
import { spawnSync } from "node:child_process";

const IMAGE = "uzcode-judge:1";

const inspect = spawnSync("docker", ["image", "inspect", IMAGE], {
  stdio: "ignore",
  windowsHide: true,
});

if (inspect.error) {
  console.warn(
    "⚠ Docker topilmadi — tekshiruvchi yig'ilmadi. Docker Desktop'ni yoqib, `npm run judge:build` ni ishga tushiring.",
  );
  process.exit(0);
}

if (inspect.status === 0) {
  console.log(`${IMAGE}: tayyor`);
  process.exit(0);
}

console.log(`${IMAGE} yig'ilmoqda (birinchi marta bir necha daqiqa oladi)…`);

const build = spawnSync("docker", ["build", "-t", IMAGE, "judge"], {
  stdio: "inherit",
  windowsHide: true,
});

if (build.status !== 0) {
  console.warn(
    "⚠ Tekshiruvchi yig'ilmadi. Docker Desktop ochiq ekanini tekshirib, `npm run judge:build` ni qayta ishga tushiring.",
  );
}
