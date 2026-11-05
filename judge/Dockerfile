# Sandbox image for running submitted solutions.
#
# One container per submission, started by lib/judge-docker.ts. The job
# (language, source, tests) arrives on stdin and the report leaves on stdout,
# so the container needs no mounts, no network and no writable layer.
#
# Rebuild after changing this file or driver.mjs, and bump the tag in
# scripts/ensure-judge-image.mjs so running installs pick the new image up.
FROM node:22-bookworm-slim

# python3 and g++ are the other two languages in lib/languages.ts.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 g++ \
  && rm -rf /var/lib/apt/lists/*

COPY driver.mjs /opt/driver.mjs

RUN useradd --create-home --uid 10001 runner
USER runner
WORKDIR /tmp

ENTRYPOINT ["node", "/opt/driver.mjs"]
