// src/services/api.js

export const loginUser = async (username, password) => {
    const response = await fetch('http://localhost:3002/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
};

export const registerUser = async (username, email, password) => {
    console.log('Sending registration request:', { username, email });
    const response = await fetch('http://localhost:3002/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
};

export const translateMessage = async (text, targetLang) => {
    const response = await fetch(`http://localhost:3002/translate?text=${text}&target_lang=${targetLang}`);
    if (!response.ok) {
        throw new Error('Translation failed');
    }
    const data = await response.json();
    return data.translatedText;
};