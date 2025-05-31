#!/bin/bash

# Khởi động SQL Server ở chế độ nền
/opt/mssql/bin/sqlservr &

# Hàm kiểm tra SQL Server đã sẵn sàng chưa
wait_for_sql() {
    echo "Đang chờ SQL Server khởi động..."
    local i=0
    while [ $i -lt 30 ]; do
        /opt/mssql-tools/bin/sqlcmd -S mssql -U sa -P "$SA_PASSWORD" -d master -Q "SELECT 1" &> /dev/null
        if [ $? -eq 0 ]; then
            echo "SQL Server đã sẵn sàng"
            return 0
        else
            echo "Chưa kết nối được, thử lại sau 5 giây..."
            sleep 5
            ((i++))
        fi
    done
    echo "Không thể kết nối tới SQL Server sau 30 lần thử"
    return 1
}

# Chờ SQL Server khởi động hoàn toàn
wait_for_sql

# Kiểm tra xem database đã tồn tại chưa trước khi chạy script
DB_EXISTS=$(/opt/mssql-tools/bin/sqlcmd -S mssql -U sa -P "$SA_PASSWORD" -d master -Q "SET NOCOUNT ON; SELECT CASE WHEN DB_ID('DB_Graptify') IS NOT NULL THEN 1 ELSE 0 END" -h -1 -W)

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "Database chưa tồn tại, đang chạy script khởi tạo..."
    /opt/mssql-tools/bin/sqlcmd -S mssql -U sa -P "$SA_PASSWORD" -d master -i /usr/src/app/script.sql
else
    echo "Database DB_Graptify đã tồn tại, bỏ qua khởi tạo"
fi

# Giữ container chạy
tail -f /dev/null