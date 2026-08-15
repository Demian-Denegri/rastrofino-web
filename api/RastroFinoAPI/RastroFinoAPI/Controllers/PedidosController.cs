using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RastroFinoAPI.Data;
using RastroFinoAPI.Models;

namespace RastroFinoAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase

    {
        private readonly AppDbContext _context;

        public PedidosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/pedidos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidos()
        {
            return await _context.Pedidos.ToListAsync();
        }

        // GET: api/Pedidos/1
        [HttpGet("{id}")]
        public async Task<ActionResult<Pedido>> GetPedido(int id)
        {
            var Pedido = await _context.Pedidos.FindAsync(id);
            if (Pedido == null) return NotFound();
            return Pedido;
        }

        // POST: api/pedidos
        [HttpPost]
        public async Task<ActionResult<Pedido>> CrearPedido(Pedido pedido)
        {
            pedido.Fecha = DateTime.Now; //le da la fecha y hora actual
            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPedidos), new { id = pedido.IdPedido }, pedido);
        }

        // PUT: api/pedidos/1 (cambia el estado de un pedido desde el panel admin)
        [HttpPut("{id}")]
        public async Task<IActionResult> EditarPedido(int id, Pedido pedido)
        {
            if (id != pedido.IdPedido) return BadRequest();
            _context.Entry(pedido).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
        