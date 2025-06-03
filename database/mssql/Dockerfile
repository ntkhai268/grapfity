FROM mcr.microsoft.com/mssql/server:2019-latest

USER root

RUN apt-get update && \
    apt-get install -y curl apt-transport-https gnupg && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/10/prod.list -o /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev && \
    ln -sfn /opt/mssql-tools/bin/* /usr/local/bin/ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


# Copy init script vào container
COPY ./script.sql /usr/src/app/
COPY ./entrypoint.sh /usr/src/app/

# Cấp quyền thực thi
RUN chmod +x /usr/src/app/entrypoint.sh

USER mssql

# Override entrypoint
ENTRYPOINT ["/bin/bash", "/usr/src/app/entrypoint.sh"]

