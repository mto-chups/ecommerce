document.addEventListener('DOMContentLoaded', function() {
    fetchStocks();
    fetchOrders();
    fetchOrderStats();
    fetchLastUsers();
    
    const addStockBtn = document.getElementById('add-stock-btn');
    const stockPopup = document.getElementById('stock-product-popup');
    const closePopupBtn = document.getElementById('close-popup');
    const popupOverlay = document.querySelector('.popup-overlay'); 
    const customizationForm = document.getElementById('customization-form');


    // Charger les catégories
    function loadCategories() {
        fetch('/api/products/categories')
            .then(response => response.json())
            .then(data => {
                const categorySelect = document.getElementById('category-select');

                if (!categorySelect) {
                    console.error('L\'élément category-select n\'a pas été trouvé dans le DOM.');
                    return; // Arrêter l'exécution si l'élément n'est pas trouvé
                }

                categorySelect.innerHTML = ''; // Effacer les options précédentes

                if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
                    data.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.categories_id; // Utiliser categories_id
                        option.textContent = category.categories_name; // Utiliser categories_name
                        categorySelect.appendChild(option);
                    });

                    // Sélectionnez la première option par défaut
                    categorySelect.selectedIndex = 0;
                } else {
                    console.warn('Aucune catégorie à afficher ou les données sont mal formatées.');
                }
            })
            .catch(error => console.error('Erreur lors du chargement des catégories:', error));
    }

    function loadSubcategoriesForModification() {
        fetch('/api/products/subcategories')
            .then(response => response.json())
            .then(data => {
                const subcategorySelect = document.getElementById('subcategory-select');
                subcategorySelect.innerHTML = ''; // Effacer les options précédentes
    
                // Ajouter les sous-catégories dans la liste déroulante
                data.subcategories.forEach(subcategory => {
                    const option = document.createElement('option');
                    option.value = subcategory.subcategory_id;
                    option.textContent = subcategory.subcategory_name;
                    subcategorySelect.appendChild(option);
                });
    
                // Charger le nom de la première sous-catégorie dans le champ de texte
                if (data.subcategories.length > 0) {
                    document.getElementById('new-subcategory-name-modify').value = data.subcategories[0].subcategory_name;
                }
    
                // Ajouter un gestionnaire d'événements pour la modification de la sélection
                subcategorySelect.addEventListener('change', function() {
                    const selectedOption = subcategorySelect.options[subcategorySelect.selectedIndex];
                    document.getElementById('new-subcategory-name-modify').value = selectedOption.textContent;
                });
            })
            .catch(error => console.error('Erreur lors du chargement des sous-catégories:', error));
    }

    const categorySelectElement = document.getElementById('category-select');
    if (categorySelectElement) {
        categorySelectElement.addEventListener('change', function() {
            const categoryId = this.value;
            if (categoryId) {
                loadSubcategories(categoryId); // Charger les sous-catégories basées sur la catégorie sélectionnée
            } else {
                // Effacer les sous-catégories si aucune catégorie n'est sélectionnée
                const subcategorySelect = document.getElementById('subcategory-select');
                if (subcategorySelect) {
                    subcategorySelect.innerHTML = '';
                }
            }
        });
    } else {
        console.error('L\'élément category-select n\'a pas été trouvé pour l\'ajout d\'événement.');
    }
    
    // Charger toutes les sous-catégories indépendamment
    function loadAllSubcategories() {
        fetch('/api/products/subcategories')  // Assurez-vous que cette route API est correcte
            .then(response => response.json())
            .then(data => {
                const subcategorySelect = document.getElementById('subcategory-select');
                
                if (subcategorySelect) {
                    subcategorySelect.innerHTML = ''; // Effacer les options précédentes
                    data.subcategories.forEach(subcategory => {
                        const option = document.createElement('option');
                        option.value = subcategory.subcategory_id;
                        option.textContent = subcategory.subcategory_name;
                        subcategorySelect.appendChild(option);
                    });

                    // Sélectionnez la première option par défaut
                    subcategorySelect.selectedIndex = 0;
                } else {
                    console.error('L\'élément subcategory-select n\'a pas été trouvé dans le DOM.');
                }
            })
            .catch(error => console.error('Erreur lors du chargement des sous-catégories:', error));
    }

    // Charger les catégories lors du chargement initial
    loadCategories();
    loadAllSubcategories();

    // Fonction pour charger les sous-catégories spécifiques à une catégorie
    function loadSubcategories(categoryId) {
        fetch(`/api/products/subcategories?category_id=${categoryId}`)  // Assurez-vous que cette route API est correcte et prend category_id en paramètre
            .then(response => response.json())
            .then(data => {
                const subcategorySelect = document.getElementById('subcategory-select');
                
                if (subcategorySelect) {
                    subcategorySelect.innerHTML = ''; // Effacer les options précédentes

                    if (data.subcategories && Array.isArray(data.subcategories) && data.subcategories.length > 0) {
                        data.subcategories.forEach(subcategory => {
                            const option = document.createElement('option');
                            option.value = subcategory.subcategory_id; // Utilisez l'ID correct
                            option.textContent = subcategory.subcategory_name; // Utilisez le nom correct
                            subcategorySelect.appendChild(option);
                        });
                    } else {
                        console.warn('Aucune sous-catégorie trouvée pour la catégorie sélectionnée.');
                    }
                } else {
                    console.error('L\'élément subcategory-select n\'a pas été trouvé dans le DOM.');
                }
            })
            .catch(error => console.error('Erreur lors du chargement des sous-catégories:', error));
    }

    // Définition des fonctions utilisées
    function loadBannerSettings() {
        fetch('/api/banner-settings')
            .then(response => response.json())
            .then(settings => {
                if (!settings) {
                    console.error('Erreur lors du chargement des paramètres de la bannière: Paramètres non définis');
                    return;
                }
                document.getElementById('toggle-banner').checked = settings.isActive;
                document.getElementById('featured-product-1-select').value = settings.product1 || '';
                document.getElementById('featured-product-2-select').value = settings.product2 || '';
                document.getElementById('featured-product-3-select').value = settings.product3 || '';
            })
            .catch(error => console.error('Erreur lors du chargement des paramètres de la bannière:', error));
    }

    // Charger les produits dans les sélections de la bannière
    function loadProductsForBanner() {
        fetch('/api/products')
            .then(response => response.json())
            .then(data => {
                const productSelects = [
                    document.getElementById('featured-product-1-select'),
                    document.getElementById('featured-product-2-select'),
                    document.getElementById('featured-product-3-select')
                ];

                productSelects.forEach(select => {
                    select.innerHTML = ''; // Clear previous options
                    data.products.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.id;
                        option.textContent = product.name;
                        select.appendChild(option);
                    });
                });
            })
            .catch(error => console.error('Erreur lors du chargement des produits pour la bannière:', error));
    }

    // Charger les paramètres de la bannière au chargement de la page
    loadBannerSettings();

    // Gestion de la sauvegarde des paramètres de la bannière
    document.getElementById('save-banner-settings').addEventListener('click', function() {
        const isActive = document.getElementById('toggle-banner').checked;
        const product1 = document.getElementById('featured-product-1-select').value;
        const product2 = document.getElementById('featured-product-2-select').value;
        const product3 = document.getElementById('featured-product-3-select').value;
        
        if (!product1 || !product2 || !product3) {
            alert('Veuillez sélectionner trois produits à mettre en avant.');
            return;
        }
        
        fetch('/api/update-banner-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive, product1, product2, product3 })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Paramètres de la bannière mis à jour avec succès');
                loadBannerSettings(); // Recharger les paramètres après la mise à jour
            } else {
                alert('Erreur lors de la mise à jour des paramètres de la bannière');
            }
        })
        .catch(error => console.error('Erreur lors de la mise à jour des paramètres de la bannière:', error));
    });

    // Personnalisation
    function updateColorPickers() {
        document.getElementById('couleur1').value = getComputedStyle(document.documentElement).getPropertyValue('--couleur1').trim();
        document.getElementById('couleur2').value = getComputedStyle(document.documentElement).getPropertyValue('--couleur2').trim();
        document.getElementById('couleur3').value = getComputedStyle(document.documentElement).getPropertyValue('--couleur3').trim();
        document.getElementById('couleur4').value = getComputedStyle(document.documentElement).getPropertyValue('--couleur4').trim();
        document.getElementById('couleur5').value = getComputedStyle(document.documentElement).getPropertyValue('--couleur5').trim();
        document.getElementById('couleur6').value = getComputedStyle(document.documentElement).getPropertyValue('--couleur6').trim();
        document.getElementById('couleur7').value = getComputedStyle(document.documentElement).getPropertyValue('--couleur7').trim();
        document.getElementById('couleur11').value = getComputedStyle(document.documentElement).getPropertyValue('--couleur11').trim();
    }

    // Mise à jour initiale des color pickers au chargement de la page
    updateColorPickers();

    const form = document.getElementById('color-customization-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const couleur1 = document.getElementById('couleur1').value;
        const couleur2 = document.getElementById('couleur2').value;
        const couleur3 = document.getElementById('couleur3').value;
        const couleur4 = document.getElementById('couleur4').value;
        const couleur5 = document.getElementById('couleur5').value;
        const couleur6 = document.getElementById('couleur6').value;
        const couleur7 = document.getElementById('couleur7').value;
        const couleur11 = document.getElementById('couleur11').value;
    
        try {
            const response = await fetch('/api/update-colors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ couleur1, couleur2, couleur3, couleur4, couleur5, couleur6, couleur7, couleur11 })
            });
    
            if (response.ok) {
                alert('Couleurs mises à jour avec succès.');
                updateColorPickers(); // Met à jour les color pickers après la mise à jour réussie
                window.location.hash = '#customization-section';
                window.location.reload();
            } else {
                console.error('Erreur de la réponse serveur:', response);
                alert('Erreur lors de la mise à jour des couleurs.');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des couleurs:', error);
        }
    });
    
    // Fonction pour envoyer les nouvelles couleurs au serveur
    function updateColors() {
        const formData = new FormData(document.getElementById('customization-form'));

        const couleurs = {
            couleur1: formData.get('couleur1'),
            couleur2: formData.get('couleur2'),
            couleur3: formData.get('couleur3'),
            couleur4: formData.get('couleur4'),
            couleur5: formData.get('couleur5'),
            couleur6: formData.get('couleur6'),
            couleur7: formData.get('couleur7'),
            couleur11: formData.get('couleur11')
        };

        fetch('/api/update-colors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(couleurs)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Couleurs mises à jour avec succès');
                // Mettez à jour les color pickers avec les nouvelles valeurs
                document.querySelectorAll('input[type="color"]').forEach(input => {
                    input.value = couleurs[input.name];
                });
            } else {
                alert('Erreur lors de la mise à jour des couleurs');
            }
        })
        .catch(error => console.error('Erreur lors de la mise à jour des couleurs:', error));
    }

    // Ajoutez cette fonction pour définir les valeurs des color pickers au chargement
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('customization-form').addEventListener('input', updateColors);
    });

    // Ajouter un événement de clic pour le bouton de réinitialisation des couleurs
    document.getElementById('reset-colors-btn').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/reset-colors', {
                method: 'POST',
            });

            if (response.ok) {
                alert('Couleurs réinitialisées avec succès.');
                // Mettre à jour les color pickers après la réinitialisation
                updateColorPickers();
                window.location.hash = '#customization-section';
                window.location.reload();
            } else {
                alert('Erreur lors de la réinitialisation des couleurs.');
            }
        } catch (error) {
            console.error('Erreur lors de la réinitialisation des couleurs:', error);
        }
    });

    // Ouverture de la pop-up de mise à jour des stocks
    if (addStockBtn && stockPopup) {
        addStockBtn.addEventListener('click', function() {
            stockPopup.style.display = 'flex';

            // Activer l'onglet "Gérer les stocks" par défaut
            document.querySelector('.tab-btn[data-tab="add-product"]').classList.remove('active');
            document.getElementById('add-product-section').classList.add('hidden');
            document.getElementById('add-product-section').style.display = 'none';

            document.querySelector('.tab-btn[data-tab="manage-stock"]').classList.add('active');
            document.getElementById('manage-stock-section').classList.remove('hidden');
            document.getElementById('manage-stock-section').style.display = 'block';

            document.querySelector('.tab-btn[data-tab="delete-product"]').classList.remove('active');
            document.getElementById('delete-product-section').classList.add('hidden');
            document.getElementById('delete-product-section').style.display = 'none';

            // Charger les produits dans le select pour la gestion des stocks et suppression
            loadProductOptions('product-select');
            loadProductOptions('delete-product-select');
        });

        // Fermeture de la pop-up via le bouton close
        if (closePopupBtn) {
            closePopupBtn.addEventListener('click', function() {
                stockPopup.style.display = 'none';
            });
        }

        // Fermeture de la pop-up en cliquant sur l'overlay
        if (popupOverlay) {
            popupOverlay.addEventListener('click', function() {
                stockPopup.style.display = 'none';
            });
        }

        // Empêcher la fermeture de la pop-up en cliquant à l'intérieur du contenu
        document.querySelector('.popup-content').addEventListener('click', function(event) {
            event.stopPropagation();
        });
    }

    // Gestion des onglets
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId + '-section');

            // Retirer la classe active de tous les boutons
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');

            // Masquer toutes les sections de contenu
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
                content.style.display = 'none'; // S'assurer que l'élément est masqué
            });

            // Afficher la section de contenu liée à l'onglet cliqué
            if (tabContent) {
                tabContent.classList.remove('hidden');
                tabContent.style.display = 'block';
            } else {
                console.error('Section non trouvée');
            }
        });
    });

    document.getElementById('update-category-btn').addEventListener('click', function() {
        const selectedCategoryId = document.getElementById('category-select').value;
        const newCategoryName = document.getElementById('new-category-name-modify').value;

        if (!selectedCategoryId || !newCategoryName) {
            alert('Veuillez sélectionner une catégorie et entrer un nouveau nom.');
            return;
        }

        fetch(`/api/products/categories/${selectedCategoryId}/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newCategoryName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Catégorie mise à jour avec succès');
                loadCategoriesForManagement(); // Recharger les catégories après la mise à jour
            } else {
                showNotification('Erreur lors de la mise à jour de la catégorie', 5000);
            }
        })
        .catch(error => console.error('Erreur lors de la mise à jour de la catégorie:', error));
    });

    // Gestion des boutons de masquage
    document.querySelectorAll('.toggle-section-btn').forEach(button => {
        const targetId = button.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);

        // Initialiser le texte du bouton en fonction de l'état actuel de la section
        if (targetElement.style.display === 'none' || !targetElement.style.display) {
            button.textContent = 'Masquer';
            targetElement.style.display = 'table';  // Explicitement défini comme "table" ou "block" pour correspondre à votre structure HTML
        } else {
            button.textContent = 'Afficher';
        }

        button.addEventListener('click', function() {
            if (targetElement) {
                if (targetElement.style.display === 'none' || targetElement.style.display === '') {
                    targetElement.style.display = 'table';  // ou 'block' selon le type d'élément
                    this.textContent = 'Masquer';
                } else {
                    targetElement.style.display = 'none';
                    this.textContent = 'Afficher';
                }
            } else {
                console.error(`L'élément avec l'ID ${targetId} n'a pas été trouvé.`);
            }
        });
    });

    document.querySelectorAll('.toggle-section-btn_FLEX').forEach(button => {
        const targetId = button.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);

        // Initialiser le texte du bouton en fonction de l'état actuel de la section
        if (targetElement.style.display === 'none' || !targetElement.style.display) {
            button.textContent = 'Masquer';
            targetElement.style.display = 'flex';  // Explicitement défini comme "table" ou "block" pour correspondre à votre structure HTML
        } else {
            button.textContent = 'Afficher';
        }

        button.addEventListener('click', function() {
            if (targetElement) {
                if (targetElement.style.display === 'none' || targetElement.style.display === '') {
                    targetElement.style.display = 'flex'; 
                    this.textContent = 'Masquer';
                } else {
                    targetElement.style.display = 'none';
                    this.textContent = 'Afficher';
                }
            } else {
                console.error(`L'élément avec l'ID ${targetId} n'a pas été trouvé.`);
            }
        });
    });

    // Gestion du formulaire pour mettre à jour le stock
    document.getElementById('manage-stock-form').addEventListener('submit', function(event) {
        event.preventDefault();
        updateStock();
    });

    // Gestion du formulaire pour supprimer un produit
    document.getElementById('delete-product-form').addEventListener('submit', function(event) {
        event.preventDefault();
        deleteProduct();
    });

    // Gestion de la recherche par email
    document.getElementById('search-email').addEventListener('input', filterUsersByEmail);

    // Gestion des en-têtes de tri
    document.querySelectorAll('#users-table thead th.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            const table = document.getElementById('users-table');
            const tbody = table.querySelector('tbody');
            const rows = Array.from(tbody.querySelectorAll('tr'));

            // Détecter l'ordre actuel et inverser
            const isAscending = this.classList.toggle('ascending');
            rows.sort((a, b) => {
                const cellA = a.querySelector(`td:nth-child(${Array.from(header.parentNode.children).indexOf(header) + 1})`).textContent.trim().toLowerCase();
                const cellB = b.querySelector(`td:nth-child(${Array.from(header.parentNode.children).indexOf(header) + 1})`).textContent.trim().toLowerCase();

                if (isAscending) {
                    return cellA.localeCompare(cellB);
                } else {
                    return cellB.localeCompare(cellA);
                }
            });

            // Réinsérer les lignes triées dans le tbody
            rows.forEach(row => tbody.appendChild(row));
        });
    });

    
    

    // Gérer la suppression d'une catégorie
    document.getElementById('delete-category-btn').addEventListener('click', function() {
        const selectedCategoryId = document.getElementById('category-select').value;
        deleteCategory(selectedCategoryId);
    });

    // Initialiser la gestion de la bannière
    loadProductsForBanner();
    loadBannerSettings();
    loadCategoriesForManagement();
    loadSubcategories();
    loadSubcategoriesForModification();
});

// Gérer l'ajout d'une nouvelle catégorie
document.getElementById('add-category-btn').addEventListener('click', function() {
    const newCategoryName = document.getElementById('new-category-name').value;

    if (!newCategoryName) {
        alert('Veuillez entrer un nom pour la nouvelle catégorie.');
        return;
    }

    fetch('/api/products/categories/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategoryName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Catégorie ajoutée avec succès', 3000); // Utiliser la notification
            document.getElementById('new-subcategory-name').value = ''; 
            loadCategoriesForManagement(); // Recharger les catégories après la suppression
        } else {
            showNotification('Erreur lors de la suppression de la catégorie', 5000); // Notification en cas d'erreur
        }
    })
    .catch(error => console.error('Erreur lors de l\'ajout de la catégorie:', error));
});

// Fonctions supplémentaires

function loadProductOptions(selectId) {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const productSelect = document.getElementById(selectId);
            if (productSelect) {
                productSelect.innerHTML = ''; // Vider les options précédentes

                data.products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.id;
                    option.textContent = product.name;
                    productSelect.appendChild(option);
                });
            } else {
                console.error(`L'élément avec l'ID ${selectId} n'a pas été trouvé.`);
            }
        })
        .catch(error => console.error('Erreur lors du chargement des produits:', error));
}

// Fonction pour charger les catégories dans la liste déroulante
function loadCategoriesForManagement() {
    fetch('/api/products/categories')
        .then(response => response.json())
        .then(data => {
            const categorySelect = document.getElementById('category-select');
            categorySelect.innerHTML = ''; // Effacer les options précédentes

            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categories_id;  // Utilise categories_id
                option.textContent = category.categories_name;  // Utilise categories_name
                categorySelect.appendChild(option);
            });

            // Charger le nom de la première catégorie dans l'input de modification
            if (data.categories.length > 0) {
                document.getElementById('new-category-name-modify').value = data.categories[0].categories_name;
            }

            // Mettre à jour l'input quand on change la sélection
            categorySelect.addEventListener('change', function() {
                const selectedOption = categorySelect.options[categorySelect.selectedIndex];
                document.getElementById('new-category-name-modify').value = selectedOption.textContent;
            });
        })
        .catch(error => console.error('Erreur lors du chargement des catégories:', error));
}

// Fonction pour charger les catégories dans le sélecteur pour les sous-catégories
function loadCategoriesForSubcategory() {
    fetch('/api/products/categories')
        .then(response => response.json())
        .then(data => {
            const categorySelect = document.getElementById('category-select-for-subcategory');
            categorySelect.innerHTML = ''; // Effacer les options précédentes

            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.categories_id;
                option.textContent = category.categories_name;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erreur lors du chargement des catégories pour les sous-catégories:', error));
}

document.getElementById('add-subcategory-btn').addEventListener('click', function() {
    const newSubcategoryName = document.getElementById('new-subcategory-name').value;

    if (!newSubcategoryName) {
        alert('Veuillez entrer un nom de sous-catégorie.');
        return;
    }

    fetch('/api/products/subcategories/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newSubcategoryName})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Catégorie secondaire ajoutée avec succès', 3000); // Utiliser la notification
            document.getElementById('new-subcategory-name').value = ''; 
            loadSubcategories(); // Recharger les catégories après la suppression
        } else {
            showNotification('Erreur lors de l/ajout de la catégorie secondaire', 5000); // Notification en cas d'erreur
        }
    })
    .catch(error => console.error('Erreur lors de l\'ajout de la sous-catégorie:', error));
});

// Fonction pour charger les sous-catégories dans le sélecteur
function loadSubcategories() {
    fetch('/api/products/subcategories')
        .then(response => response.json())
        .then(data => {
            const subcategorySelect = document.getElementById('subcategory-select');
            subcategorySelect.innerHTML = ''; // Effacer les options précédentes

            data.subcategories.forEach(subcategory => {
                const option = document.createElement('option');
                option.value = subcategory.subcategory_id;
                option.textContent = subcategory.subcategory_name;
                subcategorySelect.appendChild(option);
            });

            // Charger le nom de la première sous-catégorie dans l'input de modification
            if (data.subcategories.length > 0) {
                document.getElementById('new-subcategory-name-modify').value = data.subcategories[0].subcategory_name;
            }

            // Mettre à jour l'input quand on change la sélection
            subcategorySelect.addEventListener('change', function() {
                const selectedOption = subcategorySelect.options[subcategorySelect.selectedIndex];
                document.getElementById('new-subcategory-name-modify').value = selectedOption.textContent;
            });
        })
        .catch(error => console.error('Erreur lors du chargement des sous-catégories:', error));
}

// Mettre à jour une sous-catégorie
document.getElementById('update-subcategory-btn').addEventListener('click', function() {
    const selectedSubcategoryId = document.getElementById('subcategory-select').value;
    const newSubcategoryName = document.getElementById('new-subcategory-name-modify').value;

    fetch(`/api/products/subcategories/${selectedSubcategoryId}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newSubcategoryName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Catégorie secondaire modifiée avec succès', 3000); // Utiliser la notification
            loadSubcategories(); // Recharger les catégories après la suppression
        } else {
            showNotification('Erreur lors de la modification de la catégorie secondaire', 5000); // Notification en cas d'erreur
        }
    })
    .catch(error => console.error('Erreur lors de la mise à jour de la sous-catégorie:', error));
});



// Fonction pour mettre à jour le nom de la catégorie
function updateCategoryName(categoryId, newName) {
    fetch(`/api/products/categories/${categoryId}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Catégorie mise à jour avec succès', 3000); // Utiliser la notification
            loadCategoriesForManagement(); // Recharger les catégories après la mise à jour
        } else {
            showNotification('Erreur lors de la mise à jour de la catégorie', 5000); // Notification en cas d'erreur
        }
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour de la catégorie:', error);
        showNotification('Une erreur est survenue lors de la mise à jour de la catégorie', 5000); // Notification en cas d'erreur
    });
}


// Supprimer une sous-catégorie
document.getElementById('delete-subcategory-btn').addEventListener('click', function() {
    const selectedSubcategoryId = document.getElementById('subcategory-select').value;

    if (confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) {
        fetch(`/api/products/subcategories/${selectedSubcategoryId}/delete`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Catégorie secondaire supprimée avec succès', 3000); // Utiliser la notification
                loadSubcategories(); // Recharger les catégories après la suppression
            } else {
                showNotification('Erreur lors de la suppression de la catégorie secondaire', 5000); // Notification en cas d'erreur
            }
        })
        .catch(error => console.error('Erreur lors de la suppression de la sous-catégorie:', error));
    }
});


// Fonction pour ajouter une nouvelle catégorie
function addCategory() {
    const newCategoryName = document.getElementById('new-category-name').value;

    fetch('/api/products/categories/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newCategoryName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Catégorie ajoutée avec succès', 3000); // Utiliser la notification
            loadCategoriesForManagement(); // Recharger les catégories après la suppression
        } else {
            showNotification('Erreur lors de la suppression de la catégorie', 5000); // Notification en cas d'erreur
        }
    })
    .catch(error => console.error('Erreur lors de l\'ajout de la catégorie:', error));
}

 // Fonction pour mettre à jour le nom de la catégorie
 function updateCategoryName(categoryId, newName) {
    fetch(`/api/products/categories/${categoryId}/update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Catégorie mise à jour avec succès', 3000); 
            loadCategoriesForManagement(); // Recharger les catégories après la suppression
        } else {
            showNotification('Erreur lors de la suppression de la catégorie', 5000); // Notification en cas d'erreur
        }
    })
    .catch(error => console.error('Erreur lors de la mise à jour de la catégorie:', error));
}

// Fonction pour supprimer une catégorie
function deleteCategory(categoryId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
        fetch(`/api/products/categories/${categoryId}/delete`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Catégorie supprimée avec succès', 3000); // Utiliser la notification
                loadCategoriesForManagement(); // Recharger les catégories après la suppression
            } else {
                showNotification('Erreur lors de la suppression de la catégorie', 5000); // Notification en cas d'erreur
            }
        })
        .catch(error => {
            console.error('Erreur lors de la suppression de la catégorie:', error);
            showNotification('Une erreur est survenue lors de la suppression de la catégorie', 5000); // Notification en cas d'erreur
        });
    }
}



function deleteProduct() {
    const productId = document.getElementById('delete-product-select').value;

    fetch('/api/products/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Produit supprimé avec succès');
            fetchStocks(); // Rafraîchir la liste des stocks
            loadProductOptions('product-select'); // Rafraîchir la liste des produits dans le select
            loadProductOptions('delete-product-select'); // Rafraîchir la liste des produits dans le select
        } else {
            showNotification('Erreur lors de la suppression du produit', 5000); // Affichage plus long en cas d'erreur
        }
    })
    .catch(error => console.error('Erreur lors de la suppression du produit:', error));
}

function updateStock() {
    const productId = document.getElementById('product-select').value;
    const stockChange = document.getElementById('stock-change').value;

    fetch('/api/products/update-stock', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, stockChange })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Stock mis à jour avec succès');
            fetchStocks(); // Rafraîchir la liste des stocks
        } else {
            showNotification('Erreur lors de la mise à jour du stock', 5000); // Affichage plus long en cas d'erreur
        }
    })
    .catch(error => console.error('Erreur lors de la mise à jour du stock:', error));
}

// Gestion du formulaire pour ajouter un produit
document.getElementById('add-product-form').addEventListener('submit', function(event) {
    event.preventDefault();
    addNewProduct();
});

function addNewProduct() {
    const formData = new FormData();
    formData.append('name', document.getElementById('product-name').value);
    formData.append('description', document.getElementById('product-description').value);
    formData.append('price', document.getElementById('product-price').value);
    formData.append('stock', document.getElementById('product-stock').value);
    
    const categoryId = document.getElementById('category-select').value;
    const subcategoryId = document.getElementById('subcategory-select').value;
    const imageFile = document.getElementById('product-image').files[0];

    // Vérifier que les deux sélections ne sont pas vides ou indéfinies
    if (!categoryId || !subcategoryId) {
        showNotification('Veuillez sélectionner une catégorie et une sous-catégorie valides.', 5000);
        return;
    }

    formData.append('category_id', categoryId); 
    formData.append('subcategory_id', subcategoryId); 
    
    if (imageFile) {
        formData.append('image', imageFile); // Assurez-vous que le nom ici correspond à 'image' dans multer
    }

    fetch('/api/products/add', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Produit ajouté avec succès');

            // Vider le formulaire après ajout
            document.getElementById('add-product-form').reset();

            // Fermer la pop-up après un court délai
            setTimeout(() => {
                document.getElementById('stock-product-popup').style.display = 'none';
                fetchStocks(); // Rafraîchir la liste des stocks
            }, 2000); // Délai de 2 secondes pour permettre à l'utilisateur de voir la notification
        } else {
            showNotification('Erreur lors de l\'ajout du produit', 5000);
        }
    })
    .catch(error => {
        console.error('Erreur lors de l\'ajout du produit:', error);
        showNotification('Erreur lors de l\'ajout du produit', 5000);
    });
}


function fetchLastUsers() {
    fetch('/api/users/last-users')
        .then(response => response.json())
        .then(data => {
            if (data.users) {
                displayUsers(data.users);
            } else {
                console.error('Aucun utilisateur trouvé dans la réponse:', data);
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des utilisateurs:', error));
}

function changeUserRole(userId, newRole) {
    fetch('/api/users/change-role', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, newRole })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Rôle mis à jour avec succès');
            fetchUsers(); // Rafraîchir la liste des utilisateurs
        } else {
            alert('Une erreur est survenue lors de la mise à jour du rôle');
        }
    })
    .catch(error => console.error('Erreur lors de la mise à jour du rôle:', error));
}

function fetchStocks() {
    const stockTable = document.getElementById('stock-table');
    
    if (!stockTable) {
        console.error("L'élément avec l'ID 'stock-table' n'a pas été trouvé.");
        return;
    }

    fetch('/api/stocks')
        .then(response => response.json())
        .then(data => {
            stockTable.innerHTML = ''; // Effacer les données existantes
            data.stocks.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.stock}</td>
                `;
                stockTable.appendChild(row);
            });
        })
        .catch(error => console.error('Erreur lors de la récupération des stocks:', error));
}

function fetchOrders() {
    const ordersTable = document.getElementById('orders-table');
    
    if (!ordersTable) {
        console.error("L'élément avec l'ID 'orders-table' n'a pas été trouvé.");
        return;
    }

    fetch('/api/orders')
        .then(response => response.json())
        .then(data => {
            ordersTable.innerHTML = ''; // Effacer les données existantes
            data.orders.forEach(order => {
                const total = parseFloat(order.total) || 0;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.username}</td>
                    <td>${order.order_date}</td>
                    <td>${total.toFixed(2)} €</td>
                `;
                ordersTable.appendChild(row);
            });
        })
        .catch(error => console.error('Erreur lors de la récupération des commandes:', error));
}

function fetchOrderStats() {
    fetch('/api/products/order-stats')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur HTTP: ' + response.status + ' - ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'Aucune statistique de commande trouvée.') {
                console.error('Erreur: ', data.message);
                return;
            }

            // Vérifier la présence et la validité des données
            if (!data.dates || !Array.isArray(data.dates) || !data.orderCounts || !Array.isArray(data.orderCounts)) {
                console.error('Les données de dates ou de commandes sont manquantes ou invalides.');
                console.error('Données reçues:', data); // Afficher les données reçues pour le débogage
                return;
            }

            const cleanedDates = data.dates.map(date => date.split(' ')[0]);
            // Utiliser la couleur de la variable CSS pour la courbe
            const couleurCourbe = getComputedStyle(document.documentElement).getPropertyValue('--couleur3').trim();
            const ctx = document.getElementById('orders-chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: cleanedDates,
                    datasets: [{
                        label: 'Commandes par jour',
                        data: data.orderCounts,
                        borderColor: couleurCourbe,
                        backgroundColor: 'rgba(192, 192, 192, 0.3)',
                        fill: true,
                    }]
                },
                options: {
                    scales: {
                        x: {
                            beginAtZero: true
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des statistiques de commandes:', error);
            // Ajoutez un log supplémentaire pour la réponse JSON
            fetch('/api/products/order-stats')
                .then(response => response.text())
                .then(text => console.log('Réponse texte brute:', text))
                .catch(err => console.error('Erreur lors de la récupération du texte de réponse:', err));
        });
}

function displayUsers(users) {
    if (!users || users.length === 0) {
        console.error('La liste des utilisateurs est vide ou non définie.');
        return;
    }

    const usersTableBody = document.querySelector('#users-table tbody');
    usersTableBody.innerHTML = ''; // Vider le contenu précédent

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button onclick="changeUserRole(${user.id}, '${user.role === 'client' ? 'commercant' : 'client'}')">
                    Passer à ${user.role === 'client' ? 'Commerçant' : 'Client'}
                </button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });
}

// Fonction pour filtrer les utilisateurs par email
function filterUsersByEmail() {
    const searchInput = document.getElementById('search-email').value.toLowerCase();
    const rows = document.querySelectorAll('#users-table tbody tr');

    rows.forEach(row => {
        const email = row.children[1].textContent.toLowerCase();
        if (email.includes(searchInput)) {
            row.style.display = ''; // Afficher la ligne
        } else {
            row.style.display = 'none'; // Masquer la ligne
        }
    });
}

// Fonction notification
function showNotification(message, duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    notification.classList.remove('hidden');

    // Cacher la notification après le délai spécifié
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hidden');
    }, duration);
}

