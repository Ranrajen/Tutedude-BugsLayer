document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addMaterialsBtn = document.getElementById('addMaterialsBtn');
    const materialsModal = document.getElementById('materialsModal');
    const confirmMaterials = document.getElementById('confirmMaterials');
    const cancelMaterials = document.getElementById('cancelMaterials');
    const materialsList = document.getElementById('materialsList');
    const materialsCart = document.getElementById('materialsCart');
    const noMaterialsMessage = document.getElementById('noMaterialsMessage');
    
    // Sample materials data
    const materialsData = [
        { id: 1, name: 'Wheat Flour', category: 'grains', icon: 'fa-wheat-alt' },
        { id: 2, name: 'Rice', category: 'grains', icon: 'fa-utensils' },
        { id: 3, name: 'Milk', category: 'dairy', icon: 'fa-wine-bottle' },
        { id: 4, name: 'Cheese', category: 'dairy', icon: 'fa-cheese' },
        { id: 5, name: 'Tomatoes', category: 'vegetables', icon: 'fa-apple-alt' },
        { id: 6, name: 'Onions', category: 'vegetables', icon: 'fa-carrot' },
        { id: 7, name: 'Chili Powder', category: 'spices', icon: 'fa-pepper-hot' },
        { id: 8, name: 'Turmeric', category: 'spices', icon: 'fa-mortar-pestle' },
        { id: 9, name: 'Chicken', category: 'meat', icon: 'fa-drumstick-bite' },
        { id: 10, name: 'Eggs', category: 'meat', icon: 'fa-egg' }
    ];
    
    // Selected materials
    let selectedMaterials = [];
    
    // Initialize materials list
    function initMaterials() {
        materialsList.innerHTML = '';
        materialsData.forEach(material => {
            const materialItem = document.createElement('div');
            materialItem.className = 'material-item cursor-pointer';
            materialItem.innerHTML = `
                <div class="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <input type="checkbox" id="material-${material.id}" value="${material.id}" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                    <label for="material-${material.id}" class="ml-3 block text-sm font-medium text-gray-700">
                        <i class="fas ${material.icon} mr-2 text-${material.category}-600"></i>
                        ${material.name}
                    </label>
                </div>
            `;
            materialsList.appendChild(materialItem);
            
            // Check if material is already selected
            if (selectedMaterials.includes(material.id)) {
                materialItem.querySelector('input').checked = true;
            }
        });
    }
    
    // Render materials cart
    function renderMaterialsCart() {
        if (selectedMaterials.length === 0) {
            noMaterialsMessage.classList.remove('hidden');
            materialsCart.innerHTML = '';
            materialsCart.appendChild(noMaterialsMessage);
            return;
        }
        
        noMaterialsMessage.classList.add('hidden');
        materialsCart.innerHTML = '';
        
        selectedMaterials.forEach(materialId => {
            const material = materialsData.find(m => m.id === materialId);
            if (material) {
                const materialCard = document.createElement('div');
                materialCard.className = 'bg-white p-3 rounded-lg shadow-sm border border-gray-100 text-center';
                materialCard.innerHTML = `
                    <div class="w-12 h-12 ${getMaterialBgClass(material.category)} rounded-full flex items-center justify-center mx-auto mb-2">
                        <i class="fas ${material.icon} text-lg ${getMaterialTextClass(material.category)}"></i>
                    </div>
                    <h3 class="text-sm font-medium">${material.name}</h3>
                    <button class="remove-material mt-2 text-xs text-red-500 hover:text-red-700" data-id="${material.id}">
                        <i class="fas fa-times mr-1"></i> Remove
                    </button>
                `;
                materialsCart.appendChild(materialCard);
            }
        });
    }
    
    // Helper functions for material classes
    function getMaterialBgClass(category) {
        const classes = {
            grains: 'bg-amber-100',
            dairy: 'bg-blue-100',
            vegetables: 'bg-green-100',
            spices: 'bg-red-100',
            meat: 'bg-rose-100'
        };
        return classes[category] || 'bg-gray-100';
    }
    
    function getMaterialTextClass(category) {
        const classes = {
            grains: 'text-amber-600',
            dairy: 'text-blue-600',
            vegetables: 'text-green-600',
            spices: 'text-red-600',
            meat: 'text-rose-600'
        };
        return classes[category] || 'text-gray-600';
    }
    
    // Event Listeners
    if (addMaterialsBtn) {
        addMaterialsBtn.addEventListener('click', () => {
            materialsModal.classList.remove('hidden');
            initMaterials();
        });
    }
    
    if (cancelMaterials) {
        cancelMaterials.addEventListener('click', () => {
            materialsModal.classList.add('hidden');
        });
    }
    
    if (confirmMaterials) {
        confirmMaterials.addEventListener('click', () => {
            // Get selected materials
            selectedMaterials = [];
            document.querySelectorAll('#materialsList input:checked').forEach(checkbox => {
                selectedMaterials.push(parseInt(checkbox.value));
            });
            
            // Save to localStorage (simulated)
            localStorage.setItem('vendorMaterials', JSON.stringify(selectedMaterials));
            
            // Update cart
            renderMaterialsCart();
            
            // Close modal
            materialsModal.classList.add('hidden');
        });
    }
    
    // Remove material from cart
    materialsCart.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-material') || e.target.closest('.remove-material')) {
            const materialId = parseInt(e.target.dataset.id || e.target.closest('.remove-material').dataset.id);
            selectedMaterials = selectedMaterials.filter(id => id !== materialId);
            localStorage.setItem('vendorMaterials', JSON.stringify(selectedMaterials));
            renderMaterialsCart();
        }
    });
    
    // Load saved materials
    const savedMaterials = localStorage.getItem('vendorMaterials');
    if (savedMaterials) {
        selectedMaterials = JSON.parse(savedMaterials);
        renderMaterialsCart();
    } else {
        // Default materials for demo
        selectedMaterials = [1, 3, 5, 7]; // Wheat, Milk, Tomatoes, Chili Powder
        renderMaterialsCart();
    }
    
    // Sample dashboard data
    const dashboardData = {
        activeGroups: 3,
        totalSavings: '₹12,450',
        activeOrders: 5,
        suppliersCount: 8
    };
    
    // Update dashboard stats
    document.getElementById('activeGroups').textContent = dashboardData.activeGroups;
    document.getElementById('totalSavings').textContent = dashboardData.totalSavings;
    document.getElementById('activeOrders').textContent = dashboardData.activeOrders;
    document.getElementById('suppliersCount').textContent = dashboardData.suppliersCount;
});