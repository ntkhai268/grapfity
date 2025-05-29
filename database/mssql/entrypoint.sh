#!/bin/bash

# Khởi động SQL Server ở chế độ nền
/opt/mssql/bin/sqlservr &



# Đợi SQL Server khởi động
echo "Đang chờ SQL Server khởi động..."
sleep 30

# Thử kết nối và kiểm tra database
/opt/mssql-tools/bin/sqlcmd -S mssql -U sa -P $SA_PASSWORD -i /usr/src/app/script.sql   
# /opt/mssql-tools/bin/sqlcmd -S mssql -U sa -P $SA_PASSWORD -i /usr/src/app/test.sql   
    
# Giữ container chạy
tail -f /dev/null