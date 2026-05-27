// js/login.js

document.addEventListener('DOMContentLoaded', () => {

    if (localStorage.getItem('minerva_token')) {
        window.location.replace('index.html');
    }

    iniciarLogin();

});

function iniciarLogin() {

    const form =
        document.getElementById('form-login');

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const usuario =
            document.getElementById('username').value;

        const password =
            document.getElementById('password').value;

        const error =
            document.getElementById('login-error');

        error.classList.add('d-none');

        try {

            /*
            BACKEND:
            Cambiar endpoint aquí
            */

            /*
            const response =
                await api.post('/auth/login',{
                    username:usuario,
                    password
                });
            */

            // simulación temporal

            if (
                usuario === 'admin'
                &&
                password === '1234'
            ) {

                localStorage.setItem(
                    'minerva_token',
                    'token-demo'
                );

                localStorage.setItem(
                    'minerva_usuario',
                    usuario
                );

                localStorage.setItem(
                    'minerva_rol',
                    'ADMIN'
                );

            }

            else {

                localStorage.setItem(
                    'minerva_token',
                    'token-demo'
                );

                localStorage.setItem(
                    'minerva_usuario',
                    usuario
                );

                localStorage.setItem(
                    'minerva_rol',
                    'OPERADOR'
                );

            }

            window.location.replace(
                'index.html'
            );

        }

        catch {

            error.textContent =
                'Credenciales inválidas';

            error.classList.remove(
                'd-none'
            );

        }

    });

}