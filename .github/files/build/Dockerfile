# syntax=docker/dockerfile:1.6.0@sha256:ac85f380a63b13dfcefa89046420e1781752bab202122f8f50032edf31be0021
FROM --platform=$BUILDPLATFORM busybox:latest@sha256:5c63a9b46e7139d2d5841462859edcbbf57f238af891b6096578e5894cfe5ae2 AS env
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

FROM scratch
COPY --from=env --chmod=755 binary .
ENTRYPOINT ["./binary"]
