FROM node:18.20.8

# Set working directory
WORKDIR /grabtify/backend

# Copy package files & install dependencies
COPY package*.json ./
RUN npm install && npm install -g @babel/core @babel/cli

# Copy full backend source code
COPY . .

# Cài sqlcmd và công cụ kết nối MSSQL
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y curl apt-transport-https gnupg2 software-properties-common locales tzdata unixodbc libgssapi-krb5-2 && \
    locale-gen en_US.UTF-8 && \
    curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg && \
    install -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/microsoft.gpg && \
    sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/ubuntu/20.04/prod focal main" > /etc/apt/sources.list.d/mssql-release.list' && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev && \
    ln -s /opt/mssql-tools/bin/* /usr/local/bin && \
    rm -f microsoft.gpg


# Chờ SQL Server sẵn sàng
COPY wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

# Khởi chạy backend
CMD ["/bin/bash", "/wait-for-db.sh"]
