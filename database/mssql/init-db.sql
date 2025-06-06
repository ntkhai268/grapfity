USE [master];
GO

IF  EXISTS (
    SELECT 1
    FROM sys.databases
    WHERE name = N'DB_Graptify'
)
BEGIN
	PRINT 'Database DB_Graptify already exists, skipping creation.';
    
END
ELSE
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
    
	WAITFOR DELAY '00:00:05';
	GO

	ALTER DATABASE [DB_Graptify] SET COMPATIBILITY_LEVEL = 160
	GO
	IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
	begin
	EXEC [DB_Graptify].[dbo].[sp_fulltext_database] @action = 'enable'
	end
	GO
	ALTER DATABASE [DB_Graptify] SET ANSI_NULL_DEFAULT OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET ANSI_NULLS OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET ANSI_PADDING OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET ANSI_WARNINGS OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET ARITHABORT OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET AUTO_CLOSE OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET AUTO_SHRINK OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET AUTO_UPDATE_STATISTICS ON 
	GO
	ALTER DATABASE [DB_Graptify] SET CURSOR_CLOSE_ON_COMMIT OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET CURSOR_DEFAULT  GLOBAL 
	GO
	ALTER DATABASE [DB_Graptify] SET CONCAT_NULL_YIELDS_NULL OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET NUMERIC_ROUNDABORT OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET QUOTED_IDENTIFIER OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET RECURSIVE_TRIGGERS OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET  DISABLE_BROKER 
	GO
	ALTER DATABASE [DB_Graptify] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET DATE_CORRELATION_OPTIMIZATION OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET TRUSTWORTHY OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET ALLOW_SNAPSHOT_ISOLATION OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET PARAMETERIZATION SIMPLE 
	GO
	ALTER DATABASE [DB_Graptify] SET READ_COMMITTED_SNAPSHOT OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET HONOR_BROKER_PRIORITY OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET RECOVERY FULL 
	GO
	ALTER DATABASE [DB_Graptify] SET  MULTI_USER 
	GO
	ALTER DATABASE [DB_Graptify] SET PAGE_VERIFY CHECKSUM  
	GO
	ALTER DATABASE [DB_Graptify] SET DB_CHAINING OFF 
	GO
	ALTER DATABASE [DB_Graptify] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
	GO
	ALTER DATABASE [DB_Graptify] SET TARGET_RECOVERY_TIME = 60 SECONDS 
	GO
	ALTER DATABASE [DB_Graptify] SET DELAYED_DURABILITY = DISABLED 
	GO
	ALTER DATABASE [DB_Graptify] SET ACCELERATED_DATABASE_RECOVERY = OFF  
	GO
	EXEC sys.sp_db_vardecimal_storage_format N'DB_Graptify', N'ON'
	GO
	ALTER DATABASE [DB_Graptify] SET QUERY_STORE = ON
	GO
	ALTER DATABASE [DB_Graptify] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
	GO
	USE [DB_Graptify]
	GO
	/****** Object:  Table [dbo].[Likes]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[Likes](
		[id] [int] IDENTITY(1,1) NOT NULL,
		[userId] [int] NULL,
		[trackId] [int] NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY]
	GO
	/****** Object:  Table [dbo].[listeningHistories]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[listeningHistories](
		[id] [int] IDENTITY(1,1) NOT NULL,
		[userId] [int] NULL,
		[trackId] [int] NULL,
		[listenCount] [int] NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY]
	GO
	/****** Object:  Table [dbo].[Metadata]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[Metadata](
		[trackname] [nvarchar](255) NULL,
		[track_id] [int] NOT NULL,
		[explicit] [float] NULL,
		[danceability] [float] NULL,
		[energy] [float] NULL,
		[key] [int] NULL,
		[loudness] [float] NULL,
		[mode] [int] NULL,
		[speechiness] [float] NULL,
		[acousticness] [float] NULL,
		[instrumentalness] [float] NULL,
		[liveness] [float] NULL,
		[valence] [float] NULL,
		[tempo] [float] NULL,
		[duration_ms] [int] NULL,
		[time_signature] [int] NULL,
		[year] [int] NULL,
		[release_date] [datetimeoffset](7) NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
		[lyrics] [nvarchar](max) NULL,
	PRIMARY KEY CLUSTERED 
	(
		[track_id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
	GO
	/****** Object:  Table [dbo].[Playlists]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[Playlists](
		[id] [int] IDENTITY(1,1) NOT NULL,
		[userId] [int] NULL,
		[title] [nvarchar](255) NULL,
		[createDate] [datetimeoffset](7) NULL,
		[imageUrl] [nvarchar](255) NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
		[privacy] [nvarchar](255) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY]
	GO
	/****** Object:  Table [dbo].[PlaylistTracks]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[PlaylistTracks](
		[playlistId] [int] NOT NULL,
		[trackId] [int] NOT NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[playlistId] ASC,
		[trackId] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY]
	GO
	/****** Object:  Table [dbo].[Roles]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[Roles](
		[id] [int] IDENTITY(1,1) NOT NULL,
		[roleName] [nvarchar](255) NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY]
	GO
	/****** Object:  Table [dbo].[searchHistories]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[searchHistories](
		[id] [int] IDENTITY(1,1) NOT NULL,
		[userId] [int] NULL,
		[searchQuery] [nvarchar](255) NULL,
		[timestamp] [time](7) NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY]
	GO
	/****** Object:  Table [dbo].[SequelizeMeta]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[SequelizeMeta](
		[name] [nvarchar](255) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[name] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
	UNIQUE NONCLUSTERED 
	(
		[name] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY]
	GO
	/****** Object:  Table [dbo].[Tracks]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[Tracks](
		[id] [int] IDENTITY(1,1) NOT NULL,
		[trackUrl] [nvarchar](255) NULL,
		[imageUrl] [nvarchar](255) NULL,
		[uploaderId] [int] NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
		[status] [nvarchar](255) NOT NULL,
		[privacy] [nvarchar](255) NOT NULL,
	PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY]
	GO
	/****** Object:  Table [dbo].[Users]    Script Date: 5/27/2025 4:14:28 PM ******/
	SET ANSI_NULLS ON
	GO
	SET QUOTED_IDENTIFIER ON
	GO
	CREATE TABLE [dbo].[Users](
		[id] [int] IDENTITY(1,1) NOT NULL,
		[userName] [nvarchar](255) NULL,
		[email] [nvarchar](255) NULL,
		[password] [nvarchar](255) NULL,
		[roleId] [int] NULL,
		[createdAt] [datetimeoffset](7) NOT NULL,
		[updatedAt] [datetimeoffset](7) NOT NULL,
		[Name] [nvarchar](255) NULL,
		[Birthday] [date] NULL,
		[Address] [nvarchar](255) NULL,
		[PhoneNumber] [nvarchar](255) NULL,
		[Avatar] [nvarchar](255) NULL,
	PRIMARY KEY CLUSTERED 
	(
		[id] ASC
	)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
	) ON [PRIMARY]
	GO
	ALTER TABLE [dbo].[Playlists] ADD  DEFAULT (N'public') FOR [privacy]
	GO
	ALTER TABLE [dbo].[Tracks] ADD  DEFAULT (N'pending') FOR [status]
	GO
	ALTER TABLE [dbo].[Tracks] ADD  DEFAULT (N'public') FOR [privacy]
	GO
	ALTER TABLE [dbo].[Likes]  WITH CHECK ADD FOREIGN KEY([trackId])
	REFERENCES [dbo].[Tracks] ([id])
	ON DELETE CASCADE
	GO
	ALTER TABLE [dbo].[Likes]  WITH CHECK ADD FOREIGN KEY([userId])
	REFERENCES [dbo].[Users] ([id])
	GO
	ALTER TABLE [dbo].[listeningHistories]  WITH CHECK ADD FOREIGN KEY([trackId])
	REFERENCES [dbo].[Tracks] ([id])
	ON DELETE CASCADE
	GO
	ALTER TABLE [dbo].[listeningHistories]  WITH CHECK ADD FOREIGN KEY([userId])
	REFERENCES [dbo].[Users] ([id])
	GO
	ALTER TABLE [dbo].[Metadata]  WITH CHECK ADD FOREIGN KEY([track_id])
	REFERENCES [dbo].[Tracks] ([id])
	ON DELETE CASCADE
	GO
	ALTER TABLE [dbo].[Playlists]  WITH CHECK ADD FOREIGN KEY([userId])
	REFERENCES [dbo].[Users] ([id])
	ON DELETE CASCADE
	GO
	ALTER TABLE [dbo].[PlaylistTracks]  WITH CHECK ADD FOREIGN KEY([playlistId])
	REFERENCES [dbo].[Playlists] ([id])
	GO
	ALTER TABLE [dbo].[PlaylistTracks]  WITH CHECK ADD FOREIGN KEY([trackId])
	REFERENCES [dbo].[Tracks] ([id])
	GO
	ALTER TABLE [dbo].[searchHistories]  WITH CHECK ADD FOREIGN KEY([userId])
	REFERENCES [dbo].[Users] ([id])
	ON DELETE CASCADE
	GO
	ALTER TABLE [dbo].[Tracks]  WITH CHECK ADD FOREIGN KEY([uploaderId])
	REFERENCES [dbo].[Users] ([id])
	ON DELETE CASCADE
	GO
	ALTER TABLE [dbo].[Users]  WITH CHECK ADD FOREIGN KEY([roleId])
	REFERENCES [dbo].[Roles] ([id])
	ON DELETE CASCADE
	GO
	ALTER TABLE [dbo].[Tracks]  WITH CHECK ADD  CONSTRAINT [chk_track_status] CHECK  (([status]='rejected' OR [status]='approved' OR [status]='pending'))
	GO
	ALTER TABLE [dbo].[Tracks] CHECK CONSTRAINT [chk_track_status]
	GO
	USE [master]
	GO
	ALTER DATABASE [DB_Graptify] SET  READ_WRITE 
	GO
END
GO


