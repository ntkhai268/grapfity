FROM node:18.20.8

WORKDIR /grabtify/backend

COPY package*.json ./

RUN npm install && npm install -g @babel/core @babel/cli 

COPY . .

RUN apt-get update && \
    apt-get install -y curl apt-transport-https gnupg && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/11/prod.list -o /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev && \
    ln -s /opt/mssql-tools/bin/* /usr/local/bin/

# 🟢 Copy script kiểm tra DB tồn tại
COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

CMD ["/bin/bash", "/wait-for-db.sh"]
