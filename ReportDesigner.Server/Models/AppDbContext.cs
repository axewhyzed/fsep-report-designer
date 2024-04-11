using Microsoft.EntityFrameworkCore;

namespace ReportDesigner.Server.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
        {
        }

        // DbSet properties for your entities
        public DbSet<Report> Reports { get; set; }
        public DbSet<ReportData> ReportData { get; set; }
    }
}
