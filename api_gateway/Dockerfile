FROM node:16
WORKDIR /var/lib/eg
COPY package.json ./
RUN npm install
# COPY ./config/gateway.config.yml gateway.config.yml
# COPY ./config/system.config.yml system.config.yml
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]