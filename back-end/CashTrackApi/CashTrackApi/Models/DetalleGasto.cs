using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace CashTrackApi.Models
{
    public class DetalleGasto
    {
        [Key]
        public int IdDetalleGasto { get; set; }

        [Required]
        [MaxLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        [ForeignKey("Categoria")]
        public int IdCategoria { get; set; }

        // Relaciones
        public virtual Categoria? Categoria { get; set; }
        public virtual ICollection<Gasto> Gastos { get; set; } = new List<Gasto>();
    }
}
