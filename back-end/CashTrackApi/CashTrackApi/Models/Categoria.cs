using System.ComponentModel.DataAnnotations;

namespace CashTrackApi.Models
{
    public class Categoria
    {
        [Key]
        public int IdCategoria { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Icono { get; set; } = "bi bi-tag"; // Default Bootstrap icon

        // Relación
        public virtual ICollection<DetalleGasto> DetallesGasto { get; set; } = new List<DetalleGasto>();
    }
}