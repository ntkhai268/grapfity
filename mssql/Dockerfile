FROM mcr.microsoft.com/mssql/server:2019-latest

USER root

ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=nhomnaymanhNhat1!
ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="$PATH:/opt/mssql-tools/bin"

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


COPY ./init/init.sql /usr/src/app/init.sql
COPY ./init/init.sh /usr/src/app/init.sh
RUN chmod +x /usr/src/app/init.sh

CMD ["/usr/src/app/init.sh"]
