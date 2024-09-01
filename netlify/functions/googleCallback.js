const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    const code = event.queryStringParameters.code;

    // Exchange the authorization code for tokens
    const tokens = await getTokens(code);
    
    // Decode the ID token to extract user information
    const userInfo = decodeIdToken(tokens.id_token);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Google callback handled successfully',
            user: userInfo
        }),
    };
};

async function getTokens(code) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code: code,
            client_id: 'YOUR_CLIENT_ID',
            client_secret: 'YOUR_CLIENT_SECRET',
            redirect_uri: 'https://molloycybersec1.netlify.app/.netlify/functions/googleCallback',
            grant_type: 'authorization_code'
        })
    });

    return response.json();
}

function decodeIdToken(idToken) {
    const decoded = jwt.decode(idToken);
    return decoded;
}
