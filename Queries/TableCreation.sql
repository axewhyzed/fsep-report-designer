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
INSERT INTO ReportData (ReportID, RowIndex, ColumnIndex, CellValue, isTitle)
VALUES 
    -- Sample data for Sales Report
    (1, 0, 0, 'Product', 0),
    (1, 0, 1, 'Sales Amount ($)', 0),
    (1, 0, 2, 'Cost ($)', 0),
    (1, 0, 3, 'Profit ($)', 0),
    (1, 0, 4, 'Quantity Sold', 0),
    (1, 1, 0, 'Product A', 0),
    (1, 1, 1, '$1000', 0),
    (1, 1, 2, '$500', 0),
    (1, 1, 3, '$500', 0),
    (1, 1, 4, '50', 0),
    (1, 2, 0, 'Product B', 0),
    (1, 2, 1, '$1500', 0),
    (1, 2, 2, '$700', 0),
    (1, 2, 3, '$800', 0),
    (1, 2, 4, '70', 0),
    (1, 3, 0, 'Product C', 0),
    (1, 3, 1, '$1200', 0),
    (1, 3, 2, '$600', 0),
    (1, 3, 3, '$600', 0),
    (1, 3, 4, '40', 0),
    (1, 4, 0, 'Product D', 0),
    (1, 4, 1, '$800', 0),
    (1, 4, 2, '$400', 0),
    (1, 4, 3, '$400', 0),
    (1, 4, 4, '45', 0),
    (1, 5, 0, 'Product E', 0),
    (1, 5, 1, '$2000', 0),
    (1, 5, 2, '$1000', 0),
    (1, 5, 3, '$1000', 0),
    (1, 5, 4, '55', 0),
    (1, 6, 0, 'Product F', 0),
    (1, 6, 1, '$3000', 0),
    (1, 6, 2, '$1500', 0),
    (1, 6, 3, '$1500', 0),
    (1, 6, 4, '80', 0),
    (1, 7, 0, 'Product G', 0),
    (1, 7, 1, '$2500', 0),
    (1, 7, 2, '$1200', 0),
    (1, 7, 3, '$1300', 0),
    (1, 7, 4, '65', 0),
    (1, 8, 0, 'Product H', 0),
    (1, 8, 1, '$1800', 0),
    (1, 8, 2, '$900', 0),
    (1, 8, 3, '$900', 0),
    (1, 8, 4, '75', 0),
    (1, 9, 0, 'Product I', 0),
    (1, 9, 1, '$2200', 0),
    (1, 9, 2, '$1100', 0),
    (1, 9, 3, '$1100', 0),
    (1, 9, 4, '60', 0),
    (1, 10, 0, 'Product J', 0),
    (1, 10, 1, '$2800', 0),
    (1, 10, 2, '$1400', 0),
    (1, 10, 3, '$1400', 0),
    (1, 10, 4, '70', 0),
    (1, -1, -1, 'Sales Report', 1),

    -- Sample data for Financial Report
    (2, 0, 0, 'Month', 0),
    (2, 0, 1, 'Revenue ($)', 0),
    (2, 0, 2, 'Expenses ($)', 0),
    (2, 0, 3, 'Profit ($)', 0),
    (2, 0, 4, 'Tax ($)', 0),
    (2, 0, 5, 'Net Profit ($)', 0),
    (2, 1, 0, 'January', 0),
    (2, 1, 1, '5000', 0),
    (2, 1, 2, '3000', 0),
    (2, 1, 3, '2000', 0),
    (2, 1, 4, '500', 0),
    (2, 1, 5, '1500', 0),
    (2, 2, 0, 'February', 0),
    (2, 2, 1, '6000', 0),
    (2, 2, 2, '3500', 0),
    (2, 2, 3, '2500', 0),
    (2, 2, 4, '600', 0),
    (2, 2, 5, '1900', 0),
    (2, 3, 0, 'March', 0),
    (2, 3, 1, '7000', 0),
    (2, 3, 2, '4000', 0),
    (2, 3, 3, '3000', 0),
    (2, 3, 4, '700', 0),
    (2, 3, 5, '2300', 0),
    (2, 4, 0, 'April', 0),
    (2, 4, 1, '8000', 0),
    (2, 4, 2, '4500', 0),
    (2, 4, 3, '3500', 0),
    (2, 4, 4, '800', 0),
    (2, 4, 5, '2700', 0),
    (2, 5, 0, 'May', 0),
    (2, 5, 1, '9000', 0),
    (2, 5, 2, '5000', 0),
    (2, 5, 3, '4000', 0),
    (2, 5, 4, '900', 0),
    (2, 5, 5, '3100', 0),
    (2, 6, 0, 'June', 0),
    (2, 6, 1, '10000', 0),
    (2, 6, 2, '5500', 0),
    (2, 6, 3, '4500', 0),
    (2, 6, 4, '1000', 0),
    (2, 6, 5, '3500', 0),
    (2, -1, -1, 'Financial Report', 1),

    -- Sample data for Inventory Report
    (3, 0, 0, 'Product', 0),
    (3, 0, 1, 'Quantity', 0),
    (3, 0, 2, 'Unit Cost ($)', 0),
    (3, 0, 3, 'Total Cost ($)', 0),
    (3, 0, 4, 'Last Updated', 0),
    (3, 1, 0, 'Product X', 0),
    (3, 1, 1, '100', 0),
    (3, 1, 2, '5', 0),
    (3, 1, 3, '500', 0),
    (3, 1, 4, '2024-04-19', 0),
    (3, 2, 0, 'Product Y', 0),
    (3, 2, 1, '150', 0),
    (3, 2, 2, '8', 0),
    (3, 2, 3, '1200', 0),
    (3, 2, 4, '2024-04-19', 0),
    (3, 3, 0, 'Product Z', 0),
    (3, 3, 1, '200', 0),
    (3, 3, 2, '6', 0),
    (3, 3, 3, '1200', 0),
    (3, 3, 4, '2024-04-19', 0),
    (3, 4, 0, 'Product A', 0),
    (3, 4, 1, '120', 0),
    (3, 4, 2, '10', 0),
    (3, 4, 3, '1200', 0),
    (3, 4, 4, '2024-04-19', 0),
    (3, 5, 0, 'Product B', 0),
    (3, 5, 1, '80', 0),
    (3, 5, 2, '7', 0),
    (3, 5, 3, '560', 0),
    (3, 5, 4, '2024-04-19', 0),
    (3, 6, 0, 'Product C', 0),
    (3, 6, 1, '50', 0),
    (3, 6, 2, '6', 0),
    (3, 6, 3, '300', 0),
    (3, 6, 4, '2024-04-19', 0),
    (3, -1, -1, 'Inventory Report', 1);

-- Sample data for ReportFormatting table
INSERT INTO ReportFormatting (DataID, Bold, Italic, Underline, Strikethrough, FontSize, FontFamily, FontColor, BackgroundColor, ReportID)
VALUES 
    -- Sample data for Sales Report
    (1, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product (DataID 1)
    (2, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Sales Amount (DataID 2)
    (3, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product A (DataID 3)
    (4, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 1000 (DataID 4)
    (5, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1),
    (6, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1),
    (7, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1),
    (8, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1),
    (9, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $500
    (10, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 50
    (11, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product B
    (12, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1500
    (13, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $700
    (14, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $800
    (15, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 70
    (16, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product C
    (17, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1200
    (18, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $600
    (19, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $600
    (20, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 40
    (21, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product D
    (22, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $800
    (23, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $400
    (24, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $400
    (25, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 45
    (26, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product E
    (27, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $2000
    (28, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1000
    (29, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1000
    (30, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 55
    (31, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product F
    (32, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $3000
    (33, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1500
    (34, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1500
    (35, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 80
    (36, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product G
    (37, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $2500
    (38, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1200
    (39, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1300
    (40, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 65
    (41, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product H
    (42, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1800
    (43, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $900
    (44, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $900
    (45, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 75
    (46, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product I
    (47, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $2200
    (48, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1100
    (49, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1100
    (50, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for 60
    (51, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Product J
    (52, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $2800
    (53, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1400
    (54, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1), -- Formatting for $1400
    (55, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 1),
    (56, 1, 0, 0, 0, 24, 'Arial', '#000000', '#ffffff', 1), -- Formatting for Sales Report Title (DataID 7)


    -- Sample data for Financial Report
    (57, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Month
    (58, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Revenue
    (59, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for January
    (60, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 5000
    (61, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for February
    (62, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 6000
    (63, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for March
    (64, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 7000
    (65, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for April
    (66, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 8000
    (67, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for May
    (68, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 9000
    (69, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for June
    (70, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 10000
    (71, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for July
    (72, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 11000
    (73, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for August
    (74, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 12000
    (75, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for September
    (76, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 13000
    (77, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for October
    (78, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 14000
    (79, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for November
    (80, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 15000
    (81, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for December
    (82, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 16000
    (83, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Q1 Total
    (84, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 18000
    (85, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Q2 Total
    (86, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 20000
    (87, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Q3 Total
    (88, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 22000
    (89, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Q4 Total
    (90, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 24000
    (91, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Year Total
    (92, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 26000
    (93, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Month Average
    (94, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 28000
    (95, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Quarter Average
    (96, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for 30000
    (97, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Year Average
    (98, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 2),
    (99, 1, 0, 0, 0, 24, 'Arial', '#000000', '#ffffff', 2), -- Formatting for Financial Report Title (DataID 14); -- Formatting for 32000


    -- Sample data for Inventory Report
    (100, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product
    (101, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Quantity
    (102, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product X
    (103, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 100
    (104, 1, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product Y
    (105, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 150
    (106, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product Z
    (107, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 200
    (108, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product A
    (109, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 120
    (110, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product B
    (111, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 180
    (112, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product C
    (113, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 90
    (114, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product D
    (115, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 150
    (116, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product E
    (117, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 200
    (118, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product F
    (119, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 250
    (120, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product G
    (121, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 170
    (122, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product H
    (123, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 220
    (124, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product I
    (125, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 130
    (126, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product J
    (127, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 110
    (128, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product K
    (129, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 190
    (130, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product L
    (131, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 140
    (132, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for Product M
    (133, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3), -- Formatting for 160
    (134, 0, 0, 0, 0, 14, 'Arial', '#000000', '#ffffff', 3),
    (135, 1, 0, 0, 0, 24, 'Arial', '#000000', '#ffffff', 3); -- Formatting for Inventory Report Title (DataID 21)