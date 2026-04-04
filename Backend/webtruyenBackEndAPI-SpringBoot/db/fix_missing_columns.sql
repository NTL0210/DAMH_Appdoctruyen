-- Fix missing columns script for WebTruyen project (SQL Server)
-- BACKUP your database before running this script.
-- This script adds columns only when they are missing. It creates the table if the table does not exist.
-- Review types/constraints before running in production.

SET NOCOUNT ON;

-- TABLE: account
IF OBJECT_ID(N'dbo.account', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.account';
    CREATE TABLE dbo.account (
        account_id NVARCHAR(36),
        mail NVARCHAR(255),
        password NVARCHAR(MAX),
        user_name NVARCHAR(255),
        image NVARCHAR(255),
        position BIT,
        role NVARCHAR(50),
        created_at DATETIME2,
        status NVARCHAR(50),
        current_token NVARCHAR(255)
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'account_id' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD account_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'mail' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD mail NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'password' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD password NVARCHAR(MAX);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'user_name' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD user_name NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'image' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD image NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'position' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD position BIT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'role' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD role NVARCHAR(50);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'created_at' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD created_at DATETIME2;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'status' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD status NVARCHAR(50);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'current_token' AND Object_ID = Object_ID(N'dbo.account'))
        ALTER TABLE dbo.account ADD current_token NVARCHAR(255);
END

-- TABLE: chapters
IF OBJECT_ID(N'dbo.chapters', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.chapters';
    CREATE TABLE dbo.chapters (
        id INT IDENTITY(1,1),
        comic_id NVARCHAR(36),
        slug NVARCHAR(255),
        server_name NVARCHAR(255),
        server_index INT,
        chapter_index INT,
        filename NVARCHAR(255),
        chapter_name NVARCHAR(255),
        chapter_title NVARCHAR(255),
        chapter_api_data NVARCHAR(MAX),
        created_at DATETIME2,
        updated_at DATETIME2
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'id' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD id INT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'comic_id' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD comic_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'slug' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD slug NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'server_name' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD server_name NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'server_index' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD server_index INT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'chapter_index' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD chapter_index INT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'filename' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD filename NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'chapter_name' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD chapter_name NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'chapter_title' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD chapter_title NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'chapter_api_data' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD chapter_api_data NVARCHAR(MAX);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'created_at' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD created_at DATETIME2;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'updated_at' AND Object_ID = Object_ID(N'dbo.chapters'))
        ALTER TABLE dbo.chapters ADD updated_at DATETIME2;
END

-- TABLE: comics
IF OBJECT_ID(N'dbo.comics', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.comics';
    CREATE TABLE dbo.comics (
        comic_id NVARCHAR(36),
        name NVARCHAR(255),
        slug NVARCHAR(255),
        origin_name NVARCHAR(255),
        status NVARCHAR(50),
        thumb_url NVARCHAR(MAX),
        sub_docquyen BIT,
        chapters_latest NVARCHAR(MAX),
        updated_at DATETIME2,
        created_at DATETIME2,
        modified_at DATETIME2
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'comic_id' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD comic_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'name' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD name NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'slug' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD slug NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'origin_name' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD origin_name NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'status' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD status NVARCHAR(50);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'thumb_url' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD thumb_url NVARCHAR(MAX);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'sub_docquyen' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD sub_docquyen BIT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'chapters_latest' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD chapters_latest NVARCHAR(MAX);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'updated_at' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD updated_at DATETIME2;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'created_at' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD created_at DATETIME2;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'modified_at' AND Object_ID = Object_ID(N'dbo.comics'))
        ALTER TABLE dbo.comics ADD modified_at DATETIME2;
END

-- TABLE: comic_follows
IF OBJECT_ID(N'dbo.comic_follows', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.comic_follows';
    CREATE TABLE dbo.comic_follows (
        comic_follow_id NVARCHAR(36),
        account_id NVARCHAR(36),
        comic_id NVARCHAR(36),
        created_at DATETIME2
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'comic_follow_id' AND Object_ID = Object_ID(N'dbo.comic_follows'))
        ALTER TABLE dbo.comic_follows ADD comic_follow_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'account_id' AND Object_ID = Object_ID(N'dbo.comic_follows'))
        ALTER TABLE dbo.comic_follows ADD account_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'comic_id' AND Object_ID = Object_ID(N'dbo.comic_follows'))
        ALTER TABLE dbo.comic_follows ADD comic_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'created_at' AND Object_ID = Object_ID(N'dbo.comic_follows'))
        ALTER TABLE dbo.comic_follows ADD created_at DATETIME2;
END

-- TABLE: comic_genres
IF OBJECT_ID(N'dbo.comic_genres', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.comic_genres';
    CREATE TABLE dbo.comic_genres (
        id INT IDENTITY(1,1),
        comic_id NVARCHAR(36),
        genre_id NVARCHAR(36)
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'id' AND Object_ID = Object_ID(N'dbo.comic_genres'))
        ALTER TABLE dbo.comic_genres ADD id INT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'comic_id' AND Object_ID = Object_ID(N'dbo.comic_genres'))
        ALTER TABLE dbo.comic_genres ADD comic_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'genre_id' AND Object_ID = Object_ID(N'dbo.comic_genres'))
        ALTER TABLE dbo.comic_genres ADD genre_id NVARCHAR(36);
END

-- TABLE: comments
IF OBJECT_ID(N'dbo.comments', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.comments';
    CREATE TABLE dbo.comments (
        comment_id NVARCHAR(255),
        comic_id NVARCHAR(36),
        account_id NVARCHAR(36),
        content NVARCHAR(MAX),
        parent_id NVARCHAR(255),
        created_at DATETIME2
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'comment_id' AND Object_ID = Object_ID(N'dbo.comments'))
        ALTER TABLE dbo.comments ADD comment_id NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'comic_id' AND Object_ID = Object_ID(N'dbo.comments'))
        ALTER TABLE dbo.comments ADD comic_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'account_id' AND Object_ID = Object_ID(N'dbo.comments'))
        ALTER TABLE dbo.comments ADD account_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'content' AND Object_ID = Object_ID(N'dbo.comments'))
        ALTER TABLE dbo.comments ADD content NVARCHAR(MAX);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'parent_id' AND Object_ID = Object_ID(N'dbo.comments'))
        ALTER TABLE dbo.comments ADD parent_id NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'created_at' AND Object_ID = Object_ID(N'dbo.comments'))
        ALTER TABLE dbo.comments ADD created_at DATETIME2;
END

-- TABLE: follows
IF OBJECT_ID(N'dbo.follows', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.follows';
    CREATE TABLE dbo.follows (
        follow_id NVARCHAR(36),
        account_id NVARCHAR(36),
        followed_id NVARCHAR(36),
        created_at DATETIME2
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'follow_id' AND Object_ID = Object_ID(N'dbo.follows'))
        ALTER TABLE dbo.follows ADD follow_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'account_id' AND Object_ID = Object_ID(N'dbo.follows'))
        ALTER TABLE dbo.follows ADD account_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'followed_id' AND Object_ID = Object_ID(N'dbo.follows'))
        ALTER TABLE dbo.follows ADD followed_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'created_at' AND Object_ID = Object_ID(N'dbo.follows'))
        ALTER TABLE dbo.follows ADD created_at DATETIME2;
END

-- TABLE: genres
IF OBJECT_ID(N'dbo.genres', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.genres';
    CREATE TABLE dbo.genres (
        genre_id NVARCHAR(36),
        name NVARCHAR(255)
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'genre_id' AND Object_ID = Object_ID(N'dbo.genres'))
        ALTER TABLE dbo.genres ADD genre_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'name' AND Object_ID = Object_ID(N'dbo.genres'))
        ALTER TABLE dbo.genres ADD name NVARCHAR(255);
END

-- TABLE: notifications
IF OBJECT_ID(N'dbo.notifications', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.notifications';
    CREATE TABLE dbo.notifications (
        id UNIQUEIDENTIFIER,
        title NVARCHAR(255),
        content NVARCHAR(MAX),
        type NVARCHAR(255),
        is_read BIT,
        created_at DATETIME2,
        account_id UNIQUEIDENTIFIER
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'id' AND Object_ID = Object_ID(N'dbo.notifications'))
        ALTER TABLE dbo.notifications ADD id UNIQUEIDENTIFIER;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'title' AND Object_ID = Object_ID(N'dbo.notifications'))
        ALTER TABLE dbo.notifications ADD title NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'content' AND Object_ID = Object_ID(N'dbo.notifications'))
        ALTER TABLE dbo.notifications ADD content NVARCHAR(MAX);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'type' AND Object_ID = Object_ID(N'dbo.notifications'))
        ALTER TABLE dbo.notifications ADD type NVARCHAR(255);
    -- add both possible boolean column namings to be safe
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'is_read' AND Object_ID = Object_ID(N'dbo.notifications'))
        ALTER TABLE dbo.notifications ADD is_read BIT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'isRead' AND Object_ID = Object_ID(N'dbo.notifications'))
        ALTER TABLE dbo.notifications ADD isRead BIT;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'created_at' AND Object_ID = Object_ID(N'dbo.notifications'))
        ALTER TABLE dbo.notifications ADD created_at DATETIME2;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'account_id' AND Object_ID = Object_ID(N'dbo.notifications'))
        ALTER TABLE dbo.notifications ADD account_id UNIQUEIDENTIFIER;
END

-- TABLE: password_reset_tokens
IF OBJECT_ID(N'dbo.password_reset_tokens', N'U') IS NULL
BEGIN
    PRINT 'Creating table dbo.password_reset_tokens';
    CREATE TABLE dbo.password_reset_tokens (
        token_id NVARCHAR(36),
        email NVARCHAR(255),
        otp NVARCHAR(255),
        expired_at DATETIME2,
        created_at DATETIME2
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'token_id' AND Object_ID = Object_ID(N'dbo.password_reset_tokens'))
        ALTER TABLE dbo.password_reset_tokens ADD token_id NVARCHAR(36);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'email' AND Object_ID = Object_ID(N'dbo.password_reset_tokens'))
        ALTER TABLE dbo.password_reset_tokens ADD email NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'otp' AND Object_ID = Object_ID(N'dbo.password_reset_tokens'))
        ALTER TABLE dbo.password_reset_tokens ADD otp NVARCHAR(255);
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'expired_at' AND Object_ID = Object_ID(N'dbo.password_reset_tokens'))
        ALTER TABLE dbo.password_reset_tokens ADD expired_at DATETIME2;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'created_at' AND Object_ID = Object_ID(N'dbo.password_reset_tokens'))
        ALTER TABLE dbo.password_reset_tokens ADD created_at DATETIME2;
END

PRINT 'Script finished. Review output and validate your schema.';

SET NOCOUNT OFF;
