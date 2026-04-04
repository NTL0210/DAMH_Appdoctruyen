-- Update account.role and account.status from NULL to defaults
-- Sets role = 'USER' and status = 'ACTIVE' for rows where they are NULL.
-- Run this on your `truyen` database. Backup before running.

SET NOCOUNT ON;

IF OBJECT_ID(N'dbo.account', N'U') IS NULL
BEGIN
    PRINT 'Table dbo.account does not exist. Aborting.';
    RETURN;
END

DECLARE @cntRole INT = 0;
DECLARE @cntStatus INT = 0;

SELECT @cntRole = COUNT(*) FROM dbo.account WHERE role IS NULL;
IF @cntRole > 0
BEGIN
    UPDATE dbo.account SET role = 'USER' WHERE role IS NULL;
    PRINT 'Updated role rows: ' + CONVERT(VARCHAR(20), @cntRole);
END
ELSE
    PRINT 'No NULL role rows to update.';

SELECT @cntStatus = COUNT(*) FROM dbo.account WHERE status IS NULL;
IF @cntStatus > 0
BEGIN
    UPDATE dbo.account SET status = 'ACTIVE' WHERE status IS NULL;
    PRINT 'Updated status rows: ' + CONVERT(VARCHAR(20), @cntStatus);
END
ELSE
    PRINT 'No NULL status rows to update.';

SET NOCOUNT OFF;
