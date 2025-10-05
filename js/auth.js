import { navigateTo } from "./index.js"

export async function logout() {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='))
    if (!tokenCookie) {
        console.error("No token found in cookies")
        return
    }

    const token = tokenCookie.split('=')[1]
    try {
        await fetch("https://learn.reboot01.com/api/auth/expire", {
            method: "GET",
            headers: {
                "x-jwt-token": `${token}`
            }
        })
        const response = await fetch("https://learn.reboot01.com/api/auth/signout", {
            method: "POST",
            headers: {
                "x-jwt-token": `${token}`
            }
        })
        if (!response.ok) {
            console.error("Failed to log out:", await response.json())
            return
        }
        // Clear cookies and storage
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        localStorage.clear()
        sessionStorage.clear()

        // Navigate to welcome page
        history.replaceState(null, null, "/welcome")
        navigateTo('/welcome')
    } catch (error) {
        console.error("Error during logout:", error)
    }
}