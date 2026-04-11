namespace CashTrackApi.DTOs
{
    public class CreateGastoDto
    {
        public string Descripcion { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string CategoriaNombre { get; set; } = string.Empty;
        public string DetalleDescripcion { get; set; } = string.Empty;
        public DateTime? Fecha { get; set; }
    }
}
