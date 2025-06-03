USE [master];
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.databases
    WHERE name = N'DB_Graptify'
)
BEGIN
    CREATE DATABASE [DB_Graptify]
      CONTAINMENT = NONE
      ON PRIMARY
      ( NAME = N'DB_Graptify',
        FILENAME = N'/var/opt/mssql/data/DB_Graptify.mdf',
        SIZE = 73728KB,
        MAXSIZE = UNLIMITED,
        FILEGROWTH = 65536KB )
      LOG ON
      ( NAME = N'DB_Graptify_log',
        FILENAME = N'/var/opt/mssql/data/DB_Graptify_log.ldf',
        SIZE = 73728KB,
        MAXSIZE = 2048GB,
        FILEGROWTH = 65536KB );
END
ELSE
BEGIN
    PRINT 'Database DB_Graptify already exists, skipping creation.';
END
GO

WAITFOR DELAY '00:00:05';
GO

ALTER DATABASE [DB_Graptify]
    SET COMPATIBILITY_LEVEL = 160;
GO

USE [DB_Graptify];
GO

-- IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
-- BEGIN
--     EXEC sp_fulltext_database @action = 'enable';
-- END
-- GO
