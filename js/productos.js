// js/productos.js

// Base de datos simulada adaptada al diagrama de la base de datos (tabla: product)
let productosDB = [
    { 
        id: 1, 
        nombre: 'Laptop Dell Inspiron', 
        gainStrategy: 'Porcentaje', 
        gainAmount: 20.00, 
        precio: 850.00, 
        stock: 15.000, 
        reorderLevel: 3.000, 
        barCode: '7501234567890', 
        saleType: 'Unidad', 
        categoria: 'Electrónica' 
    },
    { 
        id: 2, 
        nombre: 'Mouse Inalámbrico Logitech', 
        gainStrategy: 'Fijo', 
        gainAmount: 5.00, 
        precio: 25.50, 
        stock: 50.000, 
        reorderLevel: 10.000, 
        barCode: '7509876543210', 
        saleType: 'Unidad', 
        categoria: 'Accesorios' 
    }
];

let modalProducto; 

// Función auxiliar en caso de que falte showAlert en app.js o api.js
function triggerAlert(msg, type) {
    if (typeof showAlert === "function") {
        showAlert(msg, type);
    } else {
        alert(`${type.toUpperCase()}: ${msg}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const modalElement = document.getElementById('modalProducto');
    if (modalElement) {
        modalProducto = new bootstrap.Modal(modalElement);
    }
    renderizarTablaProductos();
});

// 1. LEER: Mostrar productos en la tabla
function renderizarTablaProductos() {
    const tbody = document.getElementById('tabla-productos');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    if (productosDB.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No hay productos registrados.</td></tr>`;
        return;
    }

    productosDB.forEach(prod => {
        // Lógica visual basada en el Stock y el ReorderLevel del diagrama
        let badgeStockClass = 'bg-success';
        if (prod.stock === 0) {
            badgeStockClass = 'bg-danger';
        } else if (prod.stock <= prod.reorderLevel) {
            badgeStockClass = 'bg-warning text-dark';
        }

        tbody.innerHTML += `
            <tr>
                <td><strong>PROD-${prod.id.toString().padStart(4, '0')}</strong></td>
                <td>${prod.nombre}</td>
                <td class="text-muted"><small>${prod.barCode}</small></td>
                <td>$${prod.precio.toFixed(2)}</td>
                <td><span class="badge ${badgeStockClass}">${prod.stock}</span></td>
                <td><span class="badge bg-secondary">${prod.categoria || 'Otros'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" title="Editar" onclick="abrirModalEditarProducto(${prod.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Eliminar" onclick="eliminarProducto(${prod.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// 2. PREPARAR CREACIÓN
function abrirModalCrearProducto() {
    document.getElementById('form-producto').reset();
    document.getElementById('prod-id').value = ''; 
    
    document.querySelector('#modalProducto .modal-title').innerText = 'Registrar Nuevo Producto';
    modalProducto.show();
}

// 3. PREPARAR EDICIÓN
function abrirModalEditarProducto(id) {
    const producto = productosDB.find(p => p.id === id);
    if (!producto) return;

    // Cargar todos los campos correspondientes a la tabla product
    document.getElementById('prod-id').value = producto.id;
    document.getElementById('prod-nombre').value = producto.nombre;
    document.getElementById('prod-barcode').value = producto.barCode;
    document.getElementById('prod-gainStrategy').value = producto.gainStrategy;
    document.getElementById('prod-gainAmount').value = producto.gainAmount;
    document.getElementById('prod-precio').value = producto.precio;
    document.getElementById('prod-stock').value = producto.stock;
    document.getElementById('prod-reorderLevel').value = producto.reorderLevel;
    document.getElementById('prod-saleType').value = producto.saleType;
    document.getElementById('prod-category').value = producto.categoria;
    
    document.querySelector('#modalProducto .modal-title').innerText = 'Editar Producto';
    modalProducto.show();
}

// 4. GUARDAR (Crear o Editar)
function guardarProducto() {
    const id = document.getElementById('prod-id').value;
    const nombre = document.getElementById('prod-nombre').value.trim();
    const barCode = document.getElementById('prod-barcode').value.trim();
    const gainStrategy = document.getElementById('prod-gainStrategy').value;
    const gainAmount = parseFloat(document.getElementById('prod-gainAmount').value);
    const precio = parseFloat(document.getElementById('prod-precio').value);
    const stock = parseFloat(document.getElementById('prod-stock').value);
    const reorderLevel = parseFloat(document.getElementById('prod-reorderLevel').value);
    const saleType = document.getElementById('prod-saleType').value;
    const categoria = document.getElementById('prod-category').value;

    // Validar que los campos obligatorios del diagrama existan
    if (!nombre || !barCode || !gainStrategy || isNaN(gainAmount) || isNaN(precio) || isNaN(stock) || isNaN(reorderLevel) || !saleType || !categoria) {
        triggerAlert('Por favor, completa todos los campos de forma correcta.', 'warning');
        return;
    }

    if (barCode.length > 13) {
        triggerAlert('El código de barras no puede superar los 13 caracteres.', 'warning');
        return;
    }

    const payload = {
        nombre,
        barCode,
        gainStrategy,
        gainAmount,
        precio,
        stock,
        reorderLevel,
        saleType,
        categoria
    };

    if (id === '') {
        // CREAR NUEVO PRODUCTO
        const nuevoId = productosDB.length > 0 ? Math.max(...productosDB.map(p => p.id)) + 1 : 1;
        productosDB.push({ id: nuevoId, ...payload });
        triggerAlert('Producto registrado exitosamente.', 'success');
    } else {
        // EDITAR EXISTENTE
        const index = productosDB.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            productosDB[index] = { id: parseInt(id), ...payload };
            triggerAlert('Producto actualizado correctamente.', 'info');
        }
    }

    renderizarTablaProductos();
    modalProducto.hide();
}

// 5. ELIMINAR
function eliminarProducto(id) {
    const producto = productosDB.find(p => p.id === id);
    if (!producto) return;
    
    if (confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`)) {
        productosDB = productosDB.filter(p => p.id !== id);
        renderizarTablaProductos();
        triggerAlert('Producto eliminado del inventario.', 'success');
    }
}