FROM mcr.microsoft.com/mssql/server:2019-latest

USER root

ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=nhomnaymanhNhat1!
ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="$PATH:/opt/mssql-tools/bin"

# Cài công cụ để cài mssql-tools
RUN apt-get update && \
    apt-get install -y curl apt-transport-https gnupg software-properties-common locales && \
    locale-gen en_US.UTF-8 && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list -o /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev && \
    ln -s /opt/mssql-tools/bin/* /usr/local/bin

# Copy script khởi tạo DB
COPY ./init/init.sql /usr/src/app/init.sql
COPY ./init/alt_db.sql /usr/src/app/alt_db.sql
COPY ./init/init.sh /usr/src/app/init.sh
RUN chmod +x /usr/src/app/init.sh

# Start SQL Server + run script tạo DB
CMD /bin/bash -c "/opt/mssql/bin/sqlservr & sleep 20 && /usr/src/app/init.sh"
