namespace ReportDesigner.Server.Models
{
    public class Report
    {
        public int ReportID { get; set; }
        public string? Title { get; set; }
        public byte[]? LogoImage { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastModifiedDate { get; set; }
    }
}
