document.addEventListener('DOMContentLoaded', () => {
    const createGroupBtn = document.getElementById('createGroupBtn');
    const createGroupModal = document.getElementById('createGroupModal');
    const cancelCreateGroup = document.getElementById('cancelCreateGroup');
    const confirmCreateGroup = document.getElementById('confirmCreateGroup');
    const newGroupForm = document.getElementById('newGroupForm');
    const groupSearch = document.getElementById('groupSearch');
    const groupsGrid = document.getElementById('groupsGrid');
    const groupNameInput = document.getElementById('groupName');
    const groupNamePreview = document.getElementById('groupNamePreview');
    const token = localStorage.getItem('token');
    let allGroups = [];

    // Demo members for demo groups
    const demoMembers = [
        { name: "Amit Sharma", email: "amit@gmail.com" },
        { name: "Priya Singh", email: "priya@gmail.com" },
        { name: "Ravi Kumar", email: "ravi@gmail.com" },
        { name: "Neha Patel", email: "neha@gmail.com" },
        { name: "Vikas Joshi", email: "vikas@gmail.com" },
        { name: "Sonal Mehta", email: "sonal@gmail.com" },
        { name: "Rahul Jain", email: "rahul@gmail.com" },
        { name: "Anjali Verma", email: "anjali@gmail.com" },
        { name: "Deepak Rao", email: "deepak@gmail.com" },
        { name: "Meena Gupta", email: "meena@gmail.com" }
    ];

    // 5 Demo Groups (these are only shown if backend is empty)
    const demoGroups = [
        {
            _id: 'demo1',
            name: 'Sarthak MandiWaala',
            category: 'vegetables',
            description: 'Collaborative group for purchasing fresh fruits and vegetables at wholesale prices.',
            status: 'Active',
            members: demoMembers.slice(0, 8),
            maxMembers: 9
        },
        {
            _id: 'demo2',
            name: 'Aute Bakery',
            category: 'grains',
            description: 'Group for bulk purchasing of flour, sugar, and other baking essentials.',
            status: 'Negotiating',
            members: demoMembers.slice(0, 5),
            maxMembers: 8
        },
        {
            _id: 'demo3',
            name: 'Chetan Dhoodh Dairy',
            category: 'dairy',
            description: 'Bulk buying of milk, cheese, and other dairy products.',
            status: 'Active',
            members: demoMembers.slice(0, 9),
            maxMembers: 10
        },
        {
            _id: 'demo4',
            name: 'Nidhi Spice-Traders',
            category: 'spices',
            description: 'Join to get the best rates on spices and condiments.',
            status: 'Forming',
            members: demoMembers.slice(0, 7),
            maxMembers: 10
        },
        {
            _id: 'demo5',
            name: 'Bhushan Chicken Waala',
            category: 'meat',
            description: 'For restaurants and caterers to buy meat and poultry in bulk.',
            status: 'Active',
            members: demoMembers.slice(0, 6),
            maxMembers: 8
        }
    ];

    // For demo groups, track joined state in localStorage
    function isDemoGroupJoined(id) {
        const joined = JSON.parse(localStorage.getItem('joinedDemoGroups') || '[]');
        return joined.includes(id);
    }
    function joinDemoGroup(id) {
        let joined = JSON.parse(localStorage.getItem('joinedDemoGroups') || '[]');
        if (!joined.includes(id)) joined.push(id);
        localStorage.setItem('joinedDemoGroups', JSON.stringify(joined));
    }
    function leaveDemoGroup(id) {
        let joined = JSON.parse(localStorage.getItem('joinedDemoGroups') || '[]');
        joined = joined.filter(gid => gid !== id);
        localStorage.setItem('joinedDemoGroups', JSON.stringify(joined));
    }

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Live preview for group name
    if (groupNameInput && groupNamePreview) {
        groupNameInput.addEventListener('input', function() {
            groupNamePreview.textContent = groupNameInput.value ? `Preview: ${groupNameInput.value}` : '';
        });
    }

    // Modal controls
    if (createGroupBtn) createGroupBtn.addEventListener('click', openModal);
    if (cancelCreateGroup) cancelCreateGroup.addEventListener('click', closeModal);
    if (confirmCreateGroup) confirmCreateGroup.addEventListener('click', createNewGroup);

    window.addEventListener('click', (e) => {
        if (e.target === createGroupModal) closeModal();
    });

    // Search
    if (groupSearch) {
        groupSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allGroups.filter(group =>
                group.name.toLowerCase().includes(searchTerm) ||
                (group.description && group.description.toLowerCase().includes(searchTerm)) ||
                (group.category && group.category.toLowerCase().includes(searchTerm))
            );
            renderGroups(filtered);
        });
    }

    // Fetch and render groups
    async function fetchGroups() {
        // Get backend groups
        let backendGroups = [];
        try {
            const res = await fetch('http://localhost:5000/api/groups', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            backendGroups = await res.json();
        } catch {
            backendGroups = [];
        }
        // If backend is empty, show demo groups
        if (!backendGroups.length) {
            allGroups = demoGroups.map(g => {
                let members = [...g.members];
                if (isDemoGroupJoined(g._id) && !members.some(m => m._id === 'me')) {
                    members.push({ name: 'You', email: 'you@example.com', _id: 'me' });
                }
                return { ...g, members };
            });
        } else {
            allGroups = backendGroups;
        }
        renderGroups(allGroups);
    }

    // Render groups with member list and join/leave
    function renderGroups(groups) {
        groupsGrid.innerHTML = '';
        if (!groups.length) {
            groupsGrid.innerHTML = `<div class="col-span-3 text-center py-10 text-gray-400">
                <i class="fas fa-users-slash text-4xl mb-3"></i>
                <p>No groups found.</p>
            </div>`;
            return;
        }
        groups.forEach(group => {
            let isMember, members;
            const memberCount = group.members.length;
            const maxMembers = group.maxMembers || 10;
            if (group._id.startsWith('demo')) {
                isMember = isDemoGroupJoined(group._id);
                members = [...group.members];
                if (isMember && !members.some(m => m._id === 'me')) {
                    members.push({ name: 'You', email: 'you@example.com', _id: 'me' });
                }
            } else {
                isMember = group.members.some(m => m._id === getUserIdFromToken(token));
                members = group.members;
            }
            groupsGrid.innerHTML += `
                <div class="group-card bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer" data-id="${group._id}">
                    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-lg">${group.name}</h3>
                            <span class="text-xs bg-white text-blue-600 px-2 py-1 rounded-full">${group.status || 'Active'}</span>
                        </div>
                        <p class="text-sm text-blue-100 mt-1">${memberCount}/${maxMembers} vendors</p>
                    </div>
                    <div class="p-6">
                        <p class="text-gray-600 mb-4">${group.description || ''}</p>
                        <div class="mb-2">
                            <span class="font-semibold text-gray-700 text-sm">Members:</span>
                            <ul class="ml-2 mt-1 text-xs text-gray-600">
                                ${members.slice(0, 3).map(m => `<li>• ${m.name} (${m.email || ''})</li>`).join('')}
                                ${memberCount > 3 ? `<li>...and ${memberCount - 3} more</li>` : ''}
                            </ul>
                        </div>
                        <div class="flex items-center justify-between mt-4">
                            <button class="join-leave-btn px-3 py-1 ${isMember ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white text-sm rounded-lg transition" data-id="${group._id}">
                                ${isMember ? 'Leave' : 'Join'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        // Add event listeners for join/leave buttons
        document.querySelectorAll('.join-leave-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.stopPropagation();
                const groupId = this.getAttribute('data-id');
                if (groupId.startsWith('demo')) {
                    if (isDemoGroupJoined(groupId)) {
                        leaveDemoGroup(groupId);
                    } else {
                        joinDemoGroup(groupId);
                    }
                    fetchGroups();
                } else {
                    if (this.textContent === 'Join') {
                        await fetch(`http://localhost:5000/api/groups/${groupId}/join`, {
                            method: 'POST',
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                    } else {
                        await fetch(`http://localhost:5000/api/groups/${groupId}/leave`, {
                            method: 'POST',
                            headers: { 'Authorization': 'Bearer ' + token }
                        });
                    }
                    fetchGroups();
                }
            });
        });
    }

    // Group Members Modal logic
    const membersModal = document.getElementById('membersModal');
    const modalGroupName = document.getElementById('modalGroupName');
    const modalMembersList = document.getElementById('modalMembersList');
    const closeMembersModal = document.getElementById('closeMembersModal');

    function showMembersModal(group) {
        modalGroupName.textContent = group.name + " Members";
        modalMembersList.innerHTML = group.members.map(m => `<li class="mb-1">• ${m.name} (${m.email || ''})</li>`).join('');
        membersModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    if (closeMembersModal) {
        closeMembersModal.addEventListener('click', () => {
            membersModal.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }

    groupsGrid.addEventListener('click', function(e) {
        const card = e.target.closest('.group-card');
        if (card && card.dataset.id) {
            const group = allGroups.find(g => g._id === card.dataset.id);
            if (group) showMembersModal(group);
        }
    });

    //create teh group     
    function createNewGroup() {
        const groupName = document.getElementById('groupName').value;
        const groupCategory = document.getElementById('groupCategory').value;
        const groupDescription = document.getElementById('groupDescription').value;
        
        if (!groupName || !groupCategory) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create new group
        const newGroup = {
            id: groups.length + 1,
            name: groupName,
            category: groupCategory,
            members: 1,
            status: 'Forming',
            savings: '₹0',
            description: groupDescription || 'No description provided',
            created: 'Just now'
        };
        
        groups.unshift(newGroup);
        renderGroups();
        
        // Close modal and reset form
        closeCreateGroupModal();
        
        // Show success message
        alert(`Group "${groupName}" created successfully! Start inviting other vendors.`);
    }

    // Create new group
    async function createNewGroup() {
        const groupName = document.getElementById('groupName').value;
        const groupCategory = document.getElementById('groupCategory').value;
        const groupDescription = document.getElementById('groupDescription').value;
        if (!groupName || !groupCategory) {
            alert('Please fill in all required fields');
            return;
        }
       
        
    }

    function openModal() {
        createGroupModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        createGroupModal.classList.add('hidden');
        document.body.style.overflow = '';
        if (newGroupForm) newGroupForm.reset();
        if (groupNamePreview) groupNamePreview.textContent = '';
    }

    // Helper to decode userId from JWT
    function getUserIdFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch {
            return null;
        }
    }

    // Initial fetch
    fetchGroups();
});