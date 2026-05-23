const API_URL = "https://localhost:7099";

async function cargarProductos() {
  const grid = document.getElementById("grid");
  
  const response = await fetch(`${API_URL}/api/productos`);
  const productos = await response.json();

//para cambiar la cantidad de productos a comprar
  grid.innerHTML = "";
  productos.forEach((producto, index) => {
    const id = `cant${index}`;
    grid.innerHTML += `
 <div class="card">
    <img src="${producto.imagen || 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop'}">
    <div class="contenido">
      <h2>${producto.nombre}</h2>
      <p class="precio">$${producto.precio.toLocaleString()}</p>
      <div class="cantidad">
        <button onclick="restar('${id}')">-</button>
        <span id="${id}">1</span>
        <button onclick="sumar('${id}')">+</button>
      </div>
      <button onclick="comprar('${producto.nombre}', ${producto.precio}, '${id}')">
        Comprar
      </button>
    </div>
  </div>
`;
  });
}

function sumar(id) {
  let span = document.getElementById(id);
  span.innerText = parseInt(span.innerText) + 1;
}

function restar(id) {
  let span = document.getElementById(id);
  let actual = parseInt(span.innerText);
  if(actual > 1) span.innerText = actual - 1;
}

cargarProductos();


let nombreProducto = "";
let cantidadProducto = 0;
let totalProducto = 0;

function comprar(nombre, precio, inputId){

  let cantidad = document.getElementById(inputId).innerText;

if (isNaN(cantidad) || cantidad <1) {
    cantidad = 1;
    document.getElementById(inputId).innerText = 1;
}
//para calcular el precio
  let total = precio * cantidad;

  nombreProducto = nombre;
  cantidadProducto = cantidad;
  totalProducto = total;

  document.getElementById("producto").innerHTML =
  "<strong>Perfume:</strong> " + nombre;

  document.getElementById("cantidad").innerHTML =
  "<strong>Cantidad:</strong> " + cantidad;

  document.getElementById("total").innerHTML =
  "<strong>Total:</strong> $" + total.toLocaleString();

  document.getElementById("modal").style.display = "flex";
}

document.getElementById("metodoPago").addEventListener("change", function(){

  let metodo = this.value;

  let info = document.getElementById("infoTransferencia");

  if(metodo === "Transferencia"){

    info.style.display = "block";

  }else{

    info.style.display = "none";
  }

});

document.getElementById("whatsappBtn").addEventListener("click", async function(){

  let metodo = document.getElementById("metodoPago").value;

  // Tomo los datos del cliente del formulario
  let nombre = document.getElementById("clienteNombre").value;
  let apellido = document.getElementById("clienteApellido").value;
  let email = document.getElementById("clienteEmail").value;
  let telefono = document.getElementById("clienteTelefono").value;

  if(!nombre || !apellido || !email || !telefono){
    alert("Por favor completá todos los campos obligatorios.");
    return;
  }
  // Guardar cliente en la BD
  let responseCliente = await fetch(`${API_URL}/api/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente)
  });

  let clienteGuardado = await responseCliente.json();

  // Guardar pedido en la BD
  let pedido = {
    idCliente: clienteGuardado.idCliente,
    estado: "Pendiente",
    total: totalProducto
  };

  await fetch(`${API_URL}/api/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido)
  });

  // Mandar WhatsApp
  let mensajeWhatsapp =
  `Hola! Quiero realizar un pedido:%0A%0A` +
  `Perfume: ${nombreProducto}%0A` +
  `Cantidad: ${cantidadProducto}%0A` +
  `Total: $${totalProducto}%0A` +
  `Método de pago: ${metodo}`;

  if(metodo === "Transferencia"){
    mensajeWhatsapp += `%0A%0AYa realicé la transferencia.`;
  }

  let numero = "5491140952888";
  let url = `https://wa.me/${numero}?text=${mensajeWhatsapp}`;
  window.open(url, "_blank");
});
function cerrarModal(){

  document.getElementById("modal").style.display = "none";
}