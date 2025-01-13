FROM kong:latest
USER root

RUN apt-get update && apt-get install -y nodejs npm && npm install -g kong-pdk

USER kong