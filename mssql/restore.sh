#!/bin/bash
set -e  # Ngắt script nếu bất kỳ lệnh nào lỗi
echo "Restoring database from backup..."

sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "
RESTORE DATABASE [DB_Graptify]
FROM DISK = N'/var/opt/mssql/backup/GraptifyDB_backup.bak'
WITH MOVE 'DB_Graptify' TO '/var/opt/mssql/data/DB_Graptify.mdf',
     MOVE 'DB_Graptify_log' TO '/var/opt/mssql/data/DB_Graptify_log.ldf',
     REPLACE
"

echo "Restore completed!"
