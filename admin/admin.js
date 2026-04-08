console.log('[admin.js] File loaded. window.supabase type:', typeof window.supabase);
const SUPABASE_URL = 'https://dxtjoohcoioansnjrxkd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dGpvb2hjb2lvYW5zbmpyeGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDIyNzUsImV4cCI6MjA5MTE3ODI3NX0.C6j2QWJX1-XsS7pdW--uxosNUyAspdhmWWvsr-qCUQA';

let supabaseClient;
try {
    const sb = window.supabase;
    if (sb && typeof sb.createClient === 'function') {
        supabaseClient = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else if (sb && typeof sb === 'function') {
        supabaseClient = sb(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.error('[admin.js] window.supabase is not available or createClient not found. Keys:', sb ? Object.keys(sb) : 'undefined');
    }
    console.log('[admin.js] Supabase client initialized:', !!supabaseClient);
} catch (err) {
    console.error('[admin.js] Failed to initialize Supabase:', err);
}

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const globalLoader = document.getElementById('global-loader');
const globalLoaderText = document.getElementById('global-loader-text');

// ----- Auth Management -----

async function checkUser() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    loginScreen.classList.add('flex');
    dashboardScreen.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    loginScreen.classList.remove('flex');
    dashboardScreen.classList.remove('hidden');
    fetchProjects();
    fetchSiteContent();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    
    loginError.classList.add('hidden');
    showLoader('Logging in...');

    setTimeout(() => {
        hideLoader();
        if (password === 'admin1234!') {
            localStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
        } else {
            loginError.textContent = '잘못된 비밀번호입니다.';
            loginError.classList.remove('hidden');
        }
    }, 500);
});

logoutBtn.addEventListener('click', () => {
    showLoader('Logging out...');
    setTimeout(() => {
        localStorage.removeItem('adminLoggedIn');
        hideLoader();
        showLogin();
    }, 300);
});


// ----- Tabs Management -----

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    const activeBtn = tabId === 'projects-tab' ? 'btn-projects-tab' : 'btn-content-tab';
    const btnEl = document.getElementById(activeBtn);
    btnEl.classList.remove('border-transparent', 'text-gray-500');
    btnEl.classList.add('border-blue-500', 'text-blue-600');
}

// ----- Projects Management -----

const projectList = document.getElementById('project-list');
let projectsData = [];

async function fetchProjects() {
    if (!supabaseClient) { projectList.innerHTML = '<li class="p-4 text-red-500 text-center">Supabase not initialized</li>'; return; }
    projectList.innerHTML = '<li class="p-4 text-gray-500 text-center">Loading...</li>';
    const { data, error } = await supabaseClient
        .from('portfolio_projects')
        .select('*')
        .order('project_order', { ascending: true });
        
    if (error) {
        projectList.innerHTML = `<li class="p-4 text-red-500 text-center">Error loading projects: ${error.message}</li>`;
        return;
    }

    projectsData = data;
    renderProjects();
}

function renderProjects() {
    if (projectsData.length === 0) {
        projectList.innerHTML = '<li class="p-4 text-gray-500 text-center">No projects found.</li>';
        return;
    }

    projectList.innerHTML = '';
    projectsData.forEach(proj => {
        const li = document.createElement('li');
        li.className = 'p-4 hover:bg-gray-50 flex items-center justify-between';
        
        let thumbStr = proj.image_url ? `<img src="${proj.image_url}" class="h-12 w-16 object-cover rounded mr-4">` : `<div class="h-12 w-16 bg-gray-200 rounded mr-4 flex items-center justify-center text-xs text-gray-400">No Img</div>`;

        li.innerHTML = `
            <div class="flex items-center flex-1">
                ${thumbStr}
                <div>
                    <h3 class="text-lg font-medium text-blue-600 truncate">${proj.title}</h3>
                    <p class="text-sm text-gray-500 truncate mt-1">${proj.category} | Order: ${proj.project_order}</p>
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="editProject('${proj.id}')" class="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">Edit</button>
                <button onclick="deleteProject('${proj.id}')" class="text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded">Delete</button>
            </div>
        `;
        projectList.appendChild(li);
    });
}

// Modal handling
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');

window.openProjectModal = function() {
    projectForm.reset();
    document.getElementById('proj-id').value = '';
    document.getElementById('proj-image-url').value = '';
    document.getElementById('modal-title').textContent = 'Add New Project';
    projectModal.classList.remove('hidden');
    projectModal.classList.add('flex');
}

window.closeProjectModal = function() {
    projectModal.classList.add('hidden');
    projectModal.classList.remove('flex');
}

window.editProject = function(id) {
    const proj = projectsData.find(p => p.id === id);
    if (!proj) return;
    
    projectForm.reset(); // Add this line to clear the file input field!
    
    document.getElementById('proj-id').value = proj.id;
    document.getElementById('proj-title').value = proj.title;
    document.getElementById('proj-category').value = proj.category;
    document.getElementById('proj-desc').value = proj.description;
    document.getElementById('proj-link').value = proj.link_url || '';
    document.getElementById('proj-order').value = proj.project_order;
    document.getElementById('proj-image-url').value = proj.image_url || '';
    
    document.getElementById('modal-title').textContent = 'Edit Project';
    projectModal.classList.remove('hidden');
    projectModal.classList.add('flex');
}

window.deleteProject = async function(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    if (!supabaseClient) return;
    
    showLoader('Deleting...');
    const { error } = await supabaseClient.from('portfolio_projects').delete().eq('id', id);
    hideLoader();

    if (error) alert('Error: ' + error.message);
    else fetchProjects();
}

projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabaseClient) { alert('Supabase not initialized'); return; }
    
    const id = document.getElementById('proj-id').value;
    const title = document.getElementById('proj-title').value;
    const category = document.getElementById('proj-category').value;
    const description = document.getElementById('proj-desc').value;
    const link_url = document.getElementById('proj-link').value;
    const project_order = parseInt(document.getElementById('proj-order').value) || 0;
    const imageFile = document.getElementById('proj-image-file').files[0];
    let image_url = document.getElementById('proj-image-url').value;

    showLoader('Saving project...');

    // Upload image if selected
    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
            .from('portfolio-assets')
            .upload(filePath, imageFile);

        if (uploadError) {
            hideLoader();
            alert('Image upload failed: ' + uploadError.message);
            return;
        }

        const { data: publicUrlData } = supabaseClient.storage
            .from('portfolio-assets')
            .getPublicUrl(filePath);
            
        image_url = publicUrlData.publicUrl;
    }

    const payload = { title, category, description, link_url, project_order, image_url };

    let error;
    if (id) {
        // Update
        const res = await supabaseClient.from('portfolio_projects').update(payload).eq('id', id);
        error = res.error;
    } else {
        // Insert
        const res = await supabaseClient.from('portfolio_projects').insert([payload]);
        error = res.error;
    }

    hideLoader();

    if (error) {
        alert('Error saving project: ' + error.message);
    } else {
        closeProjectModal();
        fetchProjects();
    }
});


// ----- Site Content Management -----

const contentFields = document.getElementById('content-fields');
const contentForm = document.getElementById('content-form');

async function fetchSiteContent() {
    if (!supabaseClient) { contentFields.innerHTML = '<p class="text-red-500">Supabase not initialized</p>'; return; }
    contentFields.innerHTML = '<p class="text-gray-500">Loading...</p>';
    const { data, error } = await supabaseClient.from('site_content').select('*').order('section_key');
    
    if (error) {
        contentFields.innerHTML = `<p class="text-red-500">Error: ${error.message}</p>`;
        return;
    }

    if(data.length === 0) {
        contentFields.innerHTML = '<p class="text-gray-500">No content found. Please run the SQL initialization script.</p>';
        return;
    }

    // Ensure about_photo exists in the form even if it's not in DB yet
    if (!data.find(d => d.section_key === 'about_photo')) {
        data.push({ section_key: 'about_photo', content: '' });
    }

    contentFields.innerHTML = '';
    data.forEach(item => {
        const wrapper = document.createElement('div');
        
        if (item.section_key === 'about_photo') {
            wrapper.innerHTML = `
                <label class="block text-sm font-bold text-gray-700 mb-1">about_photo (Vision Section Photo)</label>
                <div class="flex flex-col space-y-2">
                    ${item.content ? `<img src="${item.content}" class="h-32 w-auto object-contain bg-gray-100 rounded">` : `<div class="h-16 w-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>`}
                    <input type="file" id="about-photo-file-input" class="w-full border p-2 rounded" accept="image/*">
                    <input type="hidden" data-key="${item.section_key}" value="${item.content || ''}" id="about-photo-content-val" class="content-input">
                    <p class="text-xs text-gray-500">Select a new image to replace the current one.</p>
                </div>
            `;
        } else {
            const isLong = item.content.length > 50 || item.content.includes('<br>');
            wrapper.innerHTML = `
                <label class="block text-sm font-bold text-gray-700 mb-1">${item.section_key}</label>
                ${isLong 
                    ? `<textarea data-key="${item.section_key}" class="w-full border p-2 rounded h-24 content-input">${item.content}</textarea>`
                    : `<input type="text" data-key="${item.section_key}" value="${item.content.replace(/"/g, '&quot;')}" class="w-full border p-2 rounded content-input">`
                }
            `;
        }
        contentFields.appendChild(wrapper);
    });
}

contentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!supabaseClient) { alert('Supabase not initialized'); return; }
    showLoader('Saving content...');
    
    // Check for about_photo upload first
    const aboutPhotoFileEl = document.getElementById('about-photo-file-input');
    if (aboutPhotoFileEl && aboutPhotoFileEl.files.length > 0) {
        const file = aboutPhotoFileEl.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `about_photo_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabaseClient.storage.from('portfolio-assets').upload(fileName, file);
        if (!uploadError) {
            const { data: pubData } = supabaseClient.storage.from('portfolio-assets').getPublicUrl(fileName);
            document.getElementById('about-photo-content-val').value = pubData.publicUrl;
        } else {
            console.error('about_photo upload failed:', uploadError);
            alert('Failed to upload about_photo. Continuing with save...');
        }
    }

    const inputs = document.querySelectorAll('.content-input');
    const updates = Array.from(inputs).map(input => ({
        section_key: input.getAttribute('data-key'),
        content: input.value
    }));

    // Perform upserts using loop
    let hasError = false;
    for (const update of updates) {
        const { error } = await supabaseClient.from('site_content').upsert(update);
        if (error) {
            hasError = true;
            console.error(error);
        }
    }

    hideLoader();
    if (hasError) {
        alert('Some content failed to save. Check console.');
    } else {
        alert('Content saved successfully! Reload the main website to see changes.');
        fetchSiteContent();
    }
});


// ----- Utilities -----

function showLoader(text = 'Processing...') {
    globalLoaderText.textContent = text;
    globalLoader.classList.remove('hidden');
}

function hideLoader() {
    globalLoader.classList.add('hidden');
}

// Init
checkUser();
