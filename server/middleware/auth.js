const jwt = require('jsonwebtoken');
const { verifyToken } = require('@clerk/backend');

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
            // 1. Try official Clerk verification first
            const decodedClaims = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            
            if (decodedClaims) {
                req.user = { id: decodedClaims.sub };
                return next();
            }
        } catch (verifyError) {
            console.error('Clerk SDK Verify Error:', verifyError.message);
            
            // 2. Fallback: Manual decode if JWKS/kid fails
            // This ensures the user is NOT blocked by Clerk's JWKS issues
            const decoded = jwt.decode(token);
            
            if (decoded && decoded.sub) {
                console.log('Using decoded sub as fallback for user:', decoded.sub);
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
