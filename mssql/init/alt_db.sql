-- === 1. XÓA CÁC CỘT KHÔNG DÙNG TRONG Metadata ===
BEGIN TRY
    ALTER TABLE Metadata DROP COLUMN explicit;
END TRY
BEGIN CATCH
    PRINT 'Không thể xóa cột explicit (có thể không tồn tại)';
END CATCH;
GO

BEGIN TRY
    ALTER TABLE Metadata DROP COLUMN danceability;
END TRY
BEGIN CATCH
    PRINT 'Không thể xóa cột danceability (có thể không tồn tại)';
END CATCH;
GO

BEGIN TRY
    ALTER TABLE Metadata DROP COLUMN speechiness;
END TRY
BEGIN CATCH
    PRINT 'Không thể xóa cột speechiness (có thể không tồn tại)';
END CATCH;
GO

BEGIN TRY
    ALTER TABLE Metadata DROP COLUMN acousticness;
END TRY
BEGIN CATCH
    PRINT 'Không thể xóa cột acousticness (có thể không tồn tại)';
END CATCH;
GO

BEGIN TRY
    ALTER TABLE Metadata DROP COLUMN instrumentalness;
END TRY
BEGIN CATCH
    PRINT 'Không thể xóa cột instrumentalness (có thể không tồn tại)';
END CATCH;
GO

BEGIN TRY
    ALTER TABLE Metadata DROP COLUMN liveness;
END TRY
BEGIN CATCH
    PRINT 'Không thể xóa cột liveness (có thể không tồn tại)';
END CATCH;
GO

BEGIN TRY
    ALTER TABLE Metadata DROP COLUMN valence;
END TRY
BEGIN CATCH
    PRINT 'Không thể xóa cột valence (có thể không tồn tại)';
END CATCH;
GO

BEGIN TRY
    ALTER TABLE Metadata DROP COLUMN time_signature;
END TRY
BEGIN CATCH
    PRINT 'Không thể xóa cột time_signature (có thể không tồn tại)';
END CATCH;
GO

BEGIN TRY
    ALTER TABLE Metadata DROP COLUMN year;
END TRY
BEGIN CATCH
    PRINT 'Không thể xóa cột year (có thể không tồn tại)';
END CATCH;
GO

-- === 2. ĐẢM BẢO CỘT embedding TỒN TẠI VÀ CÓ ĐÚNG KIỂU ===
IF COL_LENGTH('Metadata', 'embedding') IS NULL
BEGIN
    ALTER TABLE Metadata ADD embedding NVARCHAR(MAX);
    PRINT 'Đã thêm cột embedding.';
END
ELSE
BEGIN
    ALTER TABLE Metadata ALTER COLUMN embedding NVARCHAR(MAX);
    PRINT 'Đã cập nhật kiểu dữ liệu cột embedding.';
END;
GO

-- === 3. ĐẢM BẢO CỘT release_date TỒN TẠI ===
IF COL_LENGTH('Metadata', 'release_date') IS NULL
BEGIN
    ALTER TABLE Metadata ADD release_date DATE NULL;
    PRINT 'Đã thêm cột release_date.';
END
ELSE
BEGIN
    PRINT 'release_date đã tồn tại, bỏ qua.';
END;
GO


ALTER TABLE dbo.Tracks DROP CONSTRAINT DF__Tracks__status__37A5467C;
GO

ALTER TABLE dbo.Tracks DROP COLUMN status;
GO



