export async function logout() {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (!tokenCookie) {
        console.error("No token found in cookies");
        return;
    }

    const token = tokenCookie.split('=')[1];
    try {
        const response = await fetch("https://learn.reboot01.com/api/auth/signout", {
            method: "POST",
            headers: {
                "x-jwt-token": `${token}`
            }
        });
        
        if (!response.ok) {
            console.error("Failed to log out:", await response.json());
            return;
        }
        
        // Clear storage
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.clear();
        
        const { navigateTo } = await import('./router.js');
        navigateTo('/login');
    } catch (error) {
        console.error("Error during logout:", error);
    }
}