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
                    string query = "DELETE FROM Reports WHERE ReportID = @ReportID";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@ReportID", id);

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
                                Bold = Convert.ToBoolean(reader["Bold"]),
                                Italic = Convert.ToBoolean(reader["Italic"]),
                                Underline = Convert.ToBoolean(reader["Underline"]),
                                Strikethrough = Convert.ToBoolean(reader["Strikethrough"]),
                                FontSize = Convert.ToInt32(reader["FontSize"]),
                                FontFamily = reader["FontFamily"].ToString(),
                                FontColor = reader["FontColor"].ToString(),
                                BackgroundColor = reader["BackgroundColor"].ToString()
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
                                Bold = Convert.ToBoolean(reader["Bold"]),
                                Italic = Convert.ToBoolean(reader["Italic"]),
                                Underline = Convert.ToBoolean(reader["Underline"]),
                                Strikethrough = Convert.ToBoolean(reader["Strikethrough"]),
                                FontSize = Convert.ToInt32(reader["FontSize"]),
                                FontFamily = reader["FontFamily"].ToString(),
                                FontColor = reader["FontColor"].ToString(),
                                BackgroundColor = reader["BackgroundColor"].ToString()
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


        // POST: api/Reports/{reportId}/ReportData
        [HttpPost("{reportId}/ReportData")]
        public async Task<ActionResult<ReportData>> PostReportData(int reportId, ReportData reportData)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"INSERT INTO ReportData (ReportID, RowIndex, ColumnIndex, CellValue, Bold, Italic, Underline, Strikethrough, FontSize, FontFamily, FontColor, BackgroundColor) 
                             VALUES (@ReportID, @RowIndex, @ColumnIndex, @CellValue, @Bold, @Italic, @Underline, @Strikethrough, @FontSize, @FontFamily, @FontColor, @BackgroundColor);
                             SELECT SCOPE_IDENTITY();";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@ReportID", reportId);
                    command.Parameters.AddWithValue("@RowIndex", reportData.RowIndex);
                    command.Parameters.AddWithValue("@ColumnIndex", reportData.ColumnIndex);
                    command.Parameters.AddWithValue("@CellValue", reportData.CellValue);
                    command.Parameters.AddWithValue("@Bold", reportData.Bold);
                    command.Parameters.AddWithValue("@Italic", reportData.Italic);
                    command.Parameters.AddWithValue("@Underline", reportData.Underline);
                    command.Parameters.AddWithValue("@Strikethrough", reportData.Strikethrough);
                    command.Parameters.AddWithValue("@FontSize", reportData.FontSize);
                    command.Parameters.AddWithValue("@FontFamily", reportData.FontFamily);
                    command.Parameters.AddWithValue("@FontColor", reportData.FontColor);
                    command.Parameters.AddWithValue("@BackgroundColor", reportData.BackgroundColor);

                    await connection.OpenAsync();

                    // ExecuteScalarAsync returns the first column of the first row in the result set returned by the query
                    // In this case, it returns the newly inserted DataID
                    int newDataId = Convert.ToInt32(await command.ExecuteScalarAsync());

                    // Update the DataID of the reportData object with the newly generated ID
                    reportData.DataID = newDataId;

                    return CreatedAtAction(nameof(GetReportData), new { reportId, dataId = newDataId }, reportData);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }


        // PUT: api/Reports/{reportId}/ReportData/{dataId}
        [HttpPut("{reportId}/ReportData/{dataId}")]
        public async Task<IActionResult> PutReportData(int reportId, int dataId, ReportData reportData)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"UPDATE ReportData 
                             SET RowIndex = @RowIndex,
                                 ColumnIndex = @ColumnIndex,
                                 CellValue = @CellValue,
                                 Bold = @Bold,
                                 Italic = @Italic,
                                 Underline = @Underline,
                                 Strikethrough = @Strikethrough,
                                 FontSize = @FontSize,
                                 FontFamily = @FontFamily,
                                 FontColor = @FontColor,
                                 BackgroundColor = @BackgroundColor
                             WHERE DataID = @DataID AND ReportID = @ReportID";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@RowIndex", reportData.RowIndex);
                    command.Parameters.AddWithValue("@ColumnIndex", reportData.ColumnIndex);
                    command.Parameters.AddWithValue("@CellValue", reportData.CellValue);
                    command.Parameters.AddWithValue("@Bold", reportData.Bold);
                    command.Parameters.AddWithValue("@Italic", reportData.Italic);
                    command.Parameters.AddWithValue("@Underline", reportData.Underline);
                    command.Parameters.AddWithValue("@Strikethrough", reportData.Strikethrough);
                    command.Parameters.AddWithValue("@FontSize", reportData.FontSize);
                    command.Parameters.AddWithValue("@FontFamily", reportData.FontFamily);
                    command.Parameters.AddWithValue("@FontColor", reportData.FontColor);
                    command.Parameters.AddWithValue("@BackgroundColor", reportData.BackgroundColor);
                    command.Parameters.AddWithValue("@DataID", dataId);
                    command.Parameters.AddWithValue("@ReportID", reportId);

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

        // DELETE: api/Reports/{reportId}/ReportData/{dataId}
        [HttpDelete("{reportId}/ReportData/{dataId}")]
        public async Task<IActionResult> DeleteReportData(int reportId, int dataId)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string query = @"DELETE FROM ReportData 
                             WHERE DataID = @DataID AND ReportID = @ReportID";

                    SqlCommand command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@DataID", dataId);
                    command.Parameters.AddWithValue("@ReportID", reportId);

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

    }
}
