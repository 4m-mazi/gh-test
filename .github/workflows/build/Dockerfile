# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM busybox:latest AS env
ARG TARGETPLATFORM
RUN --mount=type=bind,source=artifact,target=artifact \
    if [ "$TARGETPLATFORM" = 'darwin/amd64' ]; then\
      cp artifact/x86_64-apple-darwin/rust-ci-test .\
    ;elif [ "$TARGETPLATFORM" = 'darwin/arm64' ]; then\
      cp artifact/aarch64-apple-darwin/rust-ci-test .\
    ;elif [ "$TARGETPLATFORM" = 'linux/amd64' ]; then\
      cp artifact/x86_64-unknown-linux-musl/rust-ci-test .\
    ;elif [ "$TARGETPLATFORM" = 'linux/arm64' ]; then\
      cp artifact/aarch64-unknown-linux-musl/rust-ci-test .\
    ;elif [ "$TARGETPLATFORM" = 'windows/amd64' ]; then\
      cp artifact/x86_64-pc-windows-msvc/rust-ci-test.exe rust-ci-test\
    ;else false \
    ;fi

FROM scratch
COPY --from=env --chmod=755 rust-ci-test .
ENTRYPOINT ["./rust-ci-test"]
