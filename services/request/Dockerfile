FROM node:20-alpine

# installing openssl for prisma to work properly
RUN apk update && apk add --no-cache openssl

WORKDIR /app
COPY package.json yarn.lock  ./

RUN yarn install

COPY prisma ./prisma
RUN npx prisma generate 

COPY . .

EXPOSE 5001

CMD [ "yarn", "dev" ]