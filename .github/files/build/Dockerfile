# syntax=docker/dockerfile:1.8.1@sha256:e87caa74dcb7d46cd820352bfea12591f3dba3ddc4285e19c7dcd13359f7cefd
FROM --platform=$BUILDPLATFORM busybox:1.36.1-uclibc@sha256:97d85ff9630b634ddff3e3ff69fd02bc3b69de8dba0c5002eb0ad6915d1bf4c0 AS env
ARG TARGETPLATFORM
RUN --mount=type=bind,source=artifact,target=artifact \
    if [ "$TARGETPLATFORM" = 'darwin/amd64' ]; then\
      cp artifact/x86_64-apple-darwin/binary .\
    ;elif [ "$TARGETPLATFORM" = 'darwin/arm64' ]; then\
      cp artifact/aarch64-apple-darwin/binary .\
    ;elif [ "$TARGETPLATFORM" = 'linux/amd64' ]; then\
      cp artifact/x86_64-unknown-linux-musl/binary .\
    ;elif [ "$TARGETPLATFORM" = 'linux/arm64' ]; then\
      cp artifact/aarch64-unknown-linux-musl/binary .\
    ;fi

FROM --platform=$BUILDPLATFORM scratch as runner
COPY --from=env --chmod=755 binary .
ENTRYPOINT ["./binary"]
