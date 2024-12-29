# Base image
FROM node:20-alpine

# configurations

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install 


COPY . .


EXPOSE 8081



# startup commands
CMD [ "yarn" , "dev" ]