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
                            LogoImage = reader.IsDBNull(reader.GetOrdinal("LogoImage")) ? null : (byte[])reader["LogoImage"],
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
                            LogoImage = reader.IsDBNull(reader.GetOrdinal("LogoImage")) ? null : (byte[])reader["LogoImage"],
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
        public async Task<ActionResult<Report>> PostReport(Report report)
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
                    command.Parameters.AddWithValue("@LogoImage", report.LogoImage);
                    command.Parameters.AddWithValue("@CreatedDate", DateTime.Now);
                    command.Parameters.AddWithValue("@LastModifiedDate", DateTime.Now);

                    await connection.OpenAsync();

                    // ExecuteScalarAsync returns the first column of the first row in the result set returned by the query
                    // In this case, it returns the newly inserted ReportID
                    int newReportId = Convert.ToInt32(await command.ExecuteScalarAsync());

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
        public async Task<IActionResult> PutReport(int id, Report report)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"UPDATE Reports 
                             SET LastModifiedDate = @LastModifiedDate";

                    // Check if Title is provided
                    if (report.Title != null)
                    {
                        query += ", Title = @Title";
                    }

                    // Check if LogoImage is provided
                    if (report.LogoImage != null)
                    {
                        query += ", LogoImage = @LogoImage";
                    }

                    query += " WHERE ReportID = @ReportID";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@ReportID", id);
                    command.Parameters.AddWithValue("@LastModifiedDate", DateTime.Now);

                    // Add parameters if provided
                    if (report.Title != null)
                    {
                        command.Parameters.AddWithValue("@Title", report.Title);
                    }

                    if (report.LogoImage != null)
                    {
                        command.Parameters.AddWithValue("@LogoImage", report.LogoImage);
                    }

                    await connection.OpenAsync();

                    int rowsAffected = await command.ExecuteNonQueryAsync();

                    if (rowsAffected == 0)
                    {
                        return NotFound();
                    }

                    return NoContent();
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
        public async Task<IActionResult> PutReportFormatting(int reportId, [FromBody] List<UpdateReportDataDto> updateDataDtos)
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
    }
}
