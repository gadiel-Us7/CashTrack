using System.ComponentModel.DataAnnotations;

namespace CashTrackApi.Models
{
    public class Estado
    {
        [Key]
        public int IdEstado { get; set; }

        [Required]
        public DateTime Fecha { get; set; }

        public virtual ICollection<Gasto> Gastos { get; set; } = new List<Gasto>();
    }
}
