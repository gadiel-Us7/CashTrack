using CashTrackApi.Data;
using CashTrackApi.DTOs;
using CashTrackApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CashTrackApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GastosController : ControllerBase
    {
        private readonly AppDBContext _context;

        public GastosController(AppDBContext context)
        {
            _context = context;
        }

        // GET: api/gastos
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var gastos = await _context.Gastos
                .Include(g => g.DetalleGasto)
                    .ThenInclude(d => d.Categoria)
                .OrderByDescending(g => g.Fecha)
                .Select(g => new // Usar objeto anónimo en lugar de la entidad completa
                {
                    g.IdGasto,
                    g.Descripcion,
                    g.Monto,
                    g.Fecha,
                    Categoria = g.DetalleGasto != null ? g.DetalleGasto.Categoria.Nombre : "Sin categoría",
                    Detalle = g.DetalleGasto != null ? g.DetalleGasto.Descripcion : "Sin detalle",
                    FechaRegistro = g.Estado != null ? g.Estado.Fecha : DateTime.MinValue
                })
                .ToListAsync();

            return Ok(gastos);
        }

        // GET: api/gastos/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var gasto = await _context.Gastos
                .Include(g => g.DetalleGasto)
                    .ThenInclude(d => d.Categoria)
                .Where(g => g.IdGasto == id)
                .Select(g => new
                {
                    g.IdGasto,
                    g.Descripcion,
                    g.Monto,
                    g.Fecha,
                    Categoria = g.DetalleGasto != null ? g.DetalleGasto.Categoria.Nombre : "Sin categoría",
                    CategoriaId = g.DetalleGasto != null ? g.DetalleGasto.Categoria.IdCategoria : 0,
                    Detalle = g.DetalleGasto != null ? g.DetalleGasto.Descripcion : "Sin detalle",
                    DetalleId = g.DetalleGasto != null ? g.DetalleGasto.IdDetalleGasto : 0,
                    FechaRegistro = g.Estado != null ? g.Estado.Fecha : DateTime.MinValue
                })
                .FirstOrDefaultAsync();

            if (gasto == null)
                return NotFound();

            return Ok(gasto);
        }

        // POST: api/gastos
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGastoDto gastoDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Validar datos mínimos
            if (string.IsNullOrWhiteSpace(gastoDto.Descripcion))
                return BadRequest("La descripción es requerida");

            if (gastoDto.Monto <= 0)
                return BadRequest("El monto debe ser mayor a 0");

            // Usar transacción para garantizar integridad
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Buscar o crear la categoría
                var categoriaNombre = string.IsNullOrWhiteSpace(gastoDto.CategoriaNombre)
                    ? "General"
                    : gastoDto.CategoriaNombre.Trim();

                var categoria = await _context.Categorias
                    .FirstOrDefaultAsync(c => c.Nombre == categoriaNombre);

                if (categoria == null)
                {
                    categoria = new Categoria
                    {
                        Nombre = categoriaNombre
                    };
                    _context.Categorias.Add(categoria);
                    await _context.SaveChangesAsync();
                }

                // 2. Buscar o crear el detalle de gasto
                var detalleDescripcion = string.IsNullOrWhiteSpace(gastoDto.DetalleDescripcion)
                    ? gastoDto.Descripcion
                    : gastoDto.DetalleDescripcion.Trim();

                var detalleGasto = await _context.DetallesGasto
                    .FirstOrDefaultAsync(d => d.Descripcion == detalleDescripcion && d.IdCategoria == categoria.IdCategoria);

                if (detalleGasto == null)
                {
                    detalleGasto = new DetalleGasto
                    {
                        Descripcion = detalleDescripcion,
                        IdCategoria = categoria.IdCategoria
                    };
                    _context.DetallesGasto.Add(detalleGasto);
                    await _context.SaveChangesAsync();
                }

                // 3. Crear el estado
                var estado = new Estado
                {
                    Fecha = DateTime.Now
                };
                _context.Estados.Add(estado);
                await _context.SaveChangesAsync();

                // 4. Crear el gasto
                var gasto = new Gasto
                {
                    Descripcion = gastoDto.Descripcion,
                    Monto = gastoDto.Monto,
                    Fecha = gastoDto.Fecha ?? DateTime.Now,
                    IdEstado = estado.IdEstado,
                    IdDetalleGasto = detalleGasto.IdDetalleGasto
                };

                _context.Gastos.Add(gasto);
                await _context.SaveChangesAsync();

                // Confirmar transacción
                await transaction.CommitAsync();

                // Devolver el gasto creado con información completa (usando objeto anónimo)
                var resultado = new
                {
                    gasto.IdGasto,
                    gasto.Descripcion,
                    gasto.Monto,
                    gasto.Fecha,
                    Categoria = categoria.Nombre,
                    Detalle = detalleGasto.Descripcion,
                    FechaRegistro = estado.Fecha
                };

                return CreatedAtAction(nameof(GetById), new { id = gasto.IdGasto }, resultado);
            }
            catch (Exception ex)
            {
                // Si algo sale mal, revertir todo
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    error = "Error al crear el gasto",
                    detalles = ex.Message
                });
            }
        }

        // PUT: api/gastos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateGastoDto gastoDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var gasto = await _context.Gastos.FindAsync(id);
                if (gasto == null)
                    return NotFound();

                // Actualizar datos del gasto
                gasto.Descripcion = gastoDto.Descripcion;
                gasto.Monto = gastoDto.Monto;
                gasto.Fecha = gastoDto.Fecha ?? gasto.Fecha;

                // Actualizar o crear categoría si es necesario
                if (!string.IsNullOrWhiteSpace(gastoDto.CategoriaNombre))
                {
                    var categoria = await _context.Categorias
                        .FirstOrDefaultAsync(c => c.Nombre == gastoDto.CategoriaNombre);

                    if (categoria == null)
                    {
                        categoria = new Categoria { Nombre = gastoDto.CategoriaNombre };
                        _context.Categorias.Add(categoria);
                        await _context.SaveChangesAsync();
                    }

                    // Actualizar detalle de gasto
                    var detalleDescripcion = string.IsNullOrWhiteSpace(gastoDto.DetalleDescripcion)
                        ? gastoDto.Descripcion
                        : gastoDto.DetalleDescripcion;

                    var detalleGasto = await _context.DetallesGasto
                        .FirstOrDefaultAsync(d => d.IdDetalleGasto == gasto.IdDetalleGasto);

                    if (detalleGasto != null)
                    {
                        detalleGasto.Descripcion = detalleDescripcion;
                        detalleGasto.IdCategoria = categoria.IdCategoria;
                        _context.DetallesGasto.Update(detalleGasto);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Devolver el gasto actualizado (usando objeto anónimo)
                var resultado = new
                {
                    gasto.IdGasto,
                    gasto.Descripcion,
                    gasto.Monto,
                    gasto.Fecha,
                    Categoria = gastoDto.CategoriaNombre ?? "Sin categoría",
                    Detalle = gastoDto.DetalleDescripcion ?? gastoDto.Descripcion
                };

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { error = "Error al actualizar", detalles = ex.Message });
            }
        }

        // DELETE: api/gastos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var gasto = await _context.Gastos.FindAsync(id);
                if (gasto == null)
                    return NotFound();

                _context.Gastos.Remove(gasto);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { error = "Error al eliminar", detalles = ex.Message });
            }
        }

        // GET: api/gastos/total
        [HttpGet("total")]
        public async Task<IActionResult> GetTotalGeneral()
        {
            var total = await _context.Gastos.SumAsync(g => g.Monto);

            return Ok(new
            {
                total = total,
                mensaje = "Total de todos los gastos",
                fechaConsulta = DateTime.Now
            });
        }

        // GET: api/gastos/resumen
        [HttpGet("resumen")]
        public async Task<IActionResult> GetResumen([FromQuery] DateTime? fechaInicio, [FromQuery] DateTime? fechaFin)
        {
            var inicio = fechaInicio ?? DateTime.Now.AddMonths(-1);
            var fin = fechaFin ?? DateTime.Now;

            var gastos = await _context.Gastos
                .Include(g => g.DetalleGasto)
                    .ThenInclude(d => d.Categoria)
                .Where(g => g.Fecha >= inicio && g.Fecha <= fin)
                .ToListAsync();

            var totalGeneral = gastos.Sum(g => g.Monto);

            var porCategoria = gastos
                .GroupBy(g => new {
                    Nombre = g.DetalleGasto?.Categoria?.Nombre ?? "Sin categoría",
                    Icono = g.DetalleGasto?.Categoria?.Icono ?? "bi bi-tag"  // ← Incluir icono
                })
                .Select(g => new
                {
                    Categoria = g.Key.Nombre,
                    Icono = g.Key.Icono,  // ← Devolver icono
                    Total = g.Sum(x => x.Monto),
                    Cantidad = g.Count(),
                    Porcentaje = totalGeneral > 0 ? (g.Sum(x => x.Monto) / totalGeneral) * 100 : 0
                })
                .OrderByDescending(x => x.Total)
                .ToList();

            var porMes = gastos
                .GroupBy(g => g.Fecha.ToString("yyyy-MM"))
                .Select(g => new
                {
                    Mes = g.Key,
                    Total = g.Sum(x => x.Monto),
                    Cantidad = g.Count()
                })
                .OrderBy(x => x.Mes)
                .ToList();

            return Ok(new
            {
                FechaInicio = inicio,
                FechaFin = fin,
                TotalGeneral = totalGeneral,
                TotalGastos = gastos.Count,
                GastoPromedio = gastos.Any() ? gastos.Average(g => g.Monto) : 0,
                GastoMaximo = gastos.Any() ? gastos.Max(g => g.Monto) : 0,
                GastoMinimo = gastos.Any() ? gastos.Min(g => g.Monto) : 0,
                GastosPorCategoria = porCategoria,
                GastosPorMes = porMes
            });
        }
    }
}