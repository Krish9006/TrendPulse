const { createClerkClient } = require('@clerk/backend');

const clerkClient = createClerkClient({ 
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided. Please log in.' });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            // Robust verification using authenticateRequest
            const request = new Request(req.protocol + '://' + req.get('host') + req.originalUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const { isSignedIn, toAuth } = await clerkClient.authenticateRequest(request);
            
            if (!isSignedIn) {
                return res.status(401).json({ message: 'Auth failed: Session not active.' });
            }

            const auth = toAuth();
            req.user = { id: auth.userId };
            
            next();
        } catch (verifyError) {
            console.error('Clerk Auth Error:', verifyError.message);
            return res.status(401).json({ message: 'Auth failed: ' + verifyError.message });
        }
    } catch (err) {
        console.error('Critical Auth Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
