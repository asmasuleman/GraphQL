import { logout } from './auth.js';
import { renderCharts } from './charts.js';

export function setupProfile() {
    document.addEventListener('pageChanged', (e) => {
        if (e.detail.pageId === 'profile-page') {
            loadProfileData();
        }
    });
}

function loadProfileData() {
    const studentData = JSON.parse(localStorage.getItem('student'));
    
    if (!studentData) {
        logout();
        return;
    }

    document.getElementById('user-name').textContent = studentData.name || studentData.login;
    document.getElementById('user-email').textContent = studentData.email;
    document.getElementById('user-login').textContent = studentData.login;
    document.getElementById('user-cohort').textContent = studentData.cohort;
    document.getElementById('user-fullname').textContent = studentData.name || 'N/A';
    document.getElementById('total-xp').textContent = studentData.totalXp ? studentData.totalXp.toLocaleString() : 0;
    document.getElementById('audit-ratio').textContent = studentData.auditRatio || 0;
    document.getElementById('projects-count').textContent = studentData.projects ? studentData.projects.length : 0;

    renderCharts(studentData);
}