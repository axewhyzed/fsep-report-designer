namespace ReportDesigner.Server.Models
{
    public class ReportFormatting
    {
        public int DataID { get; set; }
        public bool? Bold { get; set; }
        public bool? Italic { get; set; }
        public bool? Underline { get; set; }
        public bool? Strikethrough { get; set; }
        public int? FontSize { get; set; }
        public string? FontFamily { get; set; }
        public string? FontColor { get; set; }
        public string? BackgroundColor { get; set; }
    }
}
