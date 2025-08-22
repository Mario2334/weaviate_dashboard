// Global variables
let currentAction = null;
let currentActionData = null;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkConnection();
    loadSchema();
    loadClasses();
});

// Connection management
async function checkConnection() {
    try {
        const response = await fetch('/api/health');
        const result = await response.json();
        
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        
        if (result.connected) {
            indicator.className = 'status-indicator connected';
            text.textContent = 'Connected';
        } else {
            indicator.className = 'status-indicator disconnected';
            text.textContent = 'Disconnected';
        }
    } catch (error) {
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        indicator.className = 'status-indicator error';
        text.textContent = 'Error';
    }
}

// Tab management
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'schema') {
        loadSchema();
    } else if (tabName === 'classes') {
        loadClasses();
    }
}

// Schema management
async function loadSchema() {
    const container = document.getElementById('schema-container');
    container.innerHTML = '<div class="loading">Loading schema...</div>';
    
    try {
        const response = await fetch('/api/schema');
        const result = await response.json();
        
        if (result.success && result.data.classes) {
            displaySchema(result.data.classes);
            populateClassSelect(result.data.classes);
        } else {
            container.innerHTML = '<div class="error">Failed to load schema</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="error">Error loading schema: ' + error.message + '</div>';
    }
}

function displaySchema(classes) {
    const container = document.getElementById('schema-container');
    
    if (classes.length === 0) {
        container.innerHTML = '<div class="empty-state">No classes found in schema</div>';
        return;
    }
    
    let html = '<div class="schema-classes">';
    
    classes.forEach(classInfo => {
        const propertyCount = classInfo.properties ? classInfo.properties.length : 0;
        
        html += `
            <div class="class-card">
                <div class="class-header">
                    <h3><i class="fas fa-layer-group"></i> ${classInfo.class}</h3>
                    <div class="class-actions">
                        <button class="btn btn-sm btn-secondary" onclick="viewClassDetails('${classInfo.class}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteClass('${classInfo.class}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
                <div class="class-info">
                    <p><strong>Properties:</strong> ${propertyCount}</p>
                    <p><strong>Vectorizer:</strong> ${classInfo.vectorizer || 'none'}</p>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function populateClassSelect(classes) {
    const select = document.getElementById('class-select');
    select.innerHTML = '<option value="">Select a class...</option>';
    
    classes.forEach(classInfo => {
        const option = document.createElement('option');
        option.value = classInfo.class;
        option.textContent = classInfo.class;
        select.appendChild(option);
    });
}

async function viewClassDetails(className) {
    showModal('Class Details: ' + className, 'Loading class details...');
    
    try {
        const response = await fetch('/api/schema');
        const result = await response.json();
        
        if (result.success && result.data.classes) {
            const classInfo = result.data.classes.find(c => c.class === className);
            if (classInfo) {
                displayClassDetails(classInfo);
            }
        }
    } catch (error) {
        document.getElementById('modal-message').innerHTML = 'Error loading class details: ' + error.message;
    }
}

function displayClassDetails(classInfo) {
    let html = `<div class="class-details">`;
    html += `<p><strong>Class Name:</strong> ${classInfo.class}</p>`;
    html += `<p><strong>Vectorizer:</strong> ${classInfo.vectorizer || 'none'}</p>`;
    
    if (classInfo.properties && classInfo.properties.length > 0) {
        html += '<h4>Properties:</h4><ul>';
        classInfo.properties.forEach(prop => {
            html += `<li><strong>${prop.name}</strong> (${prop.dataType.join(', ')})</li>`;
        });
        html += '</ul>';
    }
    
    html += '</div>';
    document.getElementById('modal-message').innerHTML = html;
}

async function deleteClass(className) {
    currentAction = 'deleteClass';
    currentActionData = className;
    showModal(
        'Delete Class',
        `Are you sure you want to delete the class "${className}"? This action cannot be undone and will delete all objects in this class.`
    );
}

// Object browsing
async function loadObjects() {
    const className = document.getElementById('class-select').value;
    const limit = document.getElementById('limit-input').value;
    const container = document.getElementById('objects-container');
    
    if (!className) {
        container.innerHTML = '<div class="placeholder">Please select a class first</div>';
        return;
    }
    
    container.innerHTML = '<div class="loading">Loading objects...</div>';
    
    try {
        const response = await fetch(`/api/objects/${className}?limit=${limit}`);
        const result = await response.json();
        
        if (result.success && result.data.objects) {
            displayObjects(result.data.objects, className);
        } else {
            container.innerHTML = '<div class="error">Failed to load objects</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="error">Error loading objects: ' + error.message + '</div>';
    }
}

function displayObjects(objects, className) {
    const container = document.getElementById('objects-container');
    
    if (objects.length === 0) {
        container.innerHTML = `<div class="empty-state">No objects found in class "${className}"</div>`;
        return;
    }
    
    let html = '<div class="objects-list">';
    
    objects.forEach(obj => {
        const id = obj.id;
        const properties = obj.properties || {};
        
        html += `
            <div class="object-card">
                <div class="object-header">
                    <h4><i class="fas fa-cube"></i> Object</h4>
                    <button class="btn btn-sm btn-danger" onclick="deleteObject('${className}', '${id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
                <div class="object-info">
                    <p><strong>ID:</strong> <code>${id}</code></p>
                    <div class="object-properties">
                        <h5>Properties:</h5>
                        <pre>${JSON.stringify(properties, null, 2)}</pre>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

async function deleteObject(className, objectId) {
    currentAction = 'deleteObject';
    currentActionData = { className, objectId };
    showModal(
        'Delete Object',
        `Are you sure you want to delete this object? This action cannot be undone.`
    );
}

// Class management
async function loadClasses() {
    const container = document.getElementById('classes-container');
    container.innerHTML = '<div class="loading">Loading classes...</div>';
    
    try {
        const response = await fetch('/api/schema');
        const result = await response.json();
        
        if (result.success && result.data.classes) {
            displayClasses(result.data.classes);
        } else {
            container.innerHTML = '<div class="error">Failed to load classes</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="error">Error loading classes: ' + error.message + '</div>';
    }
}

function displayClasses(classes) {
    const container = document.getElementById('classes-container');
    
    if (classes.length === 0) {
        container.innerHTML = '<div class="empty-state">No classes found</div>';
        return;
    }
    
    let html = '<div class="classes-grid">';
    
    classes.forEach(classInfo => {
        const propertyCount = classInfo.properties ? classInfo.properties.length : 0;
        
        html += `
            <div class="class-management-card">
                <div class="class-name">
                    <i class="fas fa-layer-group"></i>
                    <h3>${classInfo.class}</h3>
                </div>
                <div class="class-stats">
                    <div class="stat">
                        <span class="stat-label">Properties</span>
                        <span class="stat-value">${propertyCount}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Vectorizer</span>
                        <span class="stat-value">${classInfo.vectorizer || 'none'}</span>
                    </div>
                </div>
                <div class="class-actions-full">
                    <button class="btn btn-primary" onclick="viewClassDetails('${classInfo.class}')">
                        <i class="fas fa-eye"></i> Details
                    </button>
                    <button class="btn btn-danger" onclick="deleteClass('${classInfo.class}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function showDeleteAllModal() {
    currentAction = 'deleteAllClasses';
    currentActionData = null;
    showModal(
        'Delete All Classes',
        'Are you sure you want to delete ALL classes from the schema? This will permanently delete all data and cannot be undone.'
    );
}

// Modal management
function showModal(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').innerHTML = message;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    currentAction = null;
    currentActionData = null;
}

async function confirmAction() {
    showLoading();
    
    try {
        if (currentAction === 'deleteClass') {
            await performDeleteClass(currentActionData);
        } else if (currentAction === 'deleteObject') {
            await performDeleteObject(currentActionData.className, currentActionData.objectId);
        } else if (currentAction === 'deleteAllClasses') {
            await performDeleteAllClasses();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
    
    hideLoading();
    closeModal();
}

async function performDeleteClass(className) {
    const response = await fetch(`/api/schema/${className}`, { method: 'DELETE' });
    const result = await response.json();
    
    if (result.success) {
        alert(`Class "${className}" deleted successfully`);
        loadSchema();
        loadClasses();
    } else {
        throw new Error(result.error || 'Failed to delete class');
    }
}

async function performDeleteObject(className, objectId) {
    const response = await fetch(`/api/objects/${className}/${objectId}`, { method: 'DELETE' });
    const result = await response.json();
    
    if (result.success) {
        alert('Object deleted successfully');
        loadObjects();
    } else {
        throw new Error(result.error || 'Failed to delete object');
    }
}

async function performDeleteAllClasses() {
    const response = await fetch('/api/schema/delete-all', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    const result = await response.json();
    
    if (result.success) {
        alert(`All classes deleted successfully. Deleted ${result.total_deleted} classes.`);
    } else {
        alert(`Partially successful. Deleted ${result.total_deleted} classes, ${result.total_errors} errors.`);
    }
    
    loadSchema();
    loadClasses();
}

// Utility functions
function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

async function exportSchema() {
    try {
        const response = await fetch('/api/schema');
        const result = await response.json();
        
        if (result.success) {
            const dataStr = JSON.stringify(result.data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = 'weaviate-schema.json';
            link.click();
        }
    } catch (error) {
        alert('Error exporting schema: ' + error.message);
    }
}
