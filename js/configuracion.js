// js/configuracion.js

document.addEventListener('DOMContentLoaded', () => {
    // Verificación de seguridad: Solo ADMIN puede modificar configuraciones
    if (localStorage.getItem('minerva_rol') !== 'ADMIN') {
        showAlert('No tienes permisos para acceder a la configuración. Redirigiendo...', 'danger');
        setTimeout(() => window.location.replace('index.html'), 2000);
        return;
    }

    cargarConfiguracionActual();
});

// Leer datos desde localStorage (o establecer valores por defecto)
function cargarConfiguracionActual() {
    // Empresa
    document.getElementById('conf-nombre').value = localStorage.getItem('conf_nombre') || 'Minerva - Gestión Estratégica';
    document.getElementById('conf-ruc').value = localStorage.getItem('conf_ruc') || '20123456789';
    document.getElementById('conf-moneda').value = localStorage.getItem('conf_moneda') || 'PEN';

    // Automatización (RF-06 y RF-07)
    document.getElementById('conf-alerta-amarilla').value = localStorage.getItem('conf_alerta_amarilla') || '30';
    document.getElementById('conf-alerta-roja').value = localStorage.getItem('conf_alerta_roja') || '7';
    document.getElementById('conf-stock-minimo').value = localStorage.getItem('conf_stock_minimo') || '5';

    // Sistema y Auditoría (RF-08 y RF-09)
    document.getElementById('conf-exportacion').value = localStorage.getItem('conf_exportacion') || 'PDF';
    document.getElementById('conf-auditoria').value = localStorage.getItem('conf_auditoria') || '30';
}

// Guardar la configuración cuando se presiona el botón principal
function guardarConfiguracion() {
    // 1. Recolectar datos de la Empresa
    const nombre = document.getElementById('conf-nombre').value;
    const ruc = document.getElementById('conf-ruc').value;
    const moneda = document.getElementById('conf-moneda').value;

    // 2. Recolectar datos de Automatización
    const alertaAmarilla = document.getElementById('conf-alerta-amarilla').value;
    const alertaRoja = document.getElementById('conf-alerta-roja').value;
    const stockMinimo = document.getElementById('conf-stock-minimo').value;

    // 3. Recolectar datos de Sistema
    const exportacion = document.getElementById('conf-exportacion').value;
    const auditoria = document.getElementById('conf-auditoria').value;

    // Validación básica
    if(parseInt(alertaRoja) >= parseInt(alertaAmarilla)) {
        showAlert('Error: La Alerta Crítica (Roja) debe ser menor a la Alerta Preventiva (Amarilla).', 'danger');
        return;
    }

    // Guardar en la memoria del navegador (Simulación de actualización en Base de Datos)
    localStorage.setItem('conf_nombre', nombre);
    localStorage.setItem('conf_ruc', ruc);
    localStorage.setItem('conf_moneda', moneda);
    
    localStorage.setItem('conf_alerta_amarilla', alertaAmarilla);
    localStorage.setItem('conf_alerta_roja', alertaRoja);
    localStorage.setItem('conf_stock_minimo', stockMinimo);
    
    localStorage.setItem('conf_exportacion', exportacion);
    localStorage.setItem('conf_auditoria', auditoria);

    // Feedback visual
    showAlert('Ajustes guardados exitosamente. El sistema aplicará estas reglas en tiempo real.', 'success');
}