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
            // Robust verification using clerkClient
            const request = new Request('https://api.clerk.dev', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const { isSignedIn, toAuth } = await clerkClient.authenticateRequest(request);
            
            if (!isSignedIn) {
                console.error('Clerk Auth Failed: Not signed in');
                return res.status(401).json({ message: 'Invalid or expired token.' });
            }

            const auth = toAuth();
            
            // Map Clerk ID to req.user
            req.user = {
                id: auth.userId,
                // Clerk doesn't always send email in session, but we need the ID for DB operations
            };
            
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
