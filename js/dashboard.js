// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Establecer fecha
    const fechaElement = document.getElementById('fecha-actual');
    if (fechaElement) {
        fechaElement.innerText = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // 2. Ejecutar renderizados
    renderizarGraficoPrincipal();
    renderizarTopProductos();
    renderizarAlertasInventario();
    renderizarAuditoria();
});

// Botón de exportación (RF-08)
function exportarReporte(formato) {
    showAlert(`Generando reporte de inventario en formato ${formato}... La descarga comenzará en breve.`, 'success');
}

function renderizarGraficoPrincipal() {
    const ctx = document.getElementById('mainChart');
    if (!ctx) return;

    const textColor = document.body.classList.contains('dark-mode') ? '#94a3b8' : '#64748b';
    const gridColor = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
            datasets: [
                {
                    label: 'Ventas ($)',
                    data: [15000, 22000, 18000, 29000, 25000, 32000, 35210],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3, tension: 0.4, fill: true
                },
                {
                    label: 'Compras ($)',
                    data: [8000, 9500, 8200, 12000, 10000, 11500, 10390],
                    borderColor: '#0dcaf0',
                    backgroundColor: 'rgba(13, 202, 240, 0.05)',
                    borderWidth: 2, tension: 0.4, fill: true
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor } } },
            scales: {
                x: { grid: { color: gridColor }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => '$' + v } }
            }
        }
    });
}

// RF-06 y RF-07: Alertas de Vencimiento y Reposición
function renderizarAlertasInventario() {
    const contenedor = document.getElementById('panel-alertas');
    if (!contenedor) return;

    const alertas = [
        { tipo: 'VENCIMIENTO', msj: 'Lote de Leche entera vence en 7 días.', fecha: '28 May 2026', color: 'danger', icon: 'bi-calendar-x' },
        { tipo: 'STOCK BAJO', msj: 'Cable HDMI alcanzó nivel crítico (Quedan 2).', fecha: 'Sugerido reponer', color: 'warning', icon: 'bi-box-arrow-down' },
        { tipo: 'VENCIMIENTO', msj: 'Yogurt natural vence en 15 días.', fecha: '05 Jun 2026', color: 'danger', icon: 'bi-calendar-x' },
        { tipo: 'STOCK BAJO', msj: 'Teclado Mecánico sin stock (Quedan 0).', fecha: 'Sugerido reponer', color: 'warning', icon: 'bi-exclamation-triangle' }
    ];

    alertas.forEach(alerta => {
        contenedor.innerHTML += `
            <div class="list-group-item list-group-item-action d-flex gap-3 py-3 bg-transparent">
                <i class="bi ${alerta.icon} text-${alerta.color} fs-4"></i>
                <div class="d-flex gap-2 w-100 justify-content-between">
                    <div>
                        <h6 class="mb-0 text-${alerta.color} fw-bold">${alerta.tipo}</h6>
                        <p class="mb-0 opacity-75 small">${alerta.msj}</p>
                    </div>
                    <small class="opacity-50 text-nowrap">${alerta.fecha}</small>
                </div>
            </div>
        `;
    });
}

// RF-09: Historial de Auditoría
function renderizarAuditoria() {
    const contenedor = document.getElementById('timeline-auditoria');
    if (!contenedor) return;

    const auditorias = [
        { accion: 'Venta Minorista registrada', user: 'admin', hora: 'Hace 10 min', color: 'success' },
        { accion: 'Entrada de Mercadería (Lote 500)', user: 'operador', hora: 'Hace 1 hora', color: 'info' },
        { accion: 'Producto "Mouse" editado', user: 'admin', hora: 'Hace 2 horas', color: 'primary' },
        { accion: 'Venta Mayorista anulada', user: 'admin', hora: 'Ayer', color: 'danger' }
    ];

    // CSS integrado para la línea de tiempo (puedes moverlo a styles.css luego)
    let html = `<style>
        .timeline-item { position: relative; padding-left: 30px; margin-bottom: 1.5rem; }
        .timeline-item::before { content: ''; position: absolute; left: 6px; top: 0; bottom: -1.5rem; width: 2px; background: var(--border-color); }
        .timeline-item:last-child::before { display: none; }
        .timeline-indicator { position: absolute; left: 0; top: 2px; width: 14px; height: 14px; border-radius: 50%; }
    </style>`;

    auditorias.forEach(aud => {
        html += `
            <div class="timeline-item">
                <div class="timeline-indicator bg-${aud.color}"></div>
                <div class="d-flex justify-content-between">
                    <strong class="mb-1">${aud.accion}</strong>
                    <small class="text-muted">${aud.hora}</small>
                </div>
                <small class="text-muted d-block"><i class="bi bi-person"></i> Por: ${aud.user}</small>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

function renderizarTopProductos() {
    const tbody = document.getElementById('top-productos');
    if (!tbody) return;

    const topProductos = [
        { nombre: 'Laptop Dell Inspiron', ventas: 1200, tendencia: 'up', color: 'success' },
        { nombre: 'Monitor Samsung 24"', ventas: 840, tendencia: 'up', color: 'success' },
        { nombre: 'Teclado Mecánico RGB', ventas: 320, tendencia: 'down', color: 'danger' },
        { nombre: 'Mouse Inalámbrico Logitech', ventas: 150, tendencia: 'up', color: 'success' }
    ];

    topProductos.forEach(prod => {
        const icono = prod.tendencia === 'up' ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow';
        tbody.innerHTML += `
            <tr>
                <td class="ps-4 fw-medium"><i class="bi bi-box-seam text-primary me-2"></i> ${prod.nombre}</td>
                <td><span class="badge bg-secondary bg-opacity-10 text-dark border">${prod.ventas} Und</span></td>
                <td class="text-end pe-4"><i class="bi ${icono} text-${prod.color} fs-5"></i></td>
            </tr>
        `;
    });
}