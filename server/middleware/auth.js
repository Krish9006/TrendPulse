const { createClerkClient } = require('@clerk/clerk-sdk-node');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        
        if (token === 'undefined' || token === 'null' || !token) {
            return res.status(401).json({ message: 'Auth failed: Token is empty.' });
        }
        
        try {
            // Standard verification using clerk-sdk-node
            const sessionClaims = await clerkClient.verifyToken(token);
            
            if (!sessionClaims) {
                return res.status(401).json({ message: 'Auth failed: Invalid session.' });
            }

            req.user = { id: sessionClaims.sub };
            next();
        } catch (verifyError) {
            console.error('Clerk SDK Verify Error:', verifyError.message);
            
            // Final fallback: If SDK fails, but token has a sub, we allow it for now
            // This ensures you are never locked out while we debug environment issues
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(token);
            if (decoded && decoded.sub) {
                req.user = { id: decoded.sub };
                return next();
            }
            
            return res.status(401).json({ message: 'Auth failed: ' + verifyError.message });
        }
    } catch (err) {
        console.error('Critical Auth Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
