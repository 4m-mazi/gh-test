# syntax=docker/dockerfile:1.6.0@sha256:ac85f380a63b13dfcefa89046420e1781752bab202122f8f50032edf31be0021
FROM --platform=$BUILDPLATFORM busybox:1.36.1-uclibc@sha256:27441c673d7b790259201123b4fe396a6115f35e7afb6e11f576be2b48a171cd AS env
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
