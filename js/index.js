import { logout } from "./auth.js";
import { createStudentObject } from "./student.js";

//ROUTES ARRAY
const routes = [
    { path: "/profile", page: "profile-page" },
    { path: "/login", page: "login-page" },
    { path: "/skills", page: "skills-page" },
    { path: "/xp", page: "xp-page" },
    { path: "/projects", page: "projects-page" }
];

// Convert a path to a regular expression
const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function validateToken() {
    const token = getCookie('token');
    if (!token) {
        return false;
    }
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        return !isExpired;
    } catch (e) {
        console.error("Invalid token format", e);
        return false;
    }
}

// Navigate to a new URL and call the router
export const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

// Show specific page and hide others
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.view-page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show the requested page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.remove('hidden');
    }
    
    // Load data if it's the profile page
    if (pageId === 'profile-page') {
        loadProfileData();
    }
}

// Router function to handle navigation
const router = async () => {
    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });

    // Find a matching route
    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    // If no match is found, default to profile if authenticated, otherwise login
    if (!match) {
        if (validateToken()) {
            match = {    
                route: routes[0], // Profile
                result: ['/profile']
            };
        } else {
            match = {    
                route: routes[1], // Login
                result: ['/login']
            };
        }
    }

    // Show the appropriate page
    showPage(match.route.page);
};

// Load profile data from localStorage
function loadProfileData() {
    const studentData = JSON.parse(localStorage.getItem('student'));
    
    if (!studentData) {
        logout();
        return;
    }

    // Update all profile fields
    document.getElementById('user-name').textContent = studentData.name || studentData.login;
    document.getElementById('user-email').textContent = studentData.email;
    document.getElementById('user-login').textContent = studentData.login;
    document.getElementById('user-cohort').textContent = studentData.cohort;
    document.getElementById('user-fullname').textContent = studentData.name || 'N/A';
    document.getElementById('total-xp').textContent = studentData.totalXp ? studentData.totalXp.toLocaleString() : 0;
    document.getElementById('audit-ratio').textContent = studentData.auditRatio || 0;
    document.getElementById('projects-count').textContent = studentData.projects ? studentData.projects.length : 0;
    // REMOVE THIS LINE: document.getElementById('skills-count').textContent = studentData.skills ? studentData.skills.length : 0;

    // Render charts
    renderCharts(studentData);
}

// Render SVG charts
function renderCharts(studentData) {
    createXPProgressChart(studentData);
    createSkillsChart(studentData);
}

// XP Progress chart
function createXPProgressChart(studentData) {
    const container = document.getElementById('xpProgressChart');
    if (!container) return;

    const projects = studentData.projects || [];
    
    // Sort projects by date
    const sortedProjects = [...projects].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    
    let cumulativeXP = 0;
    const data = sortedProjects.map(project => {
        cumulativeXP += project.xp;
        return {
            name: project.name,
            xp: project.xp,
            cumulativeXP: cumulativeXP,
            date: project.endDate
        };
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "250");
    svg.classList.add("graph-svg");

    if (data.length > 0) {
        const maxXP = Math.max(...data.map(d => d.cumulativeXP));
        const padding = 40;
        const chartWidth = 400 - (2 * padding);
        const chartHeight = 180 - (2 * padding);

        // Create X and Y axes
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxis.setAttribute("x1", padding.toString());
        xAxis.setAttribute("y1", (chartHeight + padding).toString());
        xAxis.setAttribute("x2", (chartWidth + padding).toString());
        xAxis.setAttribute("y2", (chartHeight + padding).toString());
        xAxis.setAttribute("stroke", "#ccc");
        xAxis.setAttribute("stroke-width", "1");
        svg.appendChild(xAxis);

        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxis.setAttribute("x1", padding.toString());
        yAxis.setAttribute("y1", padding.toString());
        yAxis.setAttribute("x2", padding.toString());
        yAxis.setAttribute("y2", (chartHeight + padding).toString());
        yAxis.setAttribute("stroke", "#ccc");
        yAxis.setAttribute("stroke-width", "1");
        svg.appendChild(yAxis);

        // Create line points
        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - (d.cumulativeXP / maxXP) * chartHeight;
            return `${x},${y}`;
        }).join(" ");

        const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        polyline.setAttribute("points", points);
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", "#667eea");
        polyline.setAttribute("stroke-width", "3");
        polyline.setAttribute("stroke-linejoin", "round");
        polyline.setAttribute("stroke-linecap", "round");
        svg.appendChild(polyline);

        // Add points with tooltips (keep tooltips for hover info)
        data.forEach((d, i) => {
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - (d.cumulativeXP / maxXP) * chartHeight;
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", "4");
            circle.setAttribute("fill", "#764ba2");
            circle.setAttribute("class", "graph-point");
            
            // Keep tooltip for hover information
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `${d.name}\nXP: ${d.xp}\nCumulative: ${d.cumulativeXP}\nDate: ${d.date}`;
            circle.appendChild(title);
            
            svg.appendChild(circle);
        });

        // Keep Y-axis labels for context
        const yLabel1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yLabel1.setAttribute("x", padding - 5);
        yLabel1.setAttribute("y", padding);
        yLabel1.setAttribute("text-anchor", "end");
        yLabel1.setAttribute("font-size", "10");
        yLabel1.setAttribute("fill", "#666");
        yLabel1.textContent = maxXP.toLocaleString();
        svg.appendChild(yLabel1);

        const yLabel2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
        yLabel2.setAttribute("x", padding - 5);
        yLabel2.setAttribute("y", chartHeight + padding);
        yLabel2.setAttribute("text-anchor", "end");
        yLabel2.setAttribute("font-size", "10");
        yLabel2.setAttribute("fill", "#666");
        yLabel2.textContent = "0";
        svg.appendChild(yLabel2);

    } else {
        const noDataText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        noDataText.setAttribute("x", "50%");
        noDataText.setAttribute("y", "50%");
        noDataText.setAttribute("text-anchor", "middle");
        noDataText.setAttribute("fill", "#666");
        noDataText.textContent = "No project data available";
        svg.appendChild(noDataText);
    }

    container.innerHTML = '';
    container.appendChild(svg);
}

function createSkillsChart(studentData) {
    const container = document.getElementById('skillsChart');
    if (!container) return;

    const skills = studentData.skills || [];
    
    // Filter out skills with very low progress and get top skills
    const topSkills = skills
        .filter(skill => skill.progress > 0)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 6);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "250");
    svg.classList.add("graph-svg");

    if (topSkills.length > 0) {
        const maxProgress = Math.max(...topSkills.map(s => s.progress));
        const barWidth = 280;
        const barHeight = 20;
        const spacing = 30;
        const startY = 40;

        // Add chart title
        const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
        title.setAttribute("x", "20");
        title.setAttribute("y", "20");
        title.setAttribute("font-size", "12");
        title.setAttribute("font-weight", "bold");
        title.setAttribute("fill", "#333");
        title.textContent = "Skill Progress";
        svg.appendChild(title);

        topSkills.forEach((skill, index) => {
            const y = startY + index * spacing;
            const progressWidth = (skill.progress / maxProgress) * barWidth;

            // Background bar
            const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            bgRect.setAttribute("x", "20");
            bgRect.setAttribute("y", y);
            bgRect.setAttribute("width", barWidth.toString());
            bgRect.setAttribute("height", barHeight.toString());
            bgRect.setAttribute("fill", "#f8f9fa");
            bgRect.setAttribute("rx", "10");
            bgRect.setAttribute("stroke", "#e9ecef");
            bgRect.setAttribute("stroke-width", "1");
            svg.appendChild(bgRect);

            // Progress bar
            const progressRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            progressRect.setAttribute("x", "20");
            progressRect.setAttribute("y", y);
            progressRect.setAttribute("width", progressWidth.toString());
            progressRect.setAttribute("height", barHeight.toString());
            progressRect.setAttribute("fill", "#667eea");
            progressRect.setAttribute("rx", "10");
            svg.appendChild(progressRect);

            // Skill name
            const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            nameText.setAttribute("x", "25");
            nameText.setAttribute("y", y + 14);
            nameText.setAttribute("font-size", "11");
            nameText.setAttribute("font-weight", "bold");
            nameText.setAttribute("fill", "white");
            
            let displayName = skill.skillName;
            if (displayName.length > 20) {
                displayName = displayName.substring(0, 18) + '...';
            }
            nameText.textContent = displayName;
            svg.appendChild(nameText);

            // Progress value inside bar (if there's space) - KEEP THIS
            if (progressWidth > 50) {
                const valueText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                valueText.setAttribute("x", (20 + progressWidth - 25).toString());
                valueText.setAttribute("y", y + 14);
                valueText.setAttribute("font-size", "10");
                valueText.setAttribute("font-weight", "bold");
                valueText.setAttribute("fill", "white");
                valueText.setAttribute("text-anchor", "end");
                valueText.textContent = skill.progress;
                svg.appendChild(valueText);
            }
        });
    } else {
        const noDataText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        noDataText.setAttribute("x", "50%");
        noDataText.setAttribute("y", "50%");
        noDataText.setAttribute("text-anchor", "middle");
        noDataText.setAttribute("fill", "#666");
        noDataText.textContent = "No skills data available";
        svg.appendChild(noDataText);
    }

    container.innerHTML = '';
    container.appendChild(svg);
}

// Login functionality
function setupLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }
}

async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.querySelector(".form__message--error");

    if (!username || !password) {
        errorMessage.textContent = "Please enter both username and password";
        errorMessage.style.display = 'block';
        return;
    }

    const loginDataEncoded = btoa(`${username}:${password}`);
    const loginEndpoint = "https://learn.reboot01.com/api/auth/signin";

    try {
        const response = await fetch(loginEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${loginDataEncoded}`
            },
        });

        if (response.ok) {
            const token = await response.json();
            document.cookie = `token=${token}; path=/; SameSite=Lax; Secure`;
            
            const student = await createStudentObject(token);
            if (student) {
                localStorage.setItem('student', JSON.stringify(student));
                navigateTo('/profile');
            } else {
                errorMessage.textContent = "Failed to load student data";
                errorMessage.style.display = 'block';
            }
        } else {
            errorMessage.textContent = "Invalid login credentials";
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error("Login error:", error);
        errorMessage.textContent = "Error logging in. Please try again.";
        errorMessage.style.display = 'block';
    }
}

// Event listener for navigation links
document.addEventListener("DOMContentLoaded", () => {
    setupLogin();
    
    document.body.addEventListener("click", async (e) => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            if (validateToken() || e.target.href.includes("/login")) {
                await navigateTo(e.target.href);
            } else {
                navigateTo("/login");
            }
        } else if (e.target.matches("[data-logout]")) {
            e.preventDefault();
            await logout();
        }
    });

    // Initial router call
    if (!validateToken() && !location.pathname.includes('/login')) {
        navigateTo('/login');
    } else {
        router();
    }
});

// Listen for popstate events to handle back/forward navigation
window.addEventListener("popstate", router);
