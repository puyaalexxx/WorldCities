using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WorldCities.Server.Data.Models;

[Table("Countries")]
[Index(nameof(Name))]
[Index(nameof(ISO2))]
[Index(nameof(ISO3))]
public class Country
{
    [Key]
    [Required]
    public int Id { get; set; }

    public required string Name { get; set; }

    public required string ISO2 { get; set; }
    
    public required string ISO3 { get; set; }

    public ICollection<City>? Cities { get; set; }
}