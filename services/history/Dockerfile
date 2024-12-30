FROM node:20-alpine

RUN apk update && apk add --no-cache openssl

WORKDIR /app

COPY ./package.json ./yarn.lock ./
RUN yarn install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .


EXPOSE 5002

CMD [ "yarn", "dev" ]

