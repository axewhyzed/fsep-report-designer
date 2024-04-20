namespace ReportDesigner.Server.Models
{
    public class UpdateFormatDataDto
    {
        public ReportFormatting ReportFormatting { get; set; }
        public Report ?Report { get; set; }
    }
}
