namespace CashTrackApi.Data;

using CashTrackApi.Models;
using Microsoft.EntityFrameworkCore;


public class AppDBContext : DbContext
{
    public AppDBContext(DbContextOptions<AppDBContext> options)
        : base(options)
    {
    }

    public DbSet<Gasto> Gastos { get; set; }
    public DbSet<DetalleGasto> DetallesGasto { get; set; }
    public DbSet<Estado> Estados { get; set; }
    public DbSet<Categoria> Categorias { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configurar relaciones - CORREGIDO: usar Categoria en lugar de CategoriaNavigation
        modelBuilder.Entity<Gasto>()
            .HasOne(g => g.Estado)
            .WithMany(e => e.Gastos)
            .HasForeignKey(g => g.IdEstado);

        modelBuilder.Entity<Gasto>()
            .HasOne(g => g.DetalleGasto)
            .WithMany(d => d.Gastos)
            .HasForeignKey(g => g.IdDetalleGasto);

        modelBuilder.Entity<DetalleGasto>()
            .HasOne(d => d.Categoria)  // CORREGIDO: Categoria, no CategoriaNavigation
            .WithMany(c => c.DetallesGasto)
            .HasForeignKey(d => d.IdCategoria);

        // Datos de ejemplo
        modelBuilder.Entity<Categoria>().HasData(
        new Categoria { IdCategoria = 1, Nombre = "Alimentación", Icono = "bi bi-egg-fried" },
        new Categoria { IdCategoria = 2, Nombre = "Transporte", Icono = "bi bi-bus-front" },
        new Categoria { IdCategoria = 3, Nombre = "Servicios", Icono = "bi bi-lightbulb" },
        new Categoria { IdCategoria = 4, Nombre = "Entretenimiento", Icono = "bi bi-tv" },
        new Categoria { IdCategoria = 5, Nombre = "Salud", Icono = "bi bi-heart-pulse" },
        new Categoria { IdCategoria = 6, Nombre = "Educación", Icono = "bi bi-book" },
        new Categoria { IdCategoria = 7, Nombre = "Compras", Icono = "bi bi-bag" },
        new Categoria { IdCategoria = 8, Nombre = "Vivienda", Icono = "bi bi-house" },
        new Categoria { IdCategoria = 9, Nombre = "Tecnología", Icono = "bi bi-pc" },
        new Categoria { IdCategoria = 10, Nombre = "General", Icono = "bi bi-tag" }
        );
    }
}
