const { createClerkClient } = require('@clerk/backend');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            // Verify the token with Clerk
            const decoded = await clerkClient.verifyToken(token);
            
            if (!decoded) {
                return res.status(401).json({ message: 'Invalid token.' });
            }

            // Map Clerk claims to req.user for app compatibility
            req.user = {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name || 'User'
            };
            
            next();
        } catch (verifyError) {
            console.error('Clerk Auth Error:', verifyError.message);
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
    } catch (err) {
        console.error('Auth Middleware Exception:', err);
        res.status(500).json({ message: 'Internal Auth Error' });
    }
};
