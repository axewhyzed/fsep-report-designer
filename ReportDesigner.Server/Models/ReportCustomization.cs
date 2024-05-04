namespace ReportDesigner.Server.Models
{
    public class ReportCustomization
    {
        public int ReportID { get; set; }
        public string? HeaderBGColor { get; set; }
        public string? FooterBGColor { get; set; }
        public string? BodyBGColor { get; set; }
        public bool? TableBorderVisible { get; set; }
        public int? CellContentPadding { get; set; }
        public int? TableTopPadding { get; set; }
        public string? TableDataAlign { get; set; }
        public string? FooterContent { get; set; }
    }
}
