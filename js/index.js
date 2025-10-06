import { logout } from './auth.js';
import { navigateTo, validateToken, initRouter } from './router.js';
import { setupLogin } from './login.js';
import { setupProfile } from './profile.js';

document.addEventListener("DOMContentLoaded", () => {
    setupLogin();
    setupProfile();
    
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

    initRouter();
});