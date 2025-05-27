IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DB_Graptify')
BEGIN
    CREATE DATABASE DB_Graptify;
END;
GO