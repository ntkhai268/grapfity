FROM node:18

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN find src/migrations -type f -name "*.js" -exec sh -c 'mv "$1" "${1%.js}.cjs"' _ {} \;

EXPOSE 8001

# CMD ["sh", "-c", "cd src && npx sequelize-cli db:migrate  && node server.js"]
CMD ["sh", "-c", "node src/server.js"]
