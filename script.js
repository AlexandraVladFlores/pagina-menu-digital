/* ========================================
   CONFIGURACION DEL NEGOCIO
======================================== */

// Cambia este numero por el WhatsApp del restaurante.
// Incluye el codigo de pais y solo numeros.
const telefonoNegocio = "526941195909";

// Cambia este valor cuando se conozca el costo de envio.
const costoEnvio = 0;


/* ========================================
   ELEMENTOS DEL HTML
======================================== */

const botonesAgregar = document.querySelectorAll(".boton-agregar");
const listaPedido = document.getElementById("lista-pedido");
const subtotalTexto = document.getElementById("subtotal-pedido");
const envioTexto = document.getElementById("costo-envio");
const totalTexto = document.getElementById("total-pedido");

const formulario = document.getElementById("formulario-pedido");
const datosDomicilio = document.getElementById("datos-domicilio");
const direccionInput = document.getElementById("direccion-cliente");
const referenciaInput = document.getElementById("referencia-cliente");


/* ========================================
   LISTA DE PRODUCTOS ELEGIDOS
======================================== */

const productosElegidos = [];


/* ========================================
   FORMATO DE PRECIOS
======================================== */

function formatoPrecio(cantidad) {
    return cantidad.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
    });
}


/* ========================================
   MOSTRAR PRECIOS DEL MENU
======================================== */

// El precio se toma de data-precio del boton.
botonesAgregar.forEach(function(boton) {
    const precio = Number(boton.dataset.precio);
    const precioTexto = boton.closest(".opcion")
        .querySelector(".precio");

    precioTexto.textContent = formatoPrecio(precio);
});


/* ========================================
   AGREGAR PRODUCTOS
======================================== */

botonesAgregar.forEach(function(boton) {

    boton.addEventListener("click", function() {

        const nombre = boton.dataset.nombre;
        const precio = Number(boton.dataset.precio);

        const productoExistente = productosElegidos.find(
            function(producto) {
                return producto.nombre === nombre;
            }
        );

        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            productosElegidos.push({
                nombre: nombre,
                precio: precio,
                cantidad: 1
            });
        }

        actualizarPedido();
    });

});


/* ========================================
   ACTUALIZAR PEDIDO Y TOTALES
======================================== */

function actualizarPedido() {

    listaPedido.replaceChildren();

    let subtotal = 0;

    if (productosElegidos.length === 0) {

        const mensaje = document.createElement("p");
        mensaje.className = "pedido-vacio";
        mensaje.textContent = "Todavía no has agregado productos.";

        listaPedido.appendChild(mensaje);

    }

    productosElegidos.forEach(function(producto, indice) {

        const importe = producto.precio * producto.cantidad;
        subtotal += importe;

        const fila = document.createElement("div");
        fila.className = "producto-pedido";

        const informacion = document.createElement("div");

        const nombre = document.createElement("h4");
        nombre.textContent = producto.nombre;

        const detalle = document.createElement("p");
        detalle.textContent =
            formatoPrecio(producto.precio) + " por unidad";

        informacion.append(nombre, detalle);

        const controles = document.createElement("div");
        controles.className = "controles-pedido";

        const menos = document.createElement("button");
        menos.type = "button";
        menos.className = "boton-cantidad";
        menos.textContent = "−";
        menos.setAttribute("aria-label", "Restar " + producto.nombre);

        menos.addEventListener("click", function() {
            producto.cantidad--;

            if (producto.cantidad <= 0) {
                productosElegidos.splice(indice, 1);
            }

            actualizarPedido();
        });

        const cantidad = document.createElement("span");
        cantidad.textContent = producto.cantidad;

        const mas = document.createElement("button");
        mas.type = "button";
        mas.className = "boton-cantidad";
        mas.textContent = "+";
        mas.setAttribute("aria-label", "Agregar otra unidad de " + producto.nombre);

        mas.addEventListener("click", function() {
            producto.cantidad++;
            actualizarPedido();
        });

        const importeTexto = document.createElement("strong");
        importeTexto.textContent = formatoPrecio(importe);

        const quitar = document.createElement("button");
        quitar.type = "button";
        quitar.className = "boton-quitar";
        quitar.textContent = "Quitar";

        quitar.addEventListener("click", function() {
            productosElegidos.splice(indice, 1);
            actualizarPedido();
        });

        controles.append(menos, cantidad, mas, importeTexto, quitar);
        fila.append(informacion, controles);
        listaPedido.appendChild(fila);

    });

    const modalidad = document.querySelector(
        'input[name="modalidad"]:checked'
    );

    const envio = modalidad && modalidad.value === "domicilio"
        ? costoEnvio
        : 0;

    const total = subtotal + envio;

    subtotalTexto.textContent = formatoPrecio(subtotal);
    envioTexto.textContent = formatoPrecio(envio);
    totalTexto.textContent = formatoPrecio(total);
}


/* ========================================
   MOSTRAR U OCULTAR DOMICILIO
======================================== */

const opcionesModalidad = document.querySelectorAll(
    'input[name="modalidad"]'
);

opcionesModalidad.forEach(function(opcion) {

    opcion.addEventListener("change", function() {

        const esDomicilio = opcion.value === "domicilio"
            && opcion.checked;

        datosDomicilio.hidden = !esDomicilio;
        direccionInput.required = esDomicilio;

        actualizarPedido();
    });

});


/* ========================================
   ENVIAR PEDIDO POR WHATSAPP
======================================== */

formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();

    if (productosElegidos.length === 0) {
        alert("Primero agrega al menos un producto.");
        return;
    }

    if (telefonoNegocio.includes("X")) {
        alert("Primero configura el WhatsApp del negocio en script.js.");
        return;
    }

    const nombre = document.getElementById("nombre-cliente").value.trim();
    const apodo = document.getElementById("apodo-cliente").value.trim();
    const notas = document.getElementById("notas-cliente").value.trim();

    const modalidad = document.querySelector(
        'input[name="modalidad"]:checked'
    );

    if (!modalidad) {
        alert("Selecciona si comerás en el local o pedirás a domicilio.");
        return;
    }

    const esDomicilio = modalidad.value === "domicilio";
    const direccion = direccionInput.value.trim();
    const referencia = referenciaInput.value.trim();

    if (esDomicilio && !direccion) {
        alert("Escribe la dirección para el servicio a domicilio.");
        direccionInput.focus();
        return;
    }

    let subtotal = 0;
    let mensaje = "¡Hola! Quiero realizar este pedido:\n\n";

    mensaje += "CLIENTE\n";
    mensaje += "Nombre: " + nombre + "\n";
    
    if (apodo) {
        mensaje += "Apodo: " +  apodo + "\n";
    }

    mensaje += "PRODUCTOS\n";

    productosElegidos.forEach(function(producto) {

        const importe = producto.precio * producto.cantidad;
        subtotal += importe;

        mensaje += producto.cantidad + " x " + producto.nombre;
        mensaje += " — " + formatoPrecio(importe) + "\n";

    });

    const envio = esDomicilio ? costoEnvio : 0;
    const total = subtotal + envio;

    mensaje += "\nMODALIDAD\n";

    if (esDomicilio) {
        mensaje += "Servicio a domicilio\n";
        mensaje += "Dirección: " + direccion + "\n";

        if (referencia) {
            mensaje += "Referencias: " + referencia + "\n";
        }
    } else {
        mensaje += "Comer en el local\n";
    }

    mensaje += "\nSubtotal: " + formatoPrecio(subtotal) + "\n";
    mensaje += "Envío: " + formatoPrecio(envio) + "\n";
    mensaje += "TOTAL: " + formatoPrecio(total) + "\n";

    if (notas) {
        mensaje += "\nNotas: " + notas + "\n";
    }

    mensaje += "\nQuedo pendiente de la confirmación del pedido.";

    const enlaceWhatsApp =
        "https://wa.me/" + telefonoNegocio +
        "?text=" + encodeURIComponent(mensaje);

    window.open(enlaceWhatsApp, "_blank");

});


/* ========================================
   INICIAR TOTALES
======================================== */

actualizarPedido();
