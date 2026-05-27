// js/ventas.js

// Inventario simulado con la propiedad 'barcode' alineada al esquema relacional de productos
const inventarioPOS = [
    { id: 1, nombre: 'Laptop Dell Inspiron', barcode: '7501234567890', precio: 850.00, stock: 15 },
    { id: 2, nombre: 'Mouse Inalámbrico Logitech', barcode: '7501234567891', precio: 25.50, stock: 50 },
    { id: 3, nombre: 'Monitor Samsung 24"', barcode: '7501234567892', precio: 180.00, stock: 8 },
    { id: 4, nombre: 'Teclado Mecánico RGB', barcode: '7501234567893', precio: 65.00, stock: 12 },
    { id: 5, nombre: 'Cable HDMI 2m', barcode: '7501234567894', precio: 8.00, stock: 30 },
    { id: 6, Hub: 'Hub USB-C Multipuerto', barcode: '7501234567895', precio: 35.00, stock: 0 }
];

let carrito = [];
let totales = { subtotal: 0, igv: 0, total: 0 };
let modalBoleta;

document.addEventListener('DOMContentLoaded', () => {
    const modalElement = document.getElementById('modalBoleta');
    if (modalElement) {
        modalBoleta = new bootstrap.Modal(modalElement);
    }
    
    renderizarCatálogoPOS('');

    const inputBusqueda = document.getElementById('buscar-prod');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', (e) => {
            renderizarCatálogoPOS(e.target.value);
        });
    }

    // Cambiar texto dinámico del botón según el tipo de comprobante seleccionado
    const selectComprobante = document.getElementById('tipo-comprobante');
    if (selectComprobante) {
        selectComprobante.addEventListener('change', (e) => {
            const btnPago = document.getElementById('btn-procesar');
            if (btnPago) {
                btnPago.innerHTML = e.target.value === 'BOLETA' 
                    ? '<i class="bi bi-check-circle"></i> Emitir Boleta y Cobrar' 
                    : '<i class="bi bi-check-circle"></i> Emitir Factura y Cobrar';
            }
        });
    }
});

// 1. RENDERIZAR Y FILTRAR CATÁLOGO (Busca por Nombre y por Código de Barras)
function renderizarCatálogoPOS(filtro) {
    const contenedor = document.getElementById('lista-busqueda');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    const termino = filtro.trim().toLowerCase();
    
    // Filtrado por coincidencia en nombre o en el string del código de barras
    const resultados = inventarioPOS.filter(prod => 
        prod.nombre.toLowerCase().includes(termino) || 
        (prod.barcode && prod.barcode.includes(termino))
    );

    if (resultados.length === 0) {
        contenedor.innerHTML = `<div class="p-4 text-center text-muted">No se encontraron productos coincidentes.</div>`;
        return;
    }

    resultados.forEach(prod => {
        const sinStock = prod.stock <= 0;
        const opacidad = sinStock ? 'opacity-50' : '';
        const badgeColor = sinStock ? 'bg-danger' : 'bg-primary';

        contenedor.innerHTML += `
            <div class="list-group-item d-flex justify-content-between align-items-center py-3 ${opacidad}">
                <div>
                    <h6 class="mb-1 fw-bold">${prod.nombre}</h6>
                    <div class="text-muted small mb-1"><i class="bi bi-barcode"></i> ${prod.barcode || 'S/C'}</div>
                    <div class="text-success fw-medium">$${prod.precio.toFixed(2)} <span class="badge ${badgeColor} ms-2">Stock: ${prod.stock}</span></div>
                </div>
                
                <div class="d-flex align-items-center gap-2">
                    <input type="number" id="qty-prod-${prod.id}" class="form-control text-center" 
                           value="1" min="1" max="${prod.stock}" style="width: 70px;" ${sinStock ? 'disabled' : ''}>
                    
                    <button class="btn btn-primary" onclick="agregarAlCarritoDesdeCatalogo(${prod.id})" 
                            ${sinStock ? 'disabled' : ''} title="Agregar al carrito">
                        <i class="bi bi-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

// 2. AGREGAR AL CARRITO
function agregarAlCarritoDesdeCatalogo(idProducto) {
    const producto = inventarioPOS.find(p => p.id === idProducto);
    if (!producto) return;

    const inputQty = document.getElementById(`qty-prod-${idProducto}`);
    const cantidadA_Agregar = parseInt(inputQty.value);

    if (isNaN(cantidadA_Agregar) || cantidadA_Agregar <= 0) {
        if (typeof showAlert === "function") showAlert('Ingresa una cantidad válida.', 'warning');
        return;
    }

    const itemEnCarrito = carrito.find(item => item.id === idProducto);
    const cantidadActualEnCarrito = itemEnCarrito ? itemEnCarrito.cantidad : 0;
    const nuevaCantidadTotal = cantidadActualEnCarrito + cantidadA_Agregar;

    if (nuevaCantidadTotal > producto.stock) {
        if (typeof showAlert === "function") showAlert(`Stock insuficiente. Solo quedan ${producto.stock - cantidadActualEnCarrito} unidades.`, 'danger');
        return;
    }

    if (itemEnCarrito) {
        itemEnCarrito.cantidad = nuevaCantidadTotal;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidadA_Agregar,
            stockMaximo: producto.stock
        });
    }

    inputQty.value = 1;
    actualizarTicketUI();
}

// 3. ACTUALIZAR INTERFAZ Y CÁLCULOS (Desglose de Impuestos Oficiales)
function actualizarTicketUI() {
    const tbody = document.getElementById('carrito-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let totalVentaBruto = 0;

    if (carrito.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-5"><i class="bi bi-cart-x fs-2 d-block mb-2"></i>El carrito está vacío</td></tr>`;
        document.getElementById('subtotal-venta').innerText = `$0.00`;
        document.getElementById('igv-venta').innerText = `$0.00`;
        document.getElementById('total-venta').innerText = `$0.00`;
        return;
    }

    carrito.forEach((item, index) => {
        const subtotalItem = item.precio * item.cantidad;
        totalVentaBruto += subtotalItem;

        tbody.innerHTML += `
            <tr>
                <td class="fw-medium" style="width: 50%; font-size: 0.9rem;">${item.nombre}</td>
                <td style="width: 25%;">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary px-2" type="button" onclick="cambiarCantidadCarrito(${index}, -1)">-</button>
                        <input type="text" class="form-control text-center px-0 bg-transparent" value="${item.cantidad}" readonly>
                        <button class="btn btn-outline-secondary px-2" type="button" onclick="cambiarCantidadCarrito(${index}, 1)">+</button>
                    </div>
                </div>
                <td class="text-end fw-medium" style="width: 20%; font-size: 0.9rem;">$${subtotalItem.toFixed(2)}</td>
                <td class="text-end" style="width: 5%;">
                    <button class="btn btn-sm text-danger px-1" onclick="quitarDelCarrito(${index})"><i class="bi bi-x-lg"></i></button>
                </td>
            </tr>
        `;
    });

    // Operación matemática inversa para extraer la base imponible y el impuesto (18% IGV Peruano)
    totales.total = totalVentaBruto;
    totales.subtotal = totalVentaBruto / 1.18;
    totales.igv = totalVentaBruto - totales.subtotal;

    document.getElementById('subtotal-venta').innerText = `$${totales.subtotal.toFixed(2)}`;
    document.getElementById('igv-venta').innerText = `$${totales.igv.toFixed(2)}`;
    document.getElementById('total-venta').innerText = `$${totales.total.toFixed(2)}`;
}

// 4. MODIFICAR CANTIDADES EN CARRITO
function cambiarCantidadCarrito(index, cambio) {
    const item = carrito[index];
    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad <= 0) {
        quitarDelCarrito(index);
    } else if (nuevaCantidad > item.stockMaximo) {
        if (typeof showAlert === "function") showAlert(`Stock máximo alcanzado (${item.stockMaximo} unid.)`, 'warning');
    } else {
        item.cantidad = nuevaCantidad;
        actualizarTicketUI();
    }
}

function quitarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarTicketUI();
}

function vaciarCarrito() {
    if (carrito.length > 0 && confirm('¿Estás seguro de vaciar todo el carrito?')) {
        carrito = [];
        actualizarTicketUI();
    }
}

// 5. PROCESAR VENTA (Simulando persistencia en tablas sale y sale_detail)
function procesarVenta() {
    if (carrito.length === 0) {
        if (typeof showAlert === "function") showAlert('No hay productos en el carrito.', 'danger');
        return;
    }

    const btnPago = document.getElementById('btn-procesar');
    const textoOriginal = btnPago.innerHTML;
    btnPago.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Registrando venta...';
    btnPago.disabled = true;

    setTimeout(() => {
        // Descontar existencias lógicas de la tabla de productos
        carrito.forEach(item => {
            const prod = inventarioPOS.find(p => p.id === item.id);
            if(prod) prod.stock -= item.cantidad;
        });

        // Dibujar el comprobante según la selección de la cabecera
        generarBoletaHTML();

        if (modalBoleta) {
            modalBoleta.show();
        }

        carrito = [];
        actualizarTicketUI();
        renderizarCatálogoPOS(document.getElementById('buscar-prod').value); 
        
        btnPago.innerHTML = textoOriginal;
        btnPago.disabled = false;
        
    }, 1000);
}

// 6. GENERAR TICKET (Adaptado dinámicamente a Boleta o Factura)
function generarBoletaHTML() {
    const contenedor = document.getElementById('contenido-boleta');
    if (!contenedor) return;
    
    const fecha = new Date();
    const numeroComprobante = Math.floor(Math.random() * 900000) + 100000;
    const cajero = localStorage.getItem('minerva_usuario') || 'Cajero 1';
    
    // Obtener la selección actual del DOM
    const selectComprobante = document.getElementById('tipo-comprobante');
    const tipoDocumento = selectComprobante ? selectComprobante.value : 'BOLETA';
    const abreviatura = tipoDocumento === 'BOLETA' ? 'B001' : 'F001';

    let htmlItems = '';
    carrito.forEach(item => {
        const sub = (item.precio * item.cantidad).toFixed(2);
        htmlItems += `
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 2px;">
                <span style="text-align: left; width: 55%;">${item.cantidad}x ${item.nombre.substring(0, 14)}</span>
                <span style="width: 22%; text-align: right;">$${item.precio.toFixed(2)}</span>
                <span style="text-align: right; width: 23%;">$${sub}</span>
            </div>
        `;
    });

    contenedor.innerHTML = `
        <div style="color: black;">
            <h4 class="fw-bold mb-0">MINERVA S.A.C.</h4>
            <small>Av. Principal 123, Lima</small><br>
            <small>RUC: 20123456789</small>
            <div style="border-bottom: 1px dashed black; margin: 10px 0;"></div>
            
            <div style="text-align: left; font-size: 0.85rem;">
                <strong>${tipoDocumento} ELECTRÓNICA</strong><br>
                Nro: ${abreviatura}-${numeroComprobante}<br>
                Fecha: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}<br>
                Cajero: ${cajero.toUpperCase()}
            </div>
            
            <div style="border-bottom: 1px dashed black; margin: 10px 0;"></div>
            
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: bold; margin-bottom: 5px;">
                <span style="text-align: left; width: 55%;">CANT / DESCR.</span>
                <span style="width: 22%; text-align: right;">P.U</span>
                <span style="text-align: right; width: 23%;">TOTAL</span>
            </div>
            
            ${htmlItems}
            
            <div style="border-bottom: 1px dashed black; margin: 10px 0;"></div>
            
            <div style="text-align: right; font-size: 0.9rem;">
                Op. Gravada: $${totales.subtotal.toFixed(2)}<br>
                IGV (18%): $${totales.igv.toFixed(2)}<br>
                <strong style="font-size: 1.1rem;">TOTAL: $${totales.total.toFixed(2)}</strong>
            </div>
            
            <div style="border-bottom: 1px dashed black; margin: 10px 0;"></div>
            <small>Representación impresa de Comprobante Electrónico.</small><br>
            <small class="fw-bold">¡Gracias por su preferencia!</small>
        </div>
    `;
}