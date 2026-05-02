const mongoose = require('mongoose');
require('dotenv').config();

// User model definition if not importable
const userSchema = new mongoose.Schema({
    email: String,
    isVerified: Boolean
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function verify() {
    try {
        const MONGO_URI = "mongodb+srv://guptashanu341_db_user:f7cItaColmlNVEga@cluster0.wmrjofm.mongodb.net/trendpulse?retryWrites=true&w=majority";
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const email = "krishgupta80067@gmail.com";
        const result = await User.findOneAndUpdate(
            { email: { $regex: new RegExp(email, "i") } }, 
            { isVerified: true }, 
            { new: true }
        );

        if (result) {
            console.log(`✅ Success: ${result.email} is now verified!`);
        } else {
            console.log(`❌ Error: User with email ${email} not found in DB.`);
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

verify();
