namespace CashTrackApi.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using CashTrackApi.Models;
using CashTrackApi.Data;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly AppDBContext _context;

    public CategoriasController(AppDBContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categorias = await _context.Categorias
            .Select(c => new
            {
                c.IdCategoria,
                c.Nombre,
                c.Icono  // ← Incluir icono en la respuesta
            })
            .ToListAsync();
        return Ok(categorias);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var categoria = await _context.Categorias
            .Where(c => c.IdCategoria == id)
            .Select(c => new
            {
                c.IdCategoria,
                c.Nombre,
                c.Icono
            })
            .FirstOrDefaultAsync();

        if (categoria == null)
            return NotFound();
        return Ok(categoria);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Categoria categoria)
    {
        // Validar que tenga nombre
        if (string.IsNullOrWhiteSpace(categoria.Nombre))
            return BadRequest("El nombre es requerido");

        // Icono por defecto si no viene
        if (string.IsNullOrWhiteSpace(categoria.Icono))
            categoria.Icono = "bi bi-tag";

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = categoria.IdCategoria }, new
        {
            categoria.IdCategoria,
            categoria.Nombre,
            categoria.Icono
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Categoria categoriaActualizada)
    {
        if (id != categoriaActualizada.IdCategoria)
            return BadRequest();

        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
            return NotFound();

        categoria.Nombre = categoriaActualizada.Nombre;
        categoria.Icono = categoriaActualizada.Icono;  // ← Actualizar icono

        await _context.SaveChangesAsync();

        return Ok(categoria);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var categoria = await _context.Categorias.FindAsync(id);
        if (categoria == null)
            return NotFound();

        _context.Categorias.Remove(categoria);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Nuevo endpoint: Obtener opciones de iconos Bootstrap
    [HttpGet("iconos")]
    public IActionResult GetIconos()
    {
        var iconos = new[]
        {
            new { valor = "bi bi-egg-fried", nombre = "Alimentación" },
            new { valor = "bi bi-bus-front", nombre = "Transporte" },
            new { valor = "bi bi-lightbulb", nombre = "Servicios" },
            new { valor = "bi bi-tv", nombre = "Entretenimiento" },
            new { valor = "bi bi-heart-pulse", nombre = "Salud" },
            new { valor = "bi bi-book", nombre = "Educación" },
            new { valor = "bi bi-bag", nombre = "Compras" },
            new { valor = "bi bi-house", nombre = "Vivienda" },
            new { valor = "bi bi-pc", nombre = "Tecnología" },
            new { valor = "bi bi-bicycle", nombre = "Deporte" },
            new { valor = "bi bi-gift", nombre = "Regalos" },
            new { valor = "bi bi-airplane", nombre = "Viajes" },
            new { valor = "bi bi-film", nombre = "Cine" },
            new { valor = "bi bi-music-note", nombre = "Música" },
            new { valor = "bi bi-pet", nombre = "Mascotas" }
        };

        return Ok(iconos);
    }
}