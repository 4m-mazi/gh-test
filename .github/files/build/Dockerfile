# syntax=docker/dockerfile:1.7.0@sha256:dbbd5e059e8a07ff7ea6233b213b36aa516b4c53c645f1817a4dd18b83cbea56
FROM --platform=$BUILDPLATFORM busybox:1.36.1-uclibc@sha256:f7ca678e57fbee8ea8a49e62835725c6f48bde5e90913637918efe1ecf315235 AS env
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
