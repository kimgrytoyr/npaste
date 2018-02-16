FROM node:9.5.0 as builder

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /home/node/app

COPY src/package*.json ./

RUN npm install && npm cache clean --force

FROM node:9.5.0-alpine as app

ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV NPM_CONFIG_PREFIX=$NPM_CONFIG_PREFIX
ENV PATH /home/node/.npm-global/bin:$PATH

WORKDIR /home/node/app

RUN npm install nodemon -g && mkdir -p /home/node/app/data && chown -R node:node /home/node/
VOLUME /home/node/app/data

COPY --chown=node:node --from=builder /home/node/app/node_modules node_modules/
COPY --chown=node:node ./src ./src

USER node:node

WORKDIR /home/node/app/src
CMD ["node", "bin/www"]
