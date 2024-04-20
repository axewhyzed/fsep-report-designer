namespace ReportDesigner.Server.Models
{
    public class ReportUpdateDto
    {
        public string? Title { get; set; }
        public IFormFile? LogoImage { get; set; }
    }
}
