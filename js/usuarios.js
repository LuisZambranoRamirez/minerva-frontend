// js/usuarios.js

// Base de datos simulada en memoria adaptada al diagrama (tabla: user)
let usuariosDB = [
    { id: 1, firstName: 'Administrador', lastName: 'Sistema', email: 'admin@minerva.com', username: 'admin', password: '123', role: 'ADMIN', status: 'Activo' },
    { id: 2, firstName: 'Juan', lastName: 'Pérez', email: 'juan.perez@minerva.com', username: 'operador', password: '123', role: 'OPERADOR', status: 'Activo' },
    { id: 3, firstName: 'Carlos', lastName: 'Cajero', email: 'carlos.c@minerva.com', username: 'cajero_bloqueado', password: '123', role: 'OPERADOR', status: 'Bloqueado' }
];

let modalUsuario; 

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('minerva_rol') !== 'ADMIN') {
        window.location.replace('index.html');
        return;
    }
    
    const modalElement = document.getElementById('modalUsuario');
    if (modalElement) {
        modalUsuario = new bootstrap.Modal(modalElement);
    }
    
    renderizarTablaUsuarios();
});

// 1. LEER (Mostrar en tabla con las nuevas columnas del diagrama)
function renderizarTablaUsuarios() {
    const tbody = document.getElementById('tabla-usuarios');
    if (!tbody) return;
    tbody.innerHTML = '';

    usuariosDB.forEach(user => {
        const badgeRole = user.role === 'ADMIN' ? 'bg-danger' : 'bg-secondary';
        const badgeStatus = user.status === 'Activo' ? 'bg-success' : 'bg-dark';
        
        const btnBlockIcon = user.status === 'Activo' ? 'bi-ban' : 'bi-check-circle';
        const btnBlockClass = user.status === 'Activo' ? 'btn-outline-warning' : 'btn-outline-success';
        const btnBlockTitle = user.status === 'Activo' ? 'Bloquear Acceso' : 'Desbloquear Acceso';

        tbody.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td><p class="mb-0 fw-semibold">${user.firstName} ${user.lastName}</p></td>
                <td class="text-muted">@${user.username}</td>
                <td><small>${user.email}</small></td>
                <td><span class="badge ${badgeRole}">${user.role}</span></td>
                <td><span class="badge ${badgeStatus}">${user.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" title="Editar" onclick="abrirModalEditar(${user.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm ${btnBlockClass} me-1" title="${btnBlockTitle}" onclick="cambiarEstadoUsuario(${user.id})">
                        <i class="bi ${btnBlockIcon}"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Eliminar" onclick="eliminarUsuario(${user.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// 2. PREPARAR CREACIÓN
function abrirModalCrear() {
    document.getElementById('form-usuario').reset();
    document.getElementById('user-id').value = ''; 
    document.getElementById('modalUsuarioTitle').innerText = 'Crear Nuevo Usuario';
    document.getElementById('password-help').innerText = 'La contraseña es obligatoria para usuarios nuevos.';
    modalUsuario.show();
}

// 3. PREPARAR EDICIÓN (Asignación de nuevos campos al formulario)
function abrirModalEditar(id) {
    const user = usuariosDB.find(u => u.id === id);
    if (!user) return;

    document.getElementById('user-id').value = user.id;
    document.getElementById('user-firstname').value = user.firstName;
    document.getElementById('user-lastname').value = user.lastName;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-password').value = ''; 
    document.getElementById('user-rol').value = user.role;
    document.getElementById('user-estado').value = user.status;
    
    document.getElementById('modalUsuarioTitle').innerText = 'Editar Usuario';
    document.getElementById('password-help').innerText = 'Déjalo en blanco si no deseas cambiar la contraseña.';
    
    modalUsuario.show();
}

// 4. GUARDAR (Crear o Actualizar procesando los nuevos campos)
function guardarUsuario() {
    const id = document.getElementById('user-id').value;
    const firstName = document.getElementById('user-firstname').value.trim();
    const lastName = document.getElementById('user-lastname').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const username = document.getElementById('user-username').value.trim();
    const password = document.getElementById('user-password').value.trim();
    const role = document.getElementById('user-rol').value;
    const status = document.getElementById('user-estado').value;

    // Validación extendida de campos obligatorios
    if (!firstName || !lastName || !email || !username) {
        if (typeof showAlert === "function") showAlert('Todos los campos personales y de usuario son obligatorios.', 'warning');
        else alert('Todos los campos personales y de usuario son obligatorios.');
        return;
    }

    const payload = { firstName, lastName, email, username, role, status };

    if (id === '') {
        // MODO CREAR
        if (!password) {
            if (typeof showAlert === "function") showAlert('Debes asignar una contraseña al nuevo usuario.', 'warning');
            else alert('Debes asignar una contraseña al nuevo usuario.');
            return;
        }
        
        if(usuariosDB.some(u => u.username === username)) {
            if (typeof showAlert === "function") showAlert('Ese nombre de usuario ya está en uso.', 'danger');
            else alert('Ese nombre de usuario ya está en uso.');
            return;
        }

        const nuevoId = usuariosDB.length > 0 ? Math.max(...usuariosDB.map(u => u.id)) + 1 : 1;
        usuariosDB.push({ id: nuevoId, password, ...payload });
        if (typeof showAlert === "function") showAlert('Usuario creado exitosamente.', 'success');

    } else {
        // MODO EDITAR
        const index = usuariosDB.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            const usernameExiste = usuariosDB.some(u => u.username === username && u.id !== parseInt(id));
            if(usernameExiste) {
                if (typeof showAlert === "function") showAlert('Ese nombre de usuario ya está en uso.', 'danger');
                else alert('Ese nombre de usuario ya está en uso.');
                return;
            }

            // Actualizamos conservando la contraseña si no se digita una nueva
            const viejaPassword = usuariosDB[index].password;
            usuariosDB[index] = { id: parseInt(id), password: password !== '' ? password : viejaPassword, ...payload };
            
            if (typeof showAlert === "function") showAlert('Usuario actualizado correctamente.', 'info');
        }
    }

    renderizarTablaUsuarios();
    modalUsuario.hide();
}

// 5. BORRAR
function eliminarUsuario(id) {
    const usuarioLogueado = localStorage.getItem('minerva_usuario');
    const userToDel = usuariosDB.find(u => u.id === id);
    if (!userToDel) return;
    
    if (userToDel.username === usuarioLogueado) {
        if (typeof showAlert === "function") showAlert('No puedes eliminar tu propia cuenta mientras estás en sesión.', 'danger');
        else alert('No puedes eliminar tu propia cuenta mientras estás en sesión.');
        return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario "${userToDel.username}"?`)) {
        usuariosDB = usuariosDB.filter(u => u.id !== id);
        renderizarTablaUsuarios();
        if (typeof showAlert === "function") showAlert('Usuario eliminado del sistema.', 'success');
    }
}

// 6. BLOQUEAR/DESBLOQUEAR ESTADO RAPIDO
function cambiarEstadoUsuario(id) {
    const usuarioLogueado = localStorage.getItem('minerva_usuario');
    const index = usuariosDB.findIndex(u => u.id === id);
    
    if (index !== -1) {
        if (usuariosDB[index].username === usuarioLogueado) {
            if (typeof showAlert === "function") showAlert('No puedes bloquear tu propia cuenta.', 'danger');
            else alert('No puedes bloquear tu propia cuenta.');
            return;
        }

        const estadoActual = usuariosDB[index].status;
        usuariosDB[index].status = estadoActual === 'Activo' ? 'Bloqueado' : 'Activo';
        
        renderizarTablaUsuarios();
        
        const msj = usuariosDB[index].status === 'Bloqueado' 
            ? `El acceso para ${usuariosDB[index].username} ha sido bloqueado.` 
            : `El usuario ${usuariosDB[index].username} ahora está Activo.`;
            
        if (typeof showAlert === "function") showAlert(msj, usuariosDB[index].status === 'Bloqueado' ? 'warning' : 'success');
    }
}