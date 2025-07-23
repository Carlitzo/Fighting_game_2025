export async function registerUser(username, password) {
    const response = await fetch("/register", 
        {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({username: username, password: password})
        }
    );

    const result = await response.json();
    return result;
}