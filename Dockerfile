FROM node:8-alpine
RUN set -ex && apk update && \
  yarn global add --no-bin-links gulp-cli && \
  yarn global add --no-bin-links browser-sync
USER node
WORKDIR /app
CMD yarn --no-bin-links && gulp
