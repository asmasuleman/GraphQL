import { navigateTo } from './router.js';
import { createStudentObject } from './student.js';

export function setupLogin() {
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