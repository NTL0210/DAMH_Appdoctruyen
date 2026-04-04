-- Alter account.current_token to NVARCHAR(MAX) to avoid truncation
-- Backup your DB before running.

SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.account', N'U') IS NULL
BEGIN
    PRINT 'Table dbo.account does not exist. Aborting.';
    RETURN;
END

IF EXISTS (SELECT * FROM sys.columns WHERE Name = N'current_token' AND Object_ID = OBJECT_ID(N'dbo.account'))
BEGIN
    BEGIN TRY
        ALTER TABLE dbo.account ALTER COLUMN current_token NVARCHAR(MAX) NULL;
        PRINT 'Altered column current_token to NVARCHAR(MAX).';
    END TRY
    BEGIN CATCH
        PRINT 'Error altering column: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END
ELSE
BEGIN
    ALTER TABLE dbo.account ADD current_token NVARCHAR(MAX) NULL;
    PRINT 'Added column current_token NVARCHAR(MAX).';
END

SET NOCOUNT OFF;
