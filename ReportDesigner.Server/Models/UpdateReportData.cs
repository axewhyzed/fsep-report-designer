namespace ReportDesigner.Server.Models
{
    public class UpdateReportDataDto
    {
        public ReportFormatting ReportFormatting { get; set; }
        public Report ?Report { get; set; }
    }
}
