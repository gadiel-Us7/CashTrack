using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CashTrackApi.Models
{
    public class Gasto
    {
        [Key]
        public int IdGasto { get; set; }

        [Required]
        [MaxLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Monto { get; set; }

        [Required]
        public DateTime Fecha { get; set; }

        // Propiedades de navegación (opcionales para consultas)
        public virtual Estado? Estado { get; set; }
        public virtual DetalleGasto? DetalleGasto { get; set; }

        // Campos que se llenan automáticamente
        public int IdEstado { get; set; }
        public int IdDetalleGasto { get; set; }
    }
}
