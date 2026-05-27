// js/contactos.js

// 1. BASES DE DATOS SIMULADAS ACTUALIZADAS CON RF-01, RF-02 y RF-03
let clientesDB = [
    { nombreId: 'CLI-Juan Pérez', telefono: '987654321', tipo: 'Minorista', fecha: '2023-10-15' },
    { nombreId: 'CLI-Distribuidora Norte', telefono: '912345678', tipo: 'Mayorista', fecha: '2023-11-02' }
];

let proveedoresDB = [
    { nombreId: 'Tech Supplies SAC', ruc: '20123456789', telefono: '999111222', estado: 'Activo', fecha: '2023-01-10' },
    { nombreId: 'Logística Global', ruc: '20987654321', telefono: '999333444', estado: 'Inactivo', fecha: '2023-05-20' }
];

let modalClienteInstance;
let modalProveedorInstance;

document.addEventListener('DOMContentLoaded', () => {
    modalClienteInstance = new bootstrap.Modal(document.getElementById('modalCliente'));
    modalProveedorInstance = new bootstrap.Modal(document.getElementById('modalProveedor'));

    renderizarClientes();
    renderizarProveedores();
});

/* ==========================================
   SECCIÓN: CLIENTES (RF-03: Mayorista/Minorista)
   ========================================== */

function renderizarClientes() {
    const tbody = document.getElementById('tabla-clientes');
    tbody.innerHTML = '';

    if (clientesDB.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay clientes registrados.</td></tr>`;
        return;
    }

    clientesDB.forEach(cli => {
        // Estilos visuales para diferenciar el tipo de cliente
        const badgeColor = cli.tipo === 'Mayorista' ? 'bg-primary' : 'bg-info text-dark';
        
        tbody.innerHTML += `
            <tr>
                <td class="fw-medium ps-4"><i class="bi bi-person-circle text-primary me-2"></i> ${cli.nombreId}</td>
                <td>${cli.telefono}</td>
                <td><span class="badge ${badgeColor}">${cli.tipo}</span></td>
                <td>${cli.fecha}</td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalCliente('${cli.nombreId}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarCliente('${cli.nombreId}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function abrirModalCliente(nombreIdViejo = '') {
    document.getElementById('form-cliente').reset();
    document.getElementById('cli-idViejo').value = nombreIdViejo;

    if (nombreIdViejo) {
        const cliente = clientesDB.find(c => c.nombreId === nombreIdViejo);
        if (cliente) {
            document.getElementById('tituloModalCliente').innerText = 'Editar Cliente';
            document.getElementById('cli-nombre').value = cliente.nombreId;
            document.getElementById('cli-telefono').value = cliente.telefono;
            document.getElementById('cli-tipo').value = cliente.tipo;
        }
    } else {
        document.getElementById('tituloModalCliente').innerText = 'Registrar Nuevo Cliente';
    }

    modalClienteInstance.show();
}

function guardarCliente() {
    const idViejo = document.getElementById('cli-idViejo').value;
    const nombreId = document.getElementById('cli-nombre').value.trim();
    const telefono = document.getElementById('cli-telefono').value.trim();
    const tipo = document.getElementById('cli-tipo').value;

    if (!nombreId || !telefono || !tipo) {
        showAlert('Completa todos los campos obligatorios.', 'warning');
        return;
    }

    if (idViejo) {
        const index = clientesDB.findIndex(c => c.nombreId === idViejo);
        if (index !== -1) {
            if (idViejo !== nombreId && clientesDB.some(c => c.nombreId === nombreId)) {
                showAlert('Ya existe un cliente con ese nombre/ID.', 'danger');
                return;
            }
            clientesDB[index].nombreId = nombreId;
            clientesDB[index].telefono = telefono;
            clientesDB[index].tipo = tipo;
            showAlert('Cliente actualizado correctamente.', 'info');
        }
    } else {
        if (clientesDB.some(c => c.nombreId === nombreId)) {
            showAlert('Ya existe un cliente con ese nombre/ID.', 'danger');
            return;
        }
        
        const fechaActual = new Date().toISOString().split('T')[0];
        clientesDB.push({ nombreId, telefono, tipo, fecha: fechaActual });
        showAlert('Cliente registrado con éxito.', 'success');
    }

    renderizarClientes();
    modalClienteInstance.hide();
}

function eliminarCliente(nombreId) {
    if (confirm(`¿Estás seguro de eliminar al cliente "${nombreId}"?`)) {
        clientesDB = clientesDB.filter(c => c.nombreId !== nombreId);
        renderizarClientes();
        showAlert('Cliente eliminado.', 'success');
    }
}

/* ==========================================
   SECCIÓN: PROVEEDORES (RF-01 y RF-02: Estado Activo/Inactivo)
   ========================================== */

function renderizarProveedores() {
    const tbody = document.getElementById('tabla-proveedores');
    tbody.innerHTML = '';

    if (proveedoresDB.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No hay proveedores registrados.</td></tr>`;
        return;
    }

    proveedoresDB.forEach(prov => {
        // Estilos para el estado del proveedor
        const badgeColor = prov.estado === 'Activo' ? 'bg-success' : 'bg-secondary';
        const opacityClass = prov.estado === 'Inactivo' ? 'opacity-50' : '';

        tbody.innerHTML += `
            <tr class="${opacityClass}">
                <td class="fw-medium ps-4"><i class="bi bi-building text-info me-2"></i> ${prov.nombreId}</td>
                <td><span class="badge bg-secondary bg-opacity-10 text-dark border">${prov.ruc}</span></td>
                <td>${prov.telefono}</td>
                <td><span class="badge ${badgeColor}">${prov.estado}</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirModalProveedor('${prov.nombreId}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarProveedor('${prov.nombreId}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function abrirModalProveedor(nombreIdViejo = '') {
    document.getElementById('form-proveedor').reset();
    document.getElementById('prov-idViejo').value = nombreIdViejo;

    if (nombreIdViejo) {
        const prov = proveedoresDB.find(p => p.nombreId === nombreIdViejo);
        if (prov) {
            document.getElementById('tituloModalProveedor').innerText = 'Editar Proveedor';
            document.getElementById('prov-nombre').value = prov.nombreId;
            document.getElementById('prov-ruc').value = prov.ruc;
            document.getElementById('prov-telefono').value = prov.telefono;
            document.getElementById('prov-estado').value = prov.estado;
        }
    } else {
        document.getElementById('tituloModalProveedor').innerText = 'Registrar Nuevo Proveedor';
        document.getElementById('prov-estado').value = 'Activo'; // Por defecto activo al crear
    }

    modalProveedorInstance.show();
}

function guardarProveedor() {
    const idViejo = document.getElementById('prov-idViejo').value;
    const nombreId = document.getElementById('prov-nombre').value.trim();
    const ruc = document.getElementById('prov-ruc').value.trim();
    const telefono = document.getElementById('prov-telefono').value.trim();
    const estado = document.getElementById('prov-estado').value;

    if (!nombreId || !ruc || !telefono || !estado) {
        showAlert('Completa todos los campos obligatorios.', 'warning');
        return;
    }

    if (idViejo) {
        const index = proveedoresDB.findIndex(p => p.nombreId === idViejo);
        if (index !== -1) {
            if (idViejo !== nombreId && proveedoresDB.some(p => p.nombreId === nombreId)) {
                showAlert('Ya existe un proveedor con esa Razón Social.', 'danger');
                return;
            }
            proveedoresDB[index].nombreId = nombreId;
            proveedoresDB[index].ruc = ruc;
            proveedoresDB[index].telefono = telefono;
            proveedoresDB[index].estado = estado;
            showAlert('Proveedor actualizado correctamente.', 'info');
        }
    } else {
        if (proveedoresDB.some(p => p.nombreId === nombreId)) {
            showAlert('Ya existe un proveedor con esa Razón Social.', 'danger');
            return;
        }
        
        const fechaActual = new Date().toISOString().split('T')[0];
        proveedoresDB.push({ nombreId, ruc, telefono, estado, fecha: fechaActual });
        showAlert('Proveedor registrado con éxito.', 'success');
    }

    renderizarProveedores();
    modalProveedorInstance.hide();
}

function eliminarProveedor(nombreId) {
    if (confirm(`¿Estás seguro de eliminar al proveedor "${nombreId}"?`)) {
        proveedoresDB = proveedoresDB.filter(p => p.nombreId !== nombreId);
        renderizarProveedores();
        showAlert('Proveedor eliminado.', 'success');
    }
}