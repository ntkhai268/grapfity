FROM expressgateway/express-gateway:latest
WORKDIR /var/lib/eg

COPY package.json ./
RUN npm install


COPY . .

EXPOSE 8080
CMD ["node", "server.js"]