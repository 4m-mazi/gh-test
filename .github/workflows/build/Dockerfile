# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM busybox:latest@sha256:3fbc632167424a6d997e74f52b878d7cc478225cffac6bc977eedfe51c7f4e79 AS env
ARG TARGETPLATFORM
ARG BINARY_NAME=rust-ci-test
RUN --mount=type=bind,source=artifact,target=artifact \
    if [ "$TARGETPLATFORM" = 'darwin/amd64' ]; then\
      cp artifact/x86_64-apple-darwin/"$BINARY_NAME" .\
    ;elif [ "$TARGETPLATFORM" = 'darwin/arm64' ]; then\
      cp artifact/aarch64-apple-darwin/"$BINARY_NAME" .\
    ;elif [ "$TARGETPLATFORM" = 'linux/amd64' ]; then\
      cp artifact/x86_64-unknown-linux-musl/"$BINARY_NAME" .\
    ;elif [ "$TARGETPLATFORM" = 'linux/arm64' ]; then\
      cp artifact/aarch64-unknown-linux-musl/"$BINARY_NAME" .\
    ;elif [ "$TARGETPLATFORM" = 'windows/amd64' ]; then\
      cp artifact/x86_64-pc-windows-msvc/"$BINARY_NAME".exe "$BINARY_NAME"\
    ;fi

FROM scratch
COPY --from=env --chmod=755 rust-ci-test .
ENTRYPOINT ["./rust-ci-test"]
