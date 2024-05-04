using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;
using ReportDesigner.Server.Models;
using System.Data;


namespace ReportDesigner.Server.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class ReportsController : Controller
    {
        private readonly string _connectionString;

        public ReportsController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnectionString") + ";Database=ReportDesignDB";
        }

        // GET: api/Reports
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Report>>> GetReports()
        {
            var reports = new List<Report>();

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                string query = "SELECT * FROM Reports";

                SqlCommand command = new SqlCommand(query, connection);

                await connection.OpenAsync();

                using (SqlDataReader reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        reports.Add(new Report
                        {
                            ReportID = Convert.ToInt32(reader["ReportID"]),
                            Title = reader.GetString(reader.GetOrdinal("Title")),
                            // Do not include LogoImage here
                            //LogoImage = reader.IsDBNull(reader.GetOrdinal("LogoImage")) ? null : (byte[])reader["LogoImage"],
                            CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate")),
                            LastModifiedDate = reader.GetDateTime(reader.GetOrdinal("LastModifiedDate"))
                            // Populate other properties as needed
                            
                        });
                    }
                }
            }

            return reports;
        }

        // GET: api/Reports/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Report>> GetReport(int id)
        {
            Report report = null;

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                string query = "SELECT * FROM Reports WHERE ReportID = @ReportID";
                SqlCommand command = new SqlCommand(query, connection);
                command.Parameters.AddWithValue("@ReportID", id);

                await connection.OpenAsync();

                using (SqlDataReader reader = await command.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        report = new Report
                        {
                            ReportID = Convert.ToInt32(reader["ReportID"]),
                            Title = reader.GetString(reader.GetOrdinal("Title")),
                            // Do not include LogoImage here
                            //LogoImage = reader.IsDBNull(reader.GetOrdinal("LogoImage")) ? null : (byte[])reader["LogoImage"],
                            CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate")),
                            LastModifiedDate = reader.GetDateTime(reader.GetOrdinal("LastModifiedDate"))
                            // Populate other properties as needed
                        };
                    }
                }
            }

            if (report == null)
            {
                return NotFound();
            }

            return report;
        }

        // GET: api/Reports/{id}/logo
        [HttpGet("{id}/logo")]
        public async Task<IActionResult> GetReportLogo(int id)
        {
            try
            {
                byte[] logoImage;

                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = "SELECT LogoImage FROM Reports WHERE ReportID = @ReportID";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@ReportID", id);

                    await connection.OpenAsync();

                    object result = await command.ExecuteScalarAsync();
                    if (result != DBNull.Value)
                    {
                        logoImage = (byte[])result;
                        return File(logoImage, "image/jpeg"); // Adjust the content type based on your image type
                    }
                    else
                    {
                        return NotFound();
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // GET: api/Reports/Search
        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<Report>>> SearchReports(string searchTerm)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"SELECT * FROM Reports WHERE Title LIKE @SearchTerm";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@SearchTerm", $"%{searchTerm}%");

                    await connection.OpenAsync();

                    List<Report> searchResults = new List<Report>();

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            searchResults.Add(new Report
                            {
                                ReportID = Convert.ToInt32(reader["ReportID"]),
                                Title = reader.GetString(reader.GetOrdinal("Title")),
                                LogoImage = reader.IsDBNull(reader.GetOrdinal("LogoImage")) ? null : (byte[])reader["LogoImage"],
                                CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate")),
                                LastModifiedDate = reader.GetDateTime(reader.GetOrdinal("LastModifiedDate"))
                                // Populate other properties as needed
                            });
                        }
                    }

                    return Ok(searchResults);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // POST: api/Reports
        [HttpPost]
        public async Task<ActionResult<Report>> PostReport([FromForm] Report report, IFormFile logoImage)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"INSERT INTO Reports (Title, LogoImage, CreatedDate, LastModifiedDate) 
                             VALUES (@Title, @LogoImage, @CreatedDate, @LastModifiedDate);
                             SELECT SCOPE_IDENTITY();";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@Title", report.Title);
                    // Check if LogoImage is provided
                    if (logoImage != null)
                    {
                        byte[] logoImageBytes;
                        using (var memoryStream = new MemoryStream())
                        {
                            await logoImage.CopyToAsync(memoryStream);
                            logoImageBytes = memoryStream.ToArray();
                        }
                        command.Parameters.AddWithValue("@LogoImage", logoImageBytes);
                    }
                    else
                    {
                        // Set LogoImage to NULL if not provided
                        command.Parameters.AddWithValue("@LogoImage", DBNull.Value);
                    }
                    command.Parameters.AddWithValue("@CreatedDate", DateTime.Now);
                    command.Parameters.AddWithValue("@LastModifiedDate", DateTime.Now);

                    await connection.OpenAsync();

                    // ExecuteScalarAsync returns the first column of the first row in the result set returned by the query
                    // In this case, it returns the newly inserted ReportID
                    int newReportId = Convert.ToInt32(await command.ExecuteScalarAsync());

                    // Modify the response to include the reportId
                    report.ReportID = newReportId;

                    Console.WriteLine("Report object contents:");
                    Console.WriteLine($"Title: {report.Title}");
                    Console.WriteLine($"Logo: {report.LogoImage}");
                    Console.WriteLine($"Createdd: {report.CreatedDate}");
                    Console.WriteLine($"Last: {report.LastModifiedDate}");
                    return CreatedAtAction(nameof(GetReport), new { id = newReportId }, report);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // PUT: api/Reports/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReport(int id, [FromForm] ReportUpdateDto reportUpdateDto)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    using (SqlTransaction transaction = connection.BeginTransaction())
                    {
                        string reportUpdateQuery = @"UPDATE Reports SET LastModifiedDate = @LastModifiedDate";

                        // Check if Title is provided
                        if (reportUpdateDto.Title != null)
                        {
                            reportUpdateQuery += ", Title = @Title";
                        }

                        // Check if LogoImage is provided
                        if (reportUpdateDto.LogoImage != null)
                        {
                            reportUpdateQuery += ", LogoImage = @LogoImage";
                        }

                        reportUpdateQuery += " WHERE ReportID = @ReportID";

                        SqlCommand reportUpdateCommand = new SqlCommand(reportUpdateQuery, connection, transaction);
                        reportUpdateCommand.Parameters.AddWithValue("@ReportID", id);
                        reportUpdateCommand.Parameters.AddWithValue("@LastModifiedDate", DateTime.Now);

                        // Add parameters if provided
                        if (reportUpdateDto.Title != null)
                        {
                            reportUpdateCommand.Parameters.AddWithValue("@Title", reportUpdateDto.Title);
                        }

                        if (reportUpdateDto.LogoImage != null)
                        {
                            byte[] logoImageBytes;
                            using (var memoryStream = new MemoryStream())
                            {
                                await reportUpdateDto.LogoImage.CopyToAsync(memoryStream);
                                logoImageBytes = memoryStream.ToArray();
                            }
                            reportUpdateCommand.Parameters.AddWithValue("@LogoImage", logoImageBytes);
                        }
                        int rowsAffected = await reportUpdateCommand.ExecuteNonQueryAsync();
                        if (rowsAffected == 0)
                        {
                            return NotFound();
                        }

                        // Update ReportData table if Title is provided
                        if (reportUpdateDto.Title != null)
                        {
                            string reportDataUpdateQuery = @"UPDATE ReportData 
                                                     SET CellValue = @CellValue
                                                     WHERE ReportID = @ReportID AND IsTitle = 1";

                            SqlCommand reportDataUpdateCommand = new SqlCommand(reportDataUpdateQuery, connection, transaction);
                            reportDataUpdateCommand.Parameters.AddWithValue("@ReportID", id);
                            reportDataUpdateCommand.Parameters.AddWithValue("@CellValue", reportUpdateDto.Title);

                            await reportDataUpdateCommand.ExecuteNonQueryAsync();
                        }

                        transaction.Commit();
                        return NoContent();
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        // DELETE: api/Reports/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReport(int id)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    using (SqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Delete from ReportCustomization table
                            string ReportCustomizationQuery = "DELETE FROM ReportCustomization WHERE reportID = @ReportID";
                            SqlCommand ReportCustomizationCommand = new SqlCommand(ReportCustomizationQuery, connection, transaction);
                            ReportCustomizationCommand.Parameters.AddWithValue("@ReportID", id);
                            await ReportCustomizationCommand.ExecuteNonQueryAsync();

                            // Delete from ReportFormatting table
                            string reportFormattingQuery = "DELETE FROM ReportFormatting WHERE ReportID = @ReportID";
                            SqlCommand reportFormattingCommand = new SqlCommand(reportFormattingQuery, connection, transaction);
                            reportFormattingCommand.Parameters.AddWithValue("@ReportID", id);
                            await reportFormattingCommand.ExecuteNonQueryAsync();

                            // Delete from ReportData table
                            string reportDataQuery = "DELETE FROM ReportData WHERE ReportID = @ReportID";
                            SqlCommand reportDataCommand = new SqlCommand(reportDataQuery, connection, transaction);
                            reportDataCommand.Parameters.AddWithValue("@ReportID", id);
                            await reportDataCommand.ExecuteNonQueryAsync();

                            // Delete from Reports table
                            string reportQuery = "DELETE FROM Reports WHERE ReportID = @ReportID";
                            SqlCommand command = new SqlCommand(reportQuery, connection, transaction);
                            command.Parameters.AddWithValue("@ReportID", id);

                            int rowsAffected = await command.ExecuteNonQueryAsync();

                            if (rowsAffected == 0)
                            {
                                return NotFound();
                            }

                            // Commit the transaction
                            transaction.Commit();

                            return NoContent();
                        }
                        catch (Exception ex)
                        {
                            // Rollback the transaction if an error occurs
                            transaction.Rollback();
                            return StatusCode(500, $"An error occurred: {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        // GET: api/Reports/{reportId}/ReportData
        [HttpGet("{reportId}/ReportData")]
        public async Task<ActionResult<IEnumerable<ReportData>>> GetReportData(int reportId)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"SELECT * FROM ReportData WHERE ReportID = @ReportID";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@ReportID", reportId);

                    await connection.OpenAsync();

                    List<ReportData> reportDataList = new List<ReportData>();

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            ReportData reportData = new ReportData
                            {
                                DataID = Convert.ToInt32(reader["DataID"]),
                                ReportID = Convert.ToInt32(reader["ReportID"]),
                                RowIndex = Convert.ToInt32(reader["RowIndex"]),
                                ColumnIndex = Convert.ToInt32(reader["ColumnIndex"]),
                                CellValue = reader["CellValue"].ToString(),
                                isTitle = Convert.ToBoolean(reader["isTitle"]),
                                // Bold = Convert.ToBoolean(reader["Bold"]),
                                // Italic = Convert.ToBoolean(reader["Italic"]),
                                // Underline = Convert.ToBoolean(reader["Underline"]),
                                // Strikethrough = Convert.ToBoolean(reader["Strikethrough"]),
                                // FontSize = Convert.ToInt32(reader["FontSize"]),
                                // FontFamily = reader["FontFamily"].ToString(),
                                //  = reader["FontColor"].ToString(),
                                //  = reader["BackgroundColor"].ToString()
                                // Add other properties as needed
                            };

                            reportDataList.Add(reportData);
                        }
                    }

                    return Ok(reportDataList);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // GET: api/Reports/{reportId}/ReportFormatting
        [HttpGet("{reportId}/ReportFormatting")]
        public async Task<ActionResult<IEnumerable<ReportFormatting>>> GetReportFormatting(int reportId)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"SELECT * FROM ReportFormatting WHERE ReportID = @ReportID";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@ReportID", reportId);

                    await connection.OpenAsync();

                    List<ReportFormatting> reportFormattingList = new List<ReportFormatting>();

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            ReportFormatting reportFormatting = new ReportFormatting
                            {
                                DataID = Convert.ToInt32(reader["DataID"]),
                                ReportID = Convert.ToInt32(reader["ReportID"]),
                                Bold = Convert.ToBoolean(reader["Bold"]),
                                Italic = Convert.ToBoolean(reader["Italic"]),
                                Underline = Convert.ToBoolean(reader["Underline"]),
                                Strikethrough = Convert.ToBoolean(reader["Strikethrough"]),
                                FontSize = reader["FontSize"].ToString(),
                                FontFamily = reader["FontFamily"].ToString(),
                                FontColor  = reader["FontColor"].ToString(),
                                BackgroundColor  = reader["BackgroundColor"].ToString()
                                // Add other properties as needed
                            };

                            reportFormattingList.Add(reportFormatting);
                        }
                    }

                    return Ok(reportFormattingList);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        // GET: api/Reports/{reportId}/ReportData/{dataId}
        [HttpGet("{reportId}/ReportData/{dataId}")]
        public async Task<ActionResult<ReportData>> GetReportData(int reportId, int dataId)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"SELECT * FROM ReportData WHERE DataID = @DataID AND ReportID = @ReportID";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@DataID", dataId);
                    command.Parameters.AddWithValue("@ReportID", reportId);

                    await connection.OpenAsync();

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            ReportData reportData = new ReportData
                            {
                                DataID = Convert.ToInt32(reader["DataID"]),
                                ReportID = Convert.ToInt32(reader["ReportID"]),
                                RowIndex = Convert.ToInt32(reader["RowIndex"]),
                                ColumnIndex = Convert.ToInt32(reader["ColumnIndex"]),
                                CellValue = reader["CellValue"].ToString(),
                                isTitle = Convert.ToBoolean(reader["isTitle"]),
                                // Bold = Convert.ToBoolean(reader["Bold"]),
                                // Italic = Convert.ToBoolean(reader["Italic"]),
                                // Underline = Convert.ToBoolean(reader["Underline"]),
                                // Strikethrough = Convert.ToBoolean(reader["Strikethrough"]),
                                // FontSize = Convert.ToInt32(reader["FontSize"]),
                                // FontFamily = reader["FontFamily"].ToString(),
                                //  = reader["FontColor"].ToString(),
                                //  = reader["BackgroundColor"].ToString()
                                // Add other properties as needed
                            };

                            return Ok(reportData);
                        }
                    }

                    return NotFound();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // GET: api/Reports/{reportId}/ReportFormatting/{dataId}
        [HttpGet("{reportId}/ReportFormatting/{dataId}")]
        public async Task<ActionResult<ReportFormatting>> GetReportFormatting(int reportId, int dataId)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"SELECT * FROM ReportFormatting WHERE DataID = @DataID AND ReportID = @ReportID";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@DataID", dataId);
                    command.Parameters.AddWithValue("@ReportID", reportId);

                    await connection.OpenAsync();

                    using (SqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            ReportFormatting reportFormatting = new ReportFormatting
                            {
                                DataID = Convert.ToInt32(reader["DataID"]),
                                ReportID = Convert.ToInt32(reader["ReportID"]),
                                Bold = Convert.ToBoolean(reader["Bold"]),
                                Italic = Convert.ToBoolean(reader["Italic"]),
                                Underline = Convert.ToBoolean(reader["Underline"]),
                                Strikethrough = Convert.ToBoolean(reader["Strikethrough"]),
                                FontSize = reader["FontSize"].ToString(),
                                FontFamily = reader["FontFamily"].ToString(),
                                FontColor  = reader["FontColor"].ToString(),
                                BackgroundColor  = reader["BackgroundColor"].ToString()
                                // Add other properties as needed
                            };

                            return Ok(reportFormatting);
                        }
                    }

                    return NotFound();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        // POST: api/Reports/{reportId}/ReportData
        [HttpPost("{reportId}/ReportData")]
        public async Task<ActionResult<IEnumerable<ReportData>>> PostReportData(int reportId, IEnumerable<ReportData> reportDataList)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    using (SqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            foreach (var reportData in reportDataList)
                            {
                                string query = @"INSERT INTO ReportData (ReportID, RowIndex, ColumnIndex, CellValue, isTitle) 
                                    VALUES (@ReportID, @RowIndex, @ColumnIndex, @CellValue, @isTitle);
                                    SELECT SCOPE_IDENTITY();";

                                SqlCommand command = new SqlCommand(query, connection, transaction);
                                command.Parameters.AddWithValue("@ReportID", reportId);
                                command.Parameters.AddWithValue("@RowIndex", reportData.RowIndex);
                                command.Parameters.AddWithValue("@ColumnIndex", reportData.ColumnIndex);
                                command.Parameters.AddWithValue("@CellValue", reportData.CellValue);
                                command.Parameters.AddWithValue("@isTitle", reportData.isTitle);

                                int newDataId = Convert.ToInt32(await command.ExecuteScalarAsync());

                                reportData.DataID = newDataId;
                            }

                            // Commit the transaction
                            transaction.Commit();

                            return CreatedAtAction(nameof(GetReportData), new { reportId }, reportDataList);
                        }
                        catch (Exception ex)
                        {
                            // Rollback the transaction if an error occurs
                            transaction.Rollback();
                            return StatusCode(500, $"An error occurred: {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("{reportId}/ReportFormatting")]
        public async Task<ActionResult<IEnumerable<ReportFormatting>>> PostReportFormatting(int reportId, IEnumerable<ReportFormatting> reportFormattingList)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    using (SqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            foreach (var formatting in reportFormattingList)
                            {
                                string formattingQuery = @"INSERT INTO ReportFormatting (ReportID, DataID, Bold, Italic, Underline, Strikethrough, FontSize, FontFamily, FontColor, BackgroundColor) 
                            VALUES (@ReportID, @DataID, @Bold, @Italic, @Underline, @Strikethrough, @FontSize, @FontFamily, @FontColor, @BackgroundColor);";

                                SqlCommand formattingCommand = new SqlCommand(formattingQuery, connection, transaction);
                                formattingCommand.Parameters.AddWithValue("@ReportID", reportId);
                                formattingCommand.Parameters.AddWithValue("@DataID", formatting.DataID);
                                formattingCommand.Parameters.AddWithValue("@Bold", formatting.Bold ?? (object)DBNull.Value);
                                formattingCommand.Parameters.AddWithValue("@Italic", formatting.Italic ?? (object)DBNull.Value);
                                formattingCommand.Parameters.AddWithValue("@Underline", formatting.Underline ?? (object)DBNull.Value);
                                formattingCommand.Parameters.AddWithValue("@Strikethrough", formatting.Strikethrough ?? (object)DBNull.Value);
                                formattingCommand.Parameters.AddWithValue("@FontSize", formatting.FontSize ?? (object)DBNull.Value);
                                formattingCommand.Parameters.AddWithValue("@FontFamily", formatting.FontFamily ?? (object)DBNull.Value);
                                formattingCommand.Parameters.AddWithValue("@FontColor", formatting.FontColor ?? (object)DBNull.Value);
                                formattingCommand.Parameters.AddWithValue("@BackgroundColor", formatting.BackgroundColor ?? (object)DBNull.Value);

                                await formattingCommand.ExecuteNonQueryAsync();
                            }

                            // Commit the transaction
                            transaction.Commit();

                            return CreatedAtAction(nameof(GetReportFormatting), new { reportId }, reportFormattingList);
                        }
                        catch (Exception ex)
                        {
                            // Rollback the transaction if an error occurs
                            transaction.Rollback();
                            return StatusCode(500, $"An error occurred: {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // PUT: api/Reports/{reportId}/ReportFormatting}
        [HttpPut("{reportId}/ReportFormatting")]
        public async Task<IActionResult> PutReportFormatting(int reportId, [FromBody] List<UpdateFormatDataDto> updateDataDtos)
        {
            try
            {

                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    using (SqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            foreach (var updateDataDto in updateDataDtos)
                            {
                                var reportFormatting = updateDataDto.ReportFormatting;
                                var report = updateDataDto.Report;

                                string reportDataQuery = @"UPDATE ReportFormatting SET";

                                if (reportFormatting.Bold != null)
                                    reportDataQuery += " Bold = @Bold,";

                                if (reportFormatting.Italic != null)
                                    reportDataQuery += " Italic = @Italic,";

                                if (reportFormatting.Underline != null)
                                    reportDataQuery += " Underline = @Underline,";

                                if (reportFormatting.Strikethrough != null)
                                    reportDataQuery += " Strikethrough = @Strikethrough,";

                                if (reportFormatting.FontSize != null)
                                    reportDataQuery += " FontSize = @FontSize,";

                                if (reportFormatting.FontFamily != null)
                                    reportDataQuery += " FontFamily = @FontFamily,";

                                if (reportFormatting.FontColor != null)
                                    reportDataQuery += " FontColor = @FontColor,";

                                if (reportFormatting.BackgroundColor != null)
                                    reportDataQuery += " BackgroundColor = @BackgroundColor,";

                                reportDataQuery = reportDataQuery.TrimEnd(',') + " WHERE DataID = @DataID;";

                                SqlCommand reportDataCommand = new SqlCommand(reportDataQuery, connection, transaction);

                                if (reportFormatting.Bold != null)
                                    reportDataCommand.Parameters.AddWithValue("@Bold", reportFormatting.Bold);

                                if (reportFormatting.Italic != null)
                                    reportDataCommand.Parameters.AddWithValue("@Italic", reportFormatting.Italic);

                                if (reportFormatting.Underline != null)
                                    reportDataCommand.Parameters.AddWithValue("@Underline", reportFormatting.Underline);

                                if (reportFormatting.Strikethrough != null)
                                    reportDataCommand.Parameters.AddWithValue("@Strikethrough", reportFormatting.Strikethrough);

                                if (reportFormatting.FontSize != null)
                                    reportDataCommand.Parameters.AddWithValue("@FontSize", reportFormatting.FontSize);

                                if (reportFormatting.FontFamily != null)
                                    reportDataCommand.Parameters.AddWithValue("@FontFamily", reportFormatting.FontFamily);

                                if (reportFormatting.FontColor != null)
                                    reportDataCommand.Parameters.AddWithValue("@FontColor", reportFormatting.FontColor);

                                if (reportFormatting.BackgroundColor != null)
                                    reportDataCommand.Parameters.AddWithValue("@BackgroundColor", reportFormatting.BackgroundColor);

                                reportDataCommand.Parameters.AddWithValue("@DataID", reportFormatting.DataID);

                                await reportDataCommand.ExecuteNonQueryAsync();
                            }

                            string reportQuery = @"UPDATE Reports SET LastModifiedDate = @LastModifiedDate
                                    WHERE ReportID = @ReportID;";

                            SqlCommand reportCommand = new SqlCommand(reportQuery, connection, transaction);
                            reportCommand.Parameters.AddWithValue("@ReportID", reportId);
                            reportCommand.Parameters.AddWithValue("@LastModifiedDate", DateTime.Now);
                            await reportCommand.ExecuteNonQueryAsync();

                            // Commit the transaction
                            transaction.Commit();

                            return NoContent();
                        }
                        catch (Exception ex)
                        {
                            // Rollback the transaction if an error occurs
                            transaction.Rollback();
                            return StatusCode(500, $"An error occurred: {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("{reportId}/ReportCustomize")]
        public async Task<IActionResult> GetReportCustomization(int reportId)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    string query = "SELECT * FROM ReportCustomization WHERE reportID = @ReportID";
                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@ReportID", reportId);

                    SqlDataReader reader = await command.ExecuteReaderAsync();
                    if (reader.Read())
                    {
                        var reportCustomization = new
                        {
                            reportID = reader.GetInt32(reader.GetOrdinal("reportID")),
                            headerBGColor = reader.GetString(reader.GetOrdinal("HeaderBGColor")),
                            footerBGColor = reader.GetString(reader.GetOrdinal("FooterBGColor")),
                            bodyBGColor = reader.GetString(reader.GetOrdinal("BodyBGColor")),
                            tableBorderVisible = reader.GetBoolean(reader.GetOrdinal("TableBorderVisible")),
                            cellContentPadding = reader.GetInt32(reader.GetOrdinal("CellContentPadding")),
                            tableTopPadding = reader.GetInt32(reader.GetOrdinal("TableTopPadding")),
                            tableDataAlign = reader.GetString(reader.GetOrdinal("TableDataAlign")),
                            footerContent = reader.GetString(reader.GetOrdinal("FooterContent"))
                        };
                        return Ok(reportCustomization);
                    }
                    else
                    {
                        return NotFound();
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("{reportId}/ReportCustomize")]
        public async Task<IActionResult> PostReportCustomization(int reportId, ReportCustomization reportCustomization)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Insert into ReportCustomization table
                    string insertQuery = @"
                INSERT INTO ReportCustomization (reportID, HeaderBGColor, FooterBGColor, BodyBGColor, TableBorderVisible, CellContentPadding, TableTopPadding, TableDataAlign, FooterContent)
                VALUES (@ReportID, @HeaderBGColor, @FooterBGColor, @BodyBGColor, @TableBorderVisible, @CellContentPadding, @TableTopPadding, @TableDataAlign, @FooterContent)
            ";
                    SqlCommand command = new SqlCommand(insertQuery, connection);
                    command.Parameters.AddWithValue("@ReportID", reportId);
                    command.Parameters.AddWithValue("@HeaderBGColor", reportCustomization.HeaderBGColor);
                    command.Parameters.AddWithValue("@FooterBGColor", reportCustomization.FooterBGColor);
                    command.Parameters.AddWithValue("@BodyBGColor", reportCustomization.BodyBGColor);
                    command.Parameters.AddWithValue("@TableBorderVisible", reportCustomization.TableBorderVisible);
                    command.Parameters.AddWithValue("@CellContentPadding", reportCustomization.CellContentPadding);
                    command.Parameters.AddWithValue("@TableTopPadding", reportCustomization.TableTopPadding);
                    command.Parameters.AddWithValue("@TableDataAlign", reportCustomization.TableDataAlign);
                    command.Parameters.AddWithValue("@FooterContent", reportCustomization.FooterContent);

                    await command.ExecuteNonQueryAsync();

                    return Ok();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPut("{reportId}/ReportCustomize")]
        public async Task<IActionResult> PutReportCustomization(int reportId, ReportCustomization reportCustomization)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    await connection.OpenAsync();

                    // Check if the record exists
                    string checkQuery = "SELECT COUNT(*) FROM ReportCustomization WHERE reportID = @ReportID";
                    SqlCommand checkCommand = new SqlCommand(checkQuery, connection);
                    checkCommand.Parameters.AddWithValue("@ReportID", reportId);
                    int count = (int)await checkCommand.ExecuteScalarAsync();

                    if (count == 0)
                    {
                        return NotFound();
                    }

                    // Update the record
                    string updateQuery = "UPDATE ReportCustomization SET ";
                    List<string> updateFields = new List<string>();
                    if (reportCustomization.HeaderBGColor != null)
                    {
                        updateFields.Add("HeaderBGColor = @HeaderBGColor");
                    }
                    if (reportCustomization.FooterBGColor != null)
                    {
                        updateFields.Add("FooterBGColor = @FooterBGColor");
                    }
                    if (reportCustomization.BodyBGColor != null)
                    {
                        updateFields.Add("BodyBGColor = @BodyBGColor");
                    }
                    if (reportCustomization.TableBorderVisible != null)
                    {
                        updateFields.Add("TableBorderVisible = @TableBorderVisible");
                    }
                    if (reportCustomization.CellContentPadding != null)
                    {
                        updateFields.Add("CellContentPadding = @CellContentPadding");
                    }
                    if (reportCustomization.TableTopPadding != null)
                    {
                        updateFields.Add("TableTopPadding = @TableTopPadding");
                    }
                    if (reportCustomization.TableDataAlign != null)
                    {
                        updateFields.Add("TableDataAlign = @TableDataAlign");
                    }
                    if (reportCustomization.FooterContent != null)
                    {
                        updateFields.Add("FooterContent = @FooterContent");
                    }

                    // Combine all fields into the update query
                    updateQuery += string.Join(", ", updateFields);
                    updateQuery += " WHERE reportID = @ReportID";

                    SqlCommand command = new SqlCommand(updateQuery, connection);
                    command.Parameters.AddWithValue("@ReportID", reportId);
                    if (reportCustomization.HeaderBGColor != null)
                    {
                        command.Parameters.AddWithValue("@HeaderBGColor", reportCustomization.HeaderBGColor);
                    }
                    if (reportCustomization.FooterBGColor != null)
                    {
                        command.Parameters.AddWithValue("@FooterBGColor", reportCustomization.FooterBGColor);
                    }
                    if (reportCustomization.BodyBGColor != null)
                    {
                        command.Parameters.AddWithValue("@BodyBGColor", reportCustomization.BodyBGColor);
                    }
                    if (reportCustomization.TableBorderVisible != null)
                    {
                        command.Parameters.AddWithValue("@TableBorderVisible", reportCustomization.TableBorderVisible);
                    }
                    if (reportCustomization.CellContentPadding != null)
                    {
                        command.Parameters.AddWithValue("@CellContentPadding", reportCustomization.CellContentPadding);
                    }
                    if (reportCustomization.TableTopPadding != null)
                    {
                        command.Parameters.AddWithValue("@TableTopPadding", reportCustomization.TableTopPadding);
                    }
                    if (reportCustomization.TableDataAlign != null)
                    {
                        command.Parameters.AddWithValue("@TableDataAlign", reportCustomization.TableDataAlign);
                    }
                    if (reportCustomization.FooterContent != null)
                    {
                        command.Parameters.AddWithValue("@FooterContent", reportCustomization.FooterContent);
                    }

                    await command.ExecuteNonQueryAsync();

                    return Ok();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

    }
}
