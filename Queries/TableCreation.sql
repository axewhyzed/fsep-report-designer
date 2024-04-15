CREATE TABLE ReportData (
    DataID INT PRIMARY KEY IDENTITY(1,1),
    ReportID INT FOREIGN KEY REFERENCES Reports(ReportID),
    RowIndex INT,
    ColumnIndex INT,
    CellValue NVARCHAR(MAX)
    -- Add other formatting attributes as needed
);

CREATE TABLE ReportFormatting (
    DataID INT PRIMARY KEY,
    ReportID INT,
    Bold BIT,
    Italic BIT,
    Underline BIT,
    Strikethrough BIT,
    FontSize INT,
    FontFamily NVARCHAR(100),
    FontColor NVARCHAR(50),
    BackgroundColor NVARCHAR(50),
    FOREIGN KEY (DataID) REFERENCES ReportData(DataID)
    -- Add other formatting properties as needed
);