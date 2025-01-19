FROM node:18-alpine

WORKDIR /app

# Install required packages
RUN apk add --no-cache \
    docker-cli \
    curl \
    docker.io

# Install docker-compose binary
RUN curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose
# Install nodemon globally
RUN npm install -g nodemon



# Create watcher script
COPY <<EOF /app/watch.js
const { execSync } = require('child_process');
const path = require('path');
console.log('Kong watcher started...');

function rebuildAndRestartKong() {
    try {
        console.log('Change detected - Rebuilding Kong...');
       
    } catch (error) {
        console.log(error)
        console.error('<< Error rebuilding/restarting Kong >>:', error.message);
    }
}

// Initial build
rebuildAndRestartKong();
EOF

CMD ["nodemon", "--watch", "/app/kong", "-e", "yml,yaml,js,json", "--legacy-watch", "/app/watch.js"]