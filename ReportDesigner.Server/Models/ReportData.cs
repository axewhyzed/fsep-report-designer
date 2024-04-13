namespace ReportDesigner.Server.Models
{
    public class ReportData
    {
        public int DataID { get; set; }
        public int ReportID { get; set; }
        public int ?RowIndex { get; set; }
        public int ?ColumnIndex { get; set; }
        public string? CellValue { get; set; }
    }
}
