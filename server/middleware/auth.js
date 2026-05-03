const { verifyToken } = require('@clerk/backend');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        
        // Basic check to see if token is "undefined" string
        if (token === 'undefined' || token === 'null' || !token) {
            return res.status(401).json({ message: 'Auth failed: Token is undefined or null.' });
        }
        
        try {
            // Verify with secretKey and explicitly provide authorizedParties if needed
            const decoded = await verifyToken(token, {
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            
            if (!decoded) {
                return res.status(401).json({ message: 'Auth failed: Invalid token payload.' });
            }

            req.user = { id: decoded.sub };
            next();
        } catch (verifyError) {
            console.error('Clerk Verify Error:', verifyError.message);
            // Fallback: If verification fails, return a clean error
            return res.status(401).json({ message: 'Auth failed: ' + verifyError.message });
        }
    } catch (err) {
        console.error('Critical Auth Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
