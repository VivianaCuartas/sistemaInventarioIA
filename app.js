/**
 * SISTEMA DE GESTIÓN DE INVENTARIO
 * ================================
 * Sistema completo de gestión de inventario con control de roles,
 * manejo de productos, movimientos y estadísticas.
 * Persistencia total en localStorage.
 */

// ===================================
// CONFIGURACIÓN Y CONSTANTES
// ===================================

const CONFIG = {
    STORAGE_KEYS: {
        PRODUCTS: 'inventory_products',
        CATEGORIES: 'inventory_categories',
        MOVEMENTS: 'inventory_movements',
        CURRENT_USER: 'inventory_current_user'
    },
    USERS: {
        admin: { username: 'admin', password: '1234', role: 'admin', name: 'Administrador' },
        empleado: { username: 'empleado', password: '1234', role: 'empleado', name: 'Empleado' }
    },
    ROLES: {
        ADMIN: 'admin',
        EMPLEADO: 'empleado'
    },
    MOVEMENT_REASONS: {
        entrada: ['Compra', 'Devolución de cliente', 'Ajuste de inventario', 'Producción'],
        salida: ['Venta', 'Pérdida', 'Devolución a proveedor', 'Merma', 'Ajuste de inventario']
    }
};

// ===================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ===================================

const AppState = {
    currentUser: null,
    currentView: null,
    products: [],
    categories: [],
    movements: [],
    modals: {}
};

// ===================================
// GESTIÓN DE ALMACENAMIENTO
// ===================================

const Storage = {
    /**
     * Guarda datos en localStorage
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            return false;
        }
    },

    /**
     * Obtiene datos de localStorage
     */
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Error al leer de localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Elimina datos de localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error al eliminar de localStorage:', error);
            return false;
        }
    },

    /**
     * Limpia todo el localStorage
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error al limpiar localStorage:', error);
            return false;
        }
    }
};

// ===================================
// GESTIÓN DE DATOS
// ===================================

const DataManager = {
    /**
     * Inicializa los datos de la aplicación
     */
    init() {
        // Cargar productos
        AppState.products = Storage.get(CONFIG.STORAGE_KEYS.PRODUCTS, []);
        
        // Cargar categorías
        AppState.categories = Storage.get(CONFIG.STORAGE_KEYS.CATEGORIES, this.getDefaultCategories());
        if (AppState.categories.length === 0) {
            AppState.categories = this.getDefaultCategories();
            this.saveCategories();
        }
        
        // Cargar movimientos
        AppState.movements = Storage.get(CONFIG.STORAGE_KEYS.MOVEMENTS, []);
        
        // Cargar usuario actual
        AppState.currentUser = Storage.get(CONFIG.STORAGE_KEYS.CURRENT_USER, null);
    },

    /**
     * Categorías por defecto del sistema
     */
    getDefaultCategories() {
        return [
            { id: this.generateId(), name: 'Electrónica', description: 'Productos electrónicos y tecnológicos' },
            { id: this.generateId(), name: 'Alimentos', description: 'Productos alimenticios' },
            { id: this.generateId(), name: 'Bebidas', description: 'Todo tipo de bebidas' },
            { id: this.generateId(), name: 'Limpieza', description: 'Productos de limpieza e higiene' },
            { id: this.generateId(), name: 'Oficina', description: 'Material de oficina y papelería' }
        ];
    },

    /**
     * Genera un ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // ===== PRODUCTOS =====

    /**
     * Obtiene todos los productos
     */
    getProducts() {
        return AppState.products;
    },

    /**
     * Obtiene un producto por ID
     */
    getProductById(id) {
        return AppState.products.find(p => p.id === id);
    },

    /**
     * Obtiene un producto por código
     */
    getProductByCode(code) {
        return AppState.products.find(p => p.code === code);
    },

    /**
     * Agrega un nuevo producto
     */
    addProduct(productData) {
        const product = {
            id: this.generateId(),
            code: productData.code,
            name: productData.name,
            category: productData.category,
            description: productData.description || '',
            price: parseFloat(productData.price),
            stock: parseInt(productData.initialStock) || 0,
            minStock: parseInt(productData.minStock),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        AppState.products.push(product);
        this.saveProducts();

        // Registrar movimiento inicial si hay stock
        if (product.stock > 0) {
            this.addMovement({
                productId: product.id,
                type: 'entrada',
                quantity: product.stock,
                reason: 'Stock inicial',
                notes: 'Producto creado con stock inicial'
            });
        }

        return product;
    },

    /**
     * Actualiza un producto existente
     */
    updateProduct(id, productData) {
        const index = AppState.products.findIndex(p => p.id === id);
        if (index === -1) return null;

        AppState.products[index] = {
            ...AppState.products[index],
            code: productData.code,
            name: productData.name,
            category: productData.category,
            description: productData.description || '',
            price: parseFloat(productData.price),
            minStock: parseInt(productData.minStock),
            updatedAt: new Date().toISOString()
        };

        this.saveProducts();
        return AppState.products[index];
    },

    /**
     * Elimina un producto
     */
    deleteProduct(id) {
        const index = AppState.products.findIndex(p => p.id === id);
        if (index === -1) return false;

        AppState.products.splice(index, 1);
        this.saveProducts();
        return true;
    },

    /**
     * Actualiza el stock de un producto
     */
    updateStock(productId, quantity, type) {
        const product = this.getProductById(productId);
        if (!product) return false;

        if (type === 'entrada') {
            product.stock += quantity;
        } else if (type === 'salida') {
            if (product.stock < quantity) return false;
            product.stock -= quantity;
        }

        product.updatedAt = new Date().toISOString();
        this.saveProducts();
        return true;
    },

    /**
     * Guarda productos en localStorage
     */
    saveProducts() {
        Storage.save(CONFIG.STORAGE_KEYS.PRODUCTS, AppState.products);
    },

    // ===== CATEGORÍAS =====

    /**
     * Obtiene todas las categorías
     */
    getCategories() {
        return AppState.categories;
    },

    /**
     * Obtiene una categoría por ID
     */
    getCategoryById(id) {
        return AppState.categories.find(c => c.id === id);
    },

    /**
     * Agrega una nueva categoría
     */
    addCategory(categoryData) {
        const category = {
            id: this.generateId(),
            name: categoryData.name,
            description: categoryData.description || '',
            createdAt: new Date().toISOString()
        };

        AppState.categories.push(category);
        this.saveCategories();
        return category;
    },

    /**
     * Actualiza una categoría existente
     */
    updateCategory(id, categoryData) {
        const index = AppState.categories.findIndex(c => c.id === id);
        if (index === -1) return null;

        AppState.categories[index] = {
            ...AppState.categories[index],
            name: categoryData.name,
            description: categoryData.description || ''
        };

        this.saveCategories();
        return AppState.categories[index];
    },

    /**
     * Elimina una categoría
     */
    deleteCategory(id) {
        // Verificar si hay productos con esta categoría
        const hasProducts = AppState.products.some(p => p.category === id);
        if (hasProducts) return false;

        const index = AppState.categories.findIndex(c => c.id === id);
        if (index === -1) return false;

        AppState.categories.splice(index, 1);
        this.saveCategories();
        return true;
    },

    /**
     * Guarda categorías en localStorage
     */
    saveCategories() {
        Storage.save(CONFIG.STORAGE_KEYS.CATEGORIES, AppState.categories);
    },

    // ===== MOVIMIENTOS =====

    /**
     * Obtiene todos los movimientos
     */
    getMovements() {
        return AppState.movements;
    },

    /**
     * Agrega un nuevo movimiento
     */
    addMovement(movementData) {
        const movement = {
            id: this.generateId(),
            productId: movementData.productId,
            type: movementData.type,
            quantity: parseInt(movementData.quantity),
            reason: movementData.reason,
            notes: movementData.notes || '',
            user: AppState.currentUser.username,
            userName: AppState.currentUser.name,
            date: new Date().toISOString()
        };

        // Actualizar stock del producto
        const success = this.updateStock(movement.productId, movement.quantity, movement.type);
        if (!success && movement.type === 'salida') {
            return null; // No hay suficiente stock
        }

        AppState.movements.unshift(movement); // Agregar al inicio
        this.saveMovements();
        return movement;
    },

    /**
     * Guarda movimientos en localStorage
     */
    saveMovements() {
        Storage.save(CONFIG.STORAGE_KEYS.MOVEMENTS, AppState.movements);
    }
};

// ===================================
// GESTIÓN DE AUTENTICACIÓN
// ===================================

const Auth = {
    /**
     * Inicia sesión de usuario
     */
    login(username, password) {
        const user = CONFIG.USERS[username];
        
        if (!user || user.password !== password) {
            return { success: false, message: 'Usuario o contraseña incorrectos' };
        }

        AppState.currentUser = user;
        Storage.save(CONFIG.STORAGE_KEYS.CURRENT_USER, user);
        
        return { success: true, user };
    },

    /**
     * Cierra sesión
     */
    logout() {
        AppState.currentUser = null;
        Storage.remove(CONFIG.STORAGE_KEYS.CURRENT_USER);
        UI.showLogin();
    },

    /**
     * Verifica si hay sesión activa
     */
    checkSession() {
        return AppState.currentUser !== null;
    },

    /**
     * Verifica si el usuario es administrador
     */
    isAdmin() {
        return AppState.currentUser && AppState.currentUser.role === CONFIG.ROLES.ADMIN;
    }
};

// ===================================
// GESTIÓN DE INTERFAZ
// ===================================

const UI = {
    /**
     * Inicializa la interfaz
     */
    init() {
        this.initializeElements();
        this.initializeModals();
        this.attachEventListeners();
        
        if (Auth.checkSession()) {
            this.showMainSystem();
        } else {
            this.showLogin();
        }
    },

    /**
     * Inicializa referencias a elementos del DOM
     */
    initializeElements() {
        this.elements = {
            loginScreen: document.getElementById('loginScreen'),
            mainSystem: document.getElementById('mainSystem'),
            loginForm: document.getElementById('loginForm'),
            logoutBtn: document.getElementById('logoutBtn'),
            currentUser: document.getElementById('currentUser'),
            currentRole: document.getElementById('currentRole'),
            navMenu: document.getElementById('navMenu'),
            
            // Vistas
            dashboardView: document.getElementById('dashboardView'),
            productsView: document.getElementById('productsView'),
            movementsView: document.getElementById('movementsView'),
            categoriesView: document.getElementById('categoriesView')
        };
    },

    /**
     * Inicializa los modales de Bootstrap
     */
    initializeModals() {
        AppState.modals = {
            product: new bootstrap.Modal(document.getElementById('productModal')),
            movement: new bootstrap.Modal(document.getElementById('movementModal')),
            category: new bootstrap.Modal(document.getElementById('categoryModal'))
        };
    },

    /**
     * Adjunta eventos globales
     */
    attachEventListeners() {
        // Login
        this.elements.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        this.elements.logoutBtn.addEventListener('click', () => {
            Auth.logout();
        });

        // Navegación
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const view = e.target.dataset.view;
                if (view) this.showView(view);
            }
        });
    },

    /**
     * Maneja el login
     */
    handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const result = Auth.login(username, password);

        if (result.success) {
            this.showMainSystem();
        } else {
            this.showAlert('danger', result.message);
        }
    },

    /**
     * Muestra la pantalla de login
     */
    showLogin() {
        this.elements.loginScreen.classList.remove('d-none');
        this.elements.mainSystem.classList.add('d-none');
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    },

    /**
     * Muestra el sistema principal
     */
    showMainSystem() {
        this.elements.loginScreen.classList.add('d-none');
        this.elements.mainSystem.classList.remove('d-none');
        
        // Actualizar información de usuario
        this.elements.currentUser.textContent = AppState.currentUser.name;
        this.elements.currentRole.textContent = AppState.currentUser.role === CONFIG.ROLES.ADMIN ? 'Administrador' : 'Empleado';
        
        // Construir menú según rol
        this.buildMenu();
        
        // Mostrar vista inicial
        if (Auth.isAdmin()) {
            this.showView('dashboard');
        } else {
            this.showView('products');
        }
    },

    /**
     * Construye el menú de navegación según el rol
     */
    buildMenu() {
        const isAdmin = Auth.isAdmin();
        let menuHTML = '';

        if (isAdmin) {
            menuHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="#" data-view="dashboard">
                        <i class="bi bi-speedometer2 me-1"></i>Dashboard
                    </a>
                </li>
            `;
        }

        menuHTML += `
            <li class="nav-item">
                <a class="nav-link" href="#" data-view="products">
                    <i class="bi bi-box-seam me-1"></i>Productos
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-view="movements">
                    <i class="bi bi-arrow-left-right me-1"></i>Movimientos
                </a>
            </li>
        `;

        if (isAdmin) {
            menuHTML += `
                <li class="nav-item">
                    <a class="nav-link" href="#" data-view="categories">
                        <i class="bi bi-tags me-1"></i>Categorías
                    </a>
                </li>
            `;
        }

        this.elements.navMenu.innerHTML = menuHTML;
    },

    /**
     * Muestra una vista específica
     */
    showView(viewName) {
        // Ocultar todas las vistas
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.add('d-none');
        });

        // Remover clase active de todos los nav-links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Mostrar vista seleccionada
        const viewElement = document.getElementById(`${viewName}View`);
        if (viewElement) {
            viewElement.classList.remove('d-none');
            AppState.currentView = viewName;

            // Activar enlace correspondiente
            const activeLink = document.querySelector(`[data-view="${viewName}"]`);
            if (activeLink) activeLink.classList.add('active');

            // Renderizar contenido de la vista
            this.renderView(viewName);
        }
    },

    /**
     * Renderiza el contenido de una vista
     */
    renderView(viewName) {
        switch (viewName) {
            case 'dashboard':
                Dashboard.render();
                break;
            case 'products':
                Products.render();
                break;
            case 'movements':
                Movements.render();
                break;
            case 'categories':
                Categories.render();
                break;
        }
    },

    /**
     * Muestra una alerta temporal
     */
    showAlert(type, message, duration = 3000) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.remove();
        }, duration);
    },

    /**
     * Formatea una fecha
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Formatea un número como moneda
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }
};

// ===================================
// MÓDULO: DASHBOARD
// ===================================

const Dashboard = {
    /**
     * Renderiza el dashboard
     */
    render() {
        this.updateStatistics();
        this.renderLowStockProducts();
        this.renderMostActiveProducts();
        this.renderRecentMovements();
    },

    /**
     * Actualiza las estadísticas del dashboard
     */
    updateStatistics() {
        const products = DataManager.getProducts();
        const movements = DataManager.getMovements();

        // Total de productos
        document.getElementById('totalProducts').textContent = products.length;

        // Stock total
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        document.getElementById('totalStock').textContent = totalStock;

        // Productos con stock bajo
        const lowStock = products.filter(p => p.stock <= p.minStock);
        document.getElementById('lowStockCount').textContent = lowStock.length;

        // Total de movimientos
        document.getElementById('totalMovements').textContent = movements.length;
    },

    /**
     * Renderiza productos con stock bajo
     */
    renderLowStockProducts() {
        const products = DataManager.getProducts();
        const lowStockProducts = products.filter(p => p.stock <= p.minStock)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5);

        const container = document.getElementById('lowStockList');

        if (lowStockProducts.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-3">No hay productos con stock bajo</div>';
            return;
        }

        container.innerHTML = lowStockProducts.map(product => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${product.name}</strong>
                    <br>
                    <small class="text-muted">Stock: ${product.stock} / Mínimo: ${product.minStock}</small>
                </div>
                <span class="badge bg-danger">${product.stock}</span>
            </div>
        `).join('');
    },

    /**
     * Renderiza productos más activos
     */
    renderMostActiveProducts() {
        const movements = DataManager.getMovements();
        const products = DataManager.getProducts();

        // Contar movimientos por producto
        const productMovements = {};
        movements.forEach(m => {
            productMovements[m.productId] = (productMovements[m.productId] || 0) + 1;
        });

        // Ordenar y obtener top 5
        const topProducts = Object.entries(productMovements)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([productId, count]) => ({
                product: DataManager.getProductById(productId),
                count
            }))
            .filter(item => item.product);

        const container = document.getElementById('mostActiveList');

        if (topProducts.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-3">No hay movimientos registrados</div>';
            return;
        }

        container.innerHTML = topProducts.map(item => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${item.product.name}</strong>
                    <br>
                    <small class="text-muted">Stock actual: ${item.product.stock}</small>
                </div>
                <span class="badge bg-info">${item.count} mov.</span>
            </div>
        `).join('');
    },

    /**
     * Renderiza movimientos recientes
     */
    renderRecentMovements() {
        const movements = DataManager.getMovements().slice(0, 10);
        const tbody = document.getElementById('recentMovementsTable');

        if (movements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay movimientos registrados</td></tr>';
            return;
        }

        tbody.innerHTML = movements.map(movement => {
            const product = DataManager.getProductById(movement.productId);
            const typeClass = movement.type === 'entrada' ? 'success' : 'danger';
            const typeIcon = movement.type === 'entrada' ? 'arrow-down-circle' : 'arrow-up-circle';

            return `
                <tr>
                    <td>${UI.formatDate(movement.date)}</td>
                    <td>${product ? product.name : 'Producto eliminado'}</td>
                    <td>
                        <span class="badge bg-${typeClass}">
                            <i class="bi bi-${typeIcon} me-1"></i>${movement.type}
                        </span>
                    </td>
                    <td><strong>${movement.quantity}</strong></td>
                    <td>${movement.userName}</td>
                </tr>
            `;
        }).join('');
    }
};

// ===================================
// MÓDULO: PRODUCTOS
// ===================================

const Products = {
    /**
     * Renderiza la vista de productos
     */
    render() {
        this.attachEventListeners();
        this.updateCategoryFilter();
        this.renderTable();
    },

    /**
     * Adjunta eventos específicos de productos
     */
    attachEventListeners() {
        // Botón agregar producto (solo admin)
        const addBtn = document.getElementById('addProductBtn');
        if (addBtn) {
            addBtn.onclick = () => this.showProductModal();
        }

        // Filtros
        document.getElementById('searchProduct').oninput = () => this.renderTable();
        document.getElementById('filterCategory').onchange = () => this.renderTable();
        document.getElementById('filterStock').onchange = () => this.renderTable();

        // Guardar producto
        document.getElementById('saveProductBtn').onclick = () => this.saveProduct();
    },

    /**
     * Actualiza el filtro de categorías
     */
    updateCategoryFilter() {
        const select = document.getElementById('filterCategory');
        const categories = DataManager.getCategories();

        const optionsHTML = '<option value="">Todas las categorías</option>' +
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');

        select.innerHTML = optionsHTML;
    },

    /**
     * Renderiza la tabla de productos
     */
    renderTable() {
        let products = DataManager.getProducts();

        // Aplicar filtros
        const searchText = document.getElementById('searchProduct').value.toLowerCase();
        const filterCategory = document.getElementById('filterCategory').value;
        const filterStock = document.getElementById('filterStock').value;

        if (searchText) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchText) ||
                p.code.toLowerCase().includes(searchText)
            );
        }

        if (filterCategory) {
            products = products.filter(p => p.category === filterCategory);
        }

        if (filterStock) {
            products = products.filter(p => {
                if (filterStock === 'low') return p.stock <= p.minStock;
                if (filterStock === 'normal') return p.stock > p.minStock && p.stock <= p.minStock * 2;
                if (filterStock === 'high') return p.stock > p.minStock * 2;
                return true;
            });
        }

        const tbody = document.getElementById('productsTable');

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No se encontraron productos</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => {
            const category = DataManager.getCategoryById(product.category);
            const stockStatus = this.getStockStatus(product);
            const isAdmin = Auth.isAdmin();

            return `
                <tr>
                    <td><code>${product.code}</code></td>
                    <td><strong>${product.name}</strong></td>
                    <td>${category ? category.name : 'Sin categoría'}</td>
                    <td><span class="badge ${stockStatus.class}">${product.stock}</span></td>
                    <td>${product.minStock}</td>
                    <td>${UI.formatCurrency(product.price)}</td>
                    <td>${stockStatus.badge}</td>
                    <td>
                        <button class="btn btn-sm btn-info btn-action" onclick="Products.viewProduct('${product.id}')" title="Ver detalles">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${isAdmin ? `
                            <button class="btn btn-sm btn-warning btn-action" onclick="Products.editProduct('${product.id}')" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="Products.deleteProduct('${product.id}')" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Obtiene el estado del stock
     */
    getStockStatus(product) {
        if (product.stock <= product.minStock) {
            return {
                class: 'bg-danger',
                badge: '<span class="badge bg-danger"><i class="bi bi-exclamation-triangle me-1"></i>Bajo</span>'
            };
        } else if (product.stock <= product.minStock * 2) {
            return {
                class: 'bg-warning',
                badge: '<span class="badge bg-warning"><i class="bi bi-dash-circle me-1"></i>Normal</span>'
            };
        } else {
            return {
                class: 'bg-success',
                badge: '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Bueno</span>'
            };
        }
    },

    /**
     * Muestra el modal de producto
     */
    showProductModal(productId = null) {
        const modal = AppState.modals.product;
        const form = document.getElementById('productForm');
        const title = document.getElementById('productModalTitle');
        const initialStockGroup = document.getElementById('initialStockGroup');

        form.reset();

        if (productId) {
            // Editar producto
            const product = DataManager.getProductById(productId);
            if (!product) return;

            title.textContent = 'Editar Producto';
            document.getElementById('productId').value = product.id;
            document.getElementById('productCode').value = product.code;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productMinStock').value = product.minStock;

            // Ocultar campo de stock inicial en edición
            initialStockGroup.style.display = 'none';
        } else {
            // Nuevo producto
            title.textContent = 'Nuevo Producto';
            document.getElementById('productId').value = '';
            initialStockGroup.style.display = 'block';
        }

        // Llenar categorías
        this.updateCategorySelect();

        modal.show();
    },

    /**
     * Actualiza el select de categorías en el modal
     */
    updateCategorySelect() {
        const select = document.getElementById('productCategory');
        const categories = DataManager.getCategories();

        select.innerHTML = '<option value="">Seleccione una categoría</option>' +
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    },

    /**
     * Guarda un producto (crear o editar)
     */
    saveProduct() {
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const productId = document.getElementById('productId').value;
        const productData = {
            code: document.getElementById('productCode').value.trim(),
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value.trim(),
            price: document.getElementById('productPrice').value,
            minStock: document.getElementById('productMinStock').value,
            initialStock: document.getElementById('productInitialStock').value
        };

        // Validar código único
        const existingProduct = DataManager.getProductByCode(productData.code);
        if (existingProduct && existingProduct.id !== productId) {
            UI.showAlert('danger', 'Ya existe un producto con ese código');
            return;
        }

        if (productId) {
            // Actualizar
            DataManager.updateProduct(productId, productData);
            UI.showAlert('success', 'Producto actualizado correctamente');
        } else {
            // Crear
            DataManager.addProduct(productData);
            UI.showAlert('success', 'Producto creado correctamente');
        }

        AppState.modals.product.hide();
        this.renderTable();
        
        // Actualizar dashboard si está visible
        if (AppState.currentView === 'dashboard') {
            Dashboard.render();
        }
    },

    /**
     * Ver detalles de un producto
     */
    viewProduct(productId) {
        const product = DataManager.getProductById(productId);
        if (!product) return;

        const category = DataManager.getCategoryById(product.category);
        const stockStatus = this.getStockStatus(product);

        alert(`
DETALLES DEL PRODUCTO
────────────────────────

Código: ${product.code}
Nombre: ${product.name}
Categoría: ${category ? category.name : 'Sin categoría'}
Descripción: ${product.description || 'Sin descripción'}

Stock actual: ${product.stock}
Stock mínimo: ${product.minStock}
Estado: ${product.stock <= product.minStock ? 'BAJO' : product.stock <= product.minStock * 2 ? 'NORMAL' : 'BUENO'}

Precio: ${UI.formatCurrency(product.price)}

Fecha de creación: ${UI.formatDate(product.createdAt)}
Última actualización: ${UI.formatDate(product.updatedAt)}
        `);
    },

    /**
     * Editar producto
     */
    editProduct(productId) {
        this.showProductModal(productId);
    },

    /**
     * Eliminar producto
     */
    deleteProduct(productId) {
        const product = DataManager.getProductById(productId);
        if (!product) return;

        if (!confirm(`¿Está seguro de eliminar el producto "${product.name}"?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }

        DataManager.deleteProduct(productId);
        UI.showAlert('success', 'Producto eliminado correctamente');
        this.renderTable();
        
        // Actualizar dashboard si está visible
        if (AppState.currentView === 'dashboard') {
            Dashboard.render();
        }
    }
};

// ===================================
// MÓDULO: MOVIMIENTOS
// ===================================

const Movements = {
    /**
     * Renderiza la vista de movimientos
     */
    render() {
        this.attachEventListeners();
        this.renderTable();
    },

    /**
     * Adjunta eventos específicos de movimientos
     */
    attachEventListeners() {
        // Botones agregar movimiento
        document.getElementById('addEntryBtn').onclick = () => this.showMovementModal('entrada');
        document.getElementById('addExitBtn').onclick = () => this.showMovementModal('salida');

        // Filtros
        document.getElementById('filterMovementType').onchange = () => this.renderTable();
        document.getElementById('filterDateFrom').onchange = () => this.renderTable();
        document.getElementById('filterDateTo').onchange = () => this.renderTable();
        document.getElementById('clearFiltersBtn').onclick = () => this.clearFilters();

        // Guardar movimiento
        document.getElementById('saveMovementBtn').onclick = () => this.saveMovement();

        // Cambio de producto para mostrar stock actual
        document.getElementById('movementProduct').onchange = (e) => {
            const productId = e.target.value;
            const product = DataManager.getProductById(productId);
            const stockDisplay = document.getElementById('currentStockDisplay');
            
            if (product) {
                stockDisplay.textContent = product.stock;
                stockDisplay.className = product.stock <= product.minStock ? 'text-danger fw-bold' : 'text-success fw-bold';
            } else {
                stockDisplay.textContent = '-';
                stockDisplay.className = '';
            }
        };
    },

    /**
     * Renderiza la tabla de movimientos
     */
    renderTable() {
        let movements = DataManager.getMovements();

        // Aplicar filtros
        const filterType = document.getElementById('filterMovementType').value;
        const filterDateFrom = document.getElementById('filterDateFrom').value;
        const filterDateTo = document.getElementById('filterDateTo').value;

        if (filterType) {
            movements = movements.filter(m => m.type === filterType);
        }

        if (filterDateFrom) {
            const dateFrom = new Date(filterDateFrom);
            movements = movements.filter(m => new Date(m.date) >= dateFrom);
        }

        if (filterDateTo) {
            const dateTo = new Date(filterDateTo);
            dateTo.setHours(23, 59, 59);
            movements = movements.filter(m => new Date(m.date) <= dateTo);
        }

        const tbody = document.getElementById('movementsTable');

        if (movements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No se encontraron movimientos</td></tr>';
            return;
        }

        tbody.innerHTML = movements.map(movement => {
            const product = DataManager.getProductById(movement.productId);
            const typeClass = movement.type === 'entrada' ? 'success' : 'danger';
            const typeIcon = movement.type === 'entrada' ? 'arrow-down-circle' : 'arrow-up-circle';

            return `
                <tr>
                    <td><code>${movement.id.substr(0, 8)}</code></td>
                    <td>${UI.formatDate(movement.date)}</td>
                    <td>${product ? product.name : '<em class="text-muted">Producto eliminado</em>'}</td>
                    <td>
                        <span class="badge bg-${typeClass}">
                            <i class="bi bi-${typeIcon} me-1"></i>${movement.type}
                        </span>
                    </td>
                    <td><strong>${movement.quantity}</strong></td>
                    <td>${movement.reason}</td>
                    <td>${movement.userName}</td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Limpia los filtros
     */
    clearFilters() {
        document.getElementById('filterMovementType').value = '';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        this.renderTable();
    },

    /**
     * Muestra el modal de movimiento
     */
    showMovementModal(type) {
        const modal = AppState.modals.movement;
        const form = document.getElementById('movementForm');
        const title = document.getElementById('movementModalTitle');

        form.reset();

        // Configurar según tipo
        document.getElementById('movementType').value = type;
        title.textContent = type === 'entrada' ? 'Nueva Entrada' : 'Nueva Salida';

        // Actualizar razones según tipo
        this.updateReasonSelect(type);

        // Llenar productos
        this.updateProductSelect();

        // Resetear display de stock
        document.getElementById('currentStockDisplay').textContent = '-';

        modal.show();
    },

    /**
     * Actualiza el select de productos
     */
    updateProductSelect() {
        const select = document.getElementById('movementProduct');
        const products = DataManager.getProducts();

        select.innerHTML = '<option value="">Seleccione un producto</option>' +
            products.map(p => `<option value="${p.id}">${p.name} - Stock: ${p.stock}</option>`).join('');
    },

    /**
     * Actualiza el select de razones según el tipo
     */
    updateReasonSelect(type) {
        const select = document.getElementById('movementReason');
        const reasons = CONFIG.MOVEMENT_REASONS[type];

        select.innerHTML = '<option value="">Seleccione un motivo</option>' +
            reasons.map(r => `<option value="${r}">${r}</option>`).join('');
    },

    /**
     * Guarda un movimiento
     */
    saveMovement() {
        const form = document.getElementById('movementForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const movementData = {
            productId: document.getElementById('movementProduct').value,
            type: document.getElementById('movementType').value,
            quantity: parseInt(document.getElementById('movementQuantity').value),
            reason: document.getElementById('movementReason').value,
            notes: document.getElementById('movementNotes').value.trim()
        };

        // Validar stock suficiente en salidas
        if (movementData.type === 'salida') {
            const product = DataManager.getProductById(movementData.productId);
            if (product.stock < movementData.quantity) {
                UI.showAlert('danger', `Stock insuficiente. Disponible: ${product.stock}`);
                return;
            }
        }

        const result = DataManager.addMovement(movementData);

        if (result) {
            UI.showAlert('success', 'Movimiento registrado correctamente');
            AppState.modals.movement.hide();
            this.renderTable();
            
            // Actualizar otras vistas si están visibles
            if (AppState.currentView === 'dashboard') {
                Dashboard.render();
            } else if (AppState.currentView === 'products') {
                Products.renderTable();
            }
        } else {
            UI.showAlert('danger', 'Error al registrar el movimiento');
        }
    }
};

// ===================================
// MÓDULO: CATEGORÍAS
// ===================================

const Categories = {
    /**
     * Renderiza la vista de categorías
     */
    render() {
        this.attachEventListeners();
        this.renderList();
    },

    /**
     * Adjunta eventos específicos de categorías
     */
    attachEventListeners() {
        // Botón agregar categoría
        document.getElementById('addCategoryBtn').onclick = () => this.showCategoryModal();

        // Guardar categoría
        document.getElementById('saveCategoryBtn').onclick = () => this.saveCategory();
    },

    /**
     * Renderiza la lista de categorías
     */
    renderList() {
        const categories = DataManager.getCategories();
        const container = document.getElementById('categoriesList');

        if (categories.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-4">No hay categorías creadas</div>';
            return;
        }

        container.innerHTML = categories.map(category => {
            const productsCount = DataManager.getProducts().filter(p => p.category === category.id).length;

            return `
                <div class="list-group-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${category.name}</h5>
                            <p class="mb-1 text-muted">${category.description || 'Sin descripción'}</p>
                            <small class="text-muted">
                                <i class="bi bi-box-seam me-1"></i>${productsCount} producto(s)
                            </small>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-warning" onclick="Categories.editCategory('${category.id}')" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="Categories.deleteCategory('${category.id}')" title="Eliminar" ${productsCount > 0 ? 'disabled' : ''}>
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Muestra el modal de categoría
     */
    showCategoryModal(categoryId = null) {
        const modal = AppState.modals.category;
        const form = document.getElementById('categoryForm');
        const title = document.getElementById('categoryModalTitle');

        form.reset();

        if (categoryId) {
            // Editar categoría
            const category = DataManager.getCategoryById(categoryId);
            if (!category) return;

            title.textContent = 'Editar Categoría';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description;
        } else {
            // Nueva categoría
            title.textContent = 'Nueva Categoría';
            document.getElementById('categoryId').value = '';
        }

        modal.show();
    },

    /**
     * Guarda una categoría (crear o editar)
     */
    saveCategory() {
        const form = document.getElementById('categoryForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const categoryId = document.getElementById('categoryId').value;
        const categoryData = {
            name: document.getElementById('categoryName').value.trim(),
            description: document.getElementById('categoryDescription').value.trim()
        };

        if (categoryId) {
            // Actualizar
            DataManager.updateCategory(categoryId, categoryData);
            UI.showAlert('success', 'Categoría actualizada correctamente');
        } else {
            // Crear
            DataManager.addCategory(categoryData);
            UI.showAlert('success', 'Categoría creada correctamente');
        }

        AppState.modals.category.hide();
        this.renderList();
        
        // Actualizar selects de categorías en otras vistas
        Products.updateCategoryFilter();
        Products.updateCategorySelect();
    },

    /**
     * Editar categoría
     */
    editCategory(categoryId) {
        this.showCategoryModal(categoryId);
    },

    /**
     * Eliminar categoría
     */
    deleteCategory(categoryId) {
        const category = DataManager.getCategoryById(categoryId);
        if (!category) return;

        const productsCount = DataManager.getProducts().filter(p => p.category === categoryId).length;

        if (productsCount > 0) {
            UI.showAlert('warning', 'No se puede eliminar una categoría que tiene productos asociados');
            return;
        }

        if (!confirm(`¿Está seguro de eliminar la categoría "${category.name}"?`)) {
            return;
        }

        DataManager.deleteCategory(categoryId);
        UI.showAlert('success', 'Categoría eliminada correctamente');
        this.renderList();
        
        // Actualizar selects de categorías
        Products.updateCategoryFilter();
        Products.updateCategorySelect();
    }
};

// ===================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar gestión de datos
    DataManager.init();
    
    // Inicializar interfaz
    UI.init();
    
    console.log('✓ Sistema de Inventario inicializado correctamente');
});
