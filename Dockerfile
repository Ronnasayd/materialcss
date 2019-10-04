FROM node:8-alpine
ENV HOME /home/app/
COPY package.json yarn.lock $HOME
WORKDIR $HOME
RUN set -ex && apk update && \
  yarn global add --no-bin-links gulp-cli && \
  yarn global add --no-bin-links browser-sync && \
  yarn --no-bin-links
USER node
CMD ["gulp"]
