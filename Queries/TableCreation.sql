CREATE TABLE ReportData (
    DataID INT PRIMARY KEY IDENTITY(1,1),
    ReportID INT FOREIGN KEY REFERENCES Reports(ReportID),
    RowIndex INT,
    ColumnIndex INT,
    CellValue NVARCHAR(MAX)
    -- Add other formatting attributes as needed
);

ALTER TABLE ReportData
ADD isTitle BIT DEFAULT 0;

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

-- Sample data for ReportData table
-- Sample data for ReportData table
INSERT INTO ReportData (ReportID, RowIndex, ColumnIndex, CellValue, isTitle)
VALUES 
    -- Sample data for Sales Report
    (1, 0, 0, 'Product', 0),
    (1, 0, 1, 'Sales Amount', 0),
    (1, 1, 0, 'Product A', 0),
    (1, 1, 1, '1000', 0),
    (1, 2, 0, 'Product B', 0),
    (1, 2, 1, '1500', 0),
    (1, -1, -1, 'Sales Report', 1),
    -- Sample data for Financial Report
    (2, 0, 0, 'Month', 0),
    (2, 0, 1, 'Revenue', 0),
    (2, 1, 0, 'January', 0),
    (2, 1, 1, '5000', 0),
    (2, 2, 0, 'February', 0),
    (2, 2, 1, '6000', 0),
    (2, -1, -1, 'Financial Report', 1),
    -- Sample data for Inventory Report
    (3, 0, 0, 'Product', 0),
    (3, 0, 1, 'Quantity', 0),
    (3, 1, 0, 'Product X', 0),
    (3, 1, 1, '100', 0),
    (3, 2, 0, 'Product Y', 0),
    (3, 2, 1, '150', 0),
    (3, -1, -1, 'Inventory Report', 1);

-- Sample data for ReportFormatting table
INSERT INTO ReportFormatting (DataID, Bold, Italic, Underline, Strikethrough, FontSize, FontFamily, FontColor, BackgroundColor, ReportID)
VALUES 
    -- Sample data for Sales Report
    (1, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product (DataID 1)
    (2, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Sales Amount (DataID 2)
    (3, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product A (DataID 3)
    (4, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 1000 (DataID 4)
    (5, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product B (DataID 5)
    (6, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 1500 (DataID 6)
    -- Formatting for Sales Report Title
    (7, 1, 0, 0, 0, 16, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Sales Report Title (DataID 7)
    -- Sample data for Financial Report
    (8, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Month (DataID 8)
    (9, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Revenue (DataID 9)
    (10, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for January (DataID 10)
    (11, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 5000 (DataID 11)
    (12, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for February (DataID 12)
    (13, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 6000 (DataID 13)
    -- Formatting for Financial Report Title
    (14, 1, 0, 0, 0, 16, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Financial Report Title (DataID 14)
    -- Sample data for Inventory Report
    (15, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product (DataID 15)
    (16, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Quantity (DataID 16)
    (17, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product X (DataID 17)
    (18, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 100 (DataID 18)
    (19, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product Y (DataID 19)
    (20, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 150 (DataID 20)
    -- Formatting for Inventory Report Title
    (21, 1, 0, 0, 0, 16, 'Arial', '#000000', '#ffffff', 3); -- Formatting for Inventory Report Title (DataID 21)