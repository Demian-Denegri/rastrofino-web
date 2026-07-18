//Llamo a la api
const API_URL = "https://rastrofino-api.onrender.com";

//muestra un mensaje x en la pantalla por 3 segundos y despues desaparece
function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.innerText = mensaje;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 3000);
}
//le pido a mi api la lista de categorias que tengo y las meto en la seleccion de categorias del formulñario
async function cargarCategorias() {
  const response = await fetch(`${API_URL}/api/categorias`);
  const categorias = await response.json();
  const select = document.getElementById("prodCategoria");
  categorias.forEach((cat) => {
    select.innerHTML += `<option value="${cat.idCategoria}">${cat.nombre}</option>`;
  });
}
//le pido a mi api la lista de generos que tengo y las meto en la seleccion de Generos del formulario
async function cargarGeneros() {
  const response = await fetch(`${API_URL}/api/generos`);
  const generos = await response.json();
  const select = document.getElementById("prodGenero");
  generos.forEach((gen) => {
    select.innerHTML += `<option value="${gen.idGenero}">${gen.nombre}</option>`;
  });
}
// agarro todos los productos en la BD para mostrarlos y editarlos en el panel admin
async function cargarProductosAdmin() {
  const response = await fetch(`${API_URL}/api/productos/todos`);
  const productos = await response.json();
  const grid = document.getElementById("gridAdmin");
  grid.innerHTML = "";
  productos.forEach((producto) => {
    grid.innerHTML += `
      <div class="card">
        <img src="${producto.imagen || "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop"}">
        <div class="contenido">
          <h2>${producto.nombre}</h2>
          <p class="precio">$${producto.precio.toLocaleString()}</p>
          <p>Stock: ${producto.stock}</p>
          <p>Estado: ${producto.activo ? "✅ Activo" : "❌ Inactivo"}</p>
          <input type="number" id="precio_${producto.idProducto}" value="${producto.precio}" placeholder="Nuevo precio">
          <input type="number" id="stock_${producto.idProducto}" value="${producto.stock}" placeholder="Nuevo stock">
          <button onclick="editarProducto(${producto.idProducto})">Guardar cambios</button>
          <button class="cerrar" onclick="${producto.activo ? `desactivarProducto(${producto.idProducto})` : `activarProducto(${producto.idProducto})`}">
            ${producto.activo ? "Desactivar" : "Reactivar"}
          </button>
        </div>
      </div>
    `;
  });
}
//para crear un producto nuevo, se toman los datos que se metieron en el formulario
async function crearProducto() {
  let producto = {
    nombre: document.getElementById("prodNombre").value,
    descripcion: document.getElementById("prodDescripcion").value,
    precio: parseFloat(document.getElementById("prodPrecio").value),
    stock: parseInt(document.getElementById("prodStock").value),
    imagen: document.getElementById("prodImagen").value,
    idCategoria: parseInt(document.getElementById("prodCategoria").value),
    idGenero: document.getElementById("prodGenero").value
      ? parseInt(document.getElementById("prodGenero").value)
      : null,
    ml: document.getElementById("prodMl").value
      ? parseInt(document.getElementById("prodMl").value)
      : null,
    activo: true,
  };
  if (
    !producto.nombre ||
    !producto.precio ||
    !producto.stock ||
    !producto.idCategoria
  ) {
    mostrarToast("Completá los campos obligatorios.");
    return;
  }
  await fetch(`${API_URL}/api/productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  mostrarToast("Producto guardado!");
  cargarProductosAdmin();
}
//desactivo un producto y luego envio un msg en pantalla avisando qeu se desactivo
async function desactivarProducto(id) {
  await fetch(`${API_URL}/api/productos/${id}`, {
    method: "DELETE",
  });
  mostrarToast("Producto desactivado!");
  cargarProductosAdmin();
}
//Activo un producto y luego envio un msg en pantalla avisando qeu se Activo
async function activarProducto(id) {
  await fetch(`${API_URL}/api/productos/activar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  mostrarToast("Producto reactivado!");
  cargarProductosAdmin();
}
// funcion para actualizar precio y stock de un producto en la BD
async function editarProducto(id) {
  let precio = parseFloat(document.getElementById(`precio_${id}`).value);
  let stock = parseInt(document.getElementById(`stock_${id}`).value);
  const responseGet = await fetch(`${API_URL}/api/productos/${id}`);
  let producto = await responseGet.json();
  producto.precio = precio;
  producto.stock = stock;
  const response = await fetch(`${API_URL}/api/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (response.ok) {
    mostrarToast("Producto actualizado!");
    cargarProductosAdmin();
  } else {
    mostrarToast("Hubo un error al actualizar.");
  }
}

//Carga los datos del cliente para mostrarlos en la seccion de pedidos, si no se cargan muestra un error

async function cargarPedidos() {
  const response = await fetch(`${API_URL}/api/pedidos`);
  const pedidos = await response.json();
  const lista = document.getElementById("listaPedidos");
  lista.innerHTML = "";

  for (const pedido of pedidos) {
    let cliente = null;
    try {
      const resCliente = await fetch(
        `${API_URL}/api/clientes/${pedido.idCliente}`,
      );
      cliente = await resCliente.json();
    } catch {
      cliente = null;
    }

    lista.innerHTML += `
      <div class="card">
        <div class="contenido">
          <h2>Pedido #${pedido.idPedido}</h2>

          <p><strong>📅 Fecha:</strong> ${new Date(pedido.fecha).toLocaleDateString()}</p>
          <p><strong>📦 Estado:</strong> ${pedido.estado}</p>
          <p class="precio"><strong>💰 Total:</strong> $${pedido.total.toLocaleString()}</p>

          <hr>

          ${
            cliente
              ? `
            <p><strong>👤 Cliente:</strong> ${cliente.nombre} ${cliente.apellido}</p>
            <p><strong>📧 Email:</strong> ${cliente.email}</p>
            <p><strong>📱 Teléfono:</strong> <a href="https://wa.me/549${cliente.telefono}">${cliente.telefono}</a></p>
            ${cliente.direccion ? `<p><strong>📍 Dirección:</strong> ${cliente.direccion}</p>` : ""}
          `
              : `<p>⚠️ No se pudieron cargar los datos del cliente.</p>`
          }

          <hr>

          <label><strong>Cambiar estado:</strong></label>
          <select id="estado_${pedido.idPedido}">
            <option value="Pendiente"    ${pedido.estado === "Pendiente" ? "selected" : ""}>⏳ Pendiente</option>
            <option value="En camino"    ${pedido.estado === "En camino" ? "selected" : ""}>🚚 En camino</option>
            <option value="Entregado"    ${pedido.estado === "Entregado" ? "selected" : ""}>✅ Entregado</option>
            <option value="Cancelado"    ${pedido.estado === "Cancelado" ? "selected" : ""}>❌ Cancelado</option>
          </select>
          <button onclick="cambiarEstado(${pedido.idPedido})">Guardar estado</button>

        </div>
      </div>
    `;
  }
}

//Lo que hace es traer el pedido completo con un GET, le cambia solo el estado y lo manda de vuelta con PUT

async function cambiarEstado(id) {
  const nuevoEstado = document.getElementById(`estado_${id}`).value;

  const resGet = await fetch(`${API_URL}/api/pedidos/${id}`);
  let pedido = await resGet.json();
  pedido.estado = nuevoEstado;

  const response = await fetch(`${API_URL}/api/pedidos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });

  if (response.ok) {
    mostrarToast("Estado actualizado!");
    cargarPedidos();
  } else {
    mostrarToast("Error al actualizar el estado.");
  }
}
// Carga las categorias en el dropdown del formulario de nuevo producto
cargarCategorias();
// Carga los géneros en el dropdown del formulario de nuevo producto
cargarGeneros();
// Carga todos los productos (activos e inactivos) en el panel admin
cargarProductosAdmin();
// Carga todos los pedidos con los datos del cliente
cargarPedidos();
