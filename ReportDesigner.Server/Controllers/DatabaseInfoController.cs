using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace ReportDesignerPrac.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DatabaseInfoController : ControllerBase
    {
        private const string DefaultConnectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=FSEP_DB;Integrated Security=True";
        private const string DatabaseQuery = "SELECT name FROM sys.databases WHERE name NOT IN ('master', 'tempdb', 'model', 'msdb');";

        [HttpGet("databases")]
        public IActionResult GetDatabases()
        {
            try
            {
                List<string> databases = new List<string>();

                using (SqlConnection connection = new SqlConnection(DefaultConnectionString))
                {
                    SqlCommand command = new SqlCommand(DatabaseQuery, connection);
                    connection.Open();
                    SqlDataReader reader = command.ExecuteReader();
                    while (reader.Read())
                    {
                        databases.Add(reader["name"].ToString());
                    }
                    reader.Close();
                }

                return Ok(databases);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("tables")]
        public IActionResult GetTables(string databaseName)
        {
            if (string.IsNullOrEmpty(databaseName))
                return BadRequest("Database name is required.");

            try
            {
                List<string> tables = new List<string>();

                string tableQuery = $"USE {databaseName}; SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';";

                using (SqlConnection connection = new SqlConnection(DefaultConnectionString))
                {
                    SqlCommand command = new SqlCommand(tableQuery, connection);
                    connection.Open();
                    SqlDataReader reader = command.ExecuteReader();
                    while (reader.Read())
                    {
                        tables.Add(reader["TABLE_NAME"].ToString());
                    }
                    reader.Close();
                }

                return Ok(tables);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("tabledata")]
        public IActionResult GetTableData(string databaseName, string tableName)
        {
            if (string.IsNullOrEmpty(databaseName) || string.IsNullOrEmpty(tableName))
                return BadRequest("Database name and table name are required.");

            try
            {
                List<Dictionary<string, object>> tableData = new List<Dictionary<string, object>>();

                string dataQuery = $"USE {databaseName}; SELECT * FROM {tableName};";

                using (SqlConnection connection = new SqlConnection(DefaultConnectionString))
                {
                    connection.Open();
                    using (SqlCommand command = new SqlCommand(dataQuery, connection))
                    {
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Dictionary<string, object> rowData = new Dictionary<string, object>();

                                for (int i = 0; i < reader.FieldCount; i++)
                                {
                                    rowData.Add(reader.GetName(i), reader.GetValue(i));
                                }

                                tableData.Add(rowData);
                            }
                        }
                    }
                }

                return Ok(tableData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("status")]
        public IActionResult GetConnectionStatus()
        {
            return Ok("Connected");
        }
    }
}