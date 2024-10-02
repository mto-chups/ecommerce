document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const closeBtn = document.getElementById('close-btn');
    const errorElement = document.getElementById('login-error');

    // Function to display error messages
    function displayError(message) {
        if (errorElement) {
            errorElement.textContent = message || 'Une erreur est survenue. Veuillez réessayer.';
            errorElement.style.display = 'block';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent default form submission

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            // Basic input validation
            if (!email || !password) {
                displayError('Veuillez remplir tous les champs.');
                return;
            }

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    throw new Error('Erreur HTTP: ' + response.status);
                }

                const data = await response.json();

                if (data.success) {
                    // Store logged in status and user role
                    localStorage.setItem('loggedIn', 'true');
                    localStorage.setItem('userRole', data.role); // Store the user role

                   //console.log('Utilisateur connecté en tant que :', data.role); // Log the user role
                    if (window.location.pathname === '/login') {
                        window.location.href = '/'; // Redirect to homepage
                    } else {
                        window.location.reload(); // Reload the current page
                    }
                } else {
                    displayError(data.message || 'Erreur de connexion. Veuillez vérifier vos informations.');
                }
            } catch (error) {
                console.error('Erreur lors de la connexion:', error);
                displayError('Une erreur est survenue. Veuillez réessayer.');
            }
        });
    }

    // Add event for the close button
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            window.location.href = '/'; // Redirect to homepage
        });
    }
});
