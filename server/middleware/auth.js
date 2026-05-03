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
            const sessionClaims = await clerkClient.verifyToken(token);
            
            // Clerk 'sub' is the user ID. We'll map it to req.user.id for compatibility
            req.user = {
                id: sessionClaims.sub,
                email: sessionClaims.email,
                name: sessionClaims.name
            };
            
            next();
        } catch (verifyError) {
            console.error('Clerk Verification Error:', verifyError.message);
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Auth middleware error.' });
    }
};
