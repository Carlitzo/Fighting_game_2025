export async function loginUser(username, password) {
    const response = await fetch("/login",
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        }
    );

    const result = await response.json();
    
    return result;
}