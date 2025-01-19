FROM alpine:3.18

# Install required packages
RUN apk add --no-cache \
    docker-cli \
    inotify-tools \
    bash

WORKDIR /app

# Create the watch script
COPY  ./watch.sh .
RUN chmod +x /app/watch.sh

CMD ["sh ","/app/watch.sh"]