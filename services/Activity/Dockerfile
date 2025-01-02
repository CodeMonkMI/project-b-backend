# Base image
FROM node:20-alpine

RUN apk update && apk add --no-cache openssl 

# configurations
WORKDIR /app

COPY ./package.json ./yarn.lock ./

RUN yarn install 
COPY prisma ./prisma
RUN npx prisma generate


COPY . .


EXPOSE 5004



# startup commands
CMD [ "yarn" , "dev" ]