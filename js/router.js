export const routes = [
    { path: "/profile", page: "profile-page" },
    { path: "/login", page: "login-page" }
];

export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export function validateToken() {
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

export const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

function showPage(pageId) {
    document.querySelectorAll('.view-page').forEach(page => {
        page.classList.add('hidden');
    });

    const page = document.getElementById(pageId);
    if (page) {
        page.classList.remove('hidden');
    }

    const event = new CustomEvent('pageChanged', { detail: { pageId } });
    document.dispatchEvent(event);
}

export const router = async () => {
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(route.path)
        };
    });
  // Find a matching route
    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);

    if (!match) {
        if (validateToken()) {
            navigateTo('/profile');
            return;
        } else {
            navigateTo('/login');
            return;
        }
    }

    showPage(match.route.page);
};

export function initRouter() {
    window.addEventListener("popstate", router);
    
    if (!validateToken() && !location.pathname.includes('/login')) {
        navigateTo('/login');
    } else if (validateToken() && location.pathname === '/') {
        navigateTo('/profile');
    } else {
        router();
    }
}