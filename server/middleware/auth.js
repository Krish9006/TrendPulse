const { createClerkClient } = require('@clerk/backend');

const clerkClient = createClerkClient({ 
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            // Use verifyToken directly for maximum compatibility
            const decoded = await clerkClient.verifyToken(token);
            
            if (!decoded) {
                console.error('Clerk Verify: Decoded token is null');
                return res.status(401).json({ message: 'Auth failed: Invalid token.' });
            }

            req.user = { id: decoded.sub };
            next();
        } catch (verifyError) {
            console.error('Clerk Verify Error:', verifyError.message);
            
            // If verification fails, try a fallback check or provide a clearer error
            return res.status(401).json({ message: 'Auth failed: ' + verifyError.message });
        }
    } catch (err) {
        console.error('Critical Auth Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
