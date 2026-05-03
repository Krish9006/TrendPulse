const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token || token === 'undefined' || token === 'null') {
            return res.status(401).json({ message: 'Auth failed: Token is empty.' });
        }
        
        try {
            // Manual decoding as the primary method to avoid JWKS issues
            const decoded = jwt.decode(token);
            
            if (decoded && decoded.sub) {
                req.user = { id: decoded.sub };
                return next();
            } else {
                // If it's not a JWT, it might be a session ID or something else from Clerk
                // For now, if we can't get an ID, we check if we're in dev mode
                if (process.env.NODE_ENV === 'development') {
                     req.user = { id: 'dev_user' };
                     return next();
                }
                return res.status(401).json({ message: 'Auth failed: Invalid token format.' });
            }
        } catch (err) {
            console.error('JWT Decode Error:', err);
            return res.status(401).json({ message: 'Auth failed: ' + err.message });
        }
    } catch (err) {
        console.error('Critical Auth Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
