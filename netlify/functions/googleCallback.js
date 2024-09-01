exports.handler = async (event, context) => {
    // Extract the authorization code from the query parameters
    const code = event.queryStringParameters.code;

    if (!code) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Authorization code not found.' }),
        };
    }

    try {
        // Exchange the authorization code for tokens
        const tokens = await getTokens(code);

        // Decode the ID token to extract user information
        const userInfo = decodeIdToken(tokens.id_token);

        // Return the user information in the response
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Google callback handled successfully',
                user: userInfo,
            }),
        };
    } catch (error) {
        console.error('Error handling the Google callback:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to handle Google callback.' }),
        };
    }
};

async function getTokens(code) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code: code,
            client_id: client_secret_,
            client_secret: client_secret_,
            redirect_uri: 'https://molloycybersec1.netlify.app/.netlify/functions/googleCallback',
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to exchange authorization code for tokens');
    }

    return response.json();
}

function decodeIdToken(idToken) {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
}
