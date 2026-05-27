
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();
    inicializarFormularioPerfil();
});

function cargarDatosUsuario() {

    let usuario = {};

    try {
        usuario =
            JSON.parse(
                localStorage.getItem(
                    'minerva_usuario_data'
                )
            ) || {};
    } catch {
        usuario = {};
    }

    document.getElementById('perfil-usuario').textContent =
    usuario.nombre ||
    localStorage.getItem('minerva_usuario') ||
    'Usuario';

    document.getElementById('perfil-correo').textContent =
        usuario.email ||
        'correo@minerva.com';

    document.getElementById('perfil-rol').textContent =
        localStorage.getItem('minerva_rol') ||
        'Sin rol';

    const inputs = document.querySelectorAll(
        '#form-perfil input[disabled]'
    );

    if (inputs[0]) inputs[0].value = usuario.nombre || '';
    if (inputs[1]) inputs[1].value = usuario.apellido || '';
    if (inputs[2]) inputs[2].value = usuario.email || '';
}

function inicializarFormularioPerfil() {

    const form = document.getElementById('form-perfil');

    if (!form) return;

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const passwords = form.querySelectorAll(
            'input[type="password"]'
        );

        const actual = passwords[0].value.trim();
        const nueva = passwords[1].value.trim();
        const confirmar = passwords[2].value.trim();

        if (!actual || !nueva || !confirmar) {
            return showAlert(
                'Completa todos los campos.',
                'warning'
            );
        }

        if (nueva.length < 8) {
            return showAlert(
                'La nueva contraseña debe tener mínimo 8 caracteres.',
                'warning'
            );
        }

        if (nueva !== confirmar) {
            return showAlert(
                'Las contraseñas no coinciden.',
                'danger'
            );
        }

        try {

            /*
            ENDPOINT ESPERADO DEL BACKEND

            PATCH /users/change-password

            {
                "current_password": "...",
                "new_password": "..."
            }
            */

            await api.patch('/users/change-password', {
                current_password: actual,
                new_password: nueva
            });

            form.reset();

            showAlert(
                'Contraseña actualizada correctamente.',
                'success'
            );

        } catch (error) {

            showAlert(
                error.message ||
                'No se pudo actualizar la contraseña.',
                'danger'
            );

        }

    });

}