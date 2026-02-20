# Live Setup Guide: Keys & Database

Project ko "Live" chalane ke liye aur **Real AI + Real Database** use karne ke liye, aapko 3 cheezon ki zaroorat hai.

Ye steps follow karein:

## 1. MongoDB Database (Zaroori Hai)
Kyunki aapne local MongoDB install nahi kiya hai, hum **MongoDB Atlas (Cloud)** use karenge. Ye free hai aur best solution hai.

1.  [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) par account banayein (Google se login karein).
2.  Create a **new project** (Name: TrendPulse).
3.  Click **Build a Database** -> Select **FREE (Shared)** -> Click **Create**.
4.  **Security Setup**:
    *   **Username/Password**: Ek user banayein (e.g., `admin` / `password123`). **Password yaad rakhein!**
    *   **IP Access**: "Allow Access from Anywhere" (0.0.0.0/0) select karein taaki kahin se bhi connect ho sake.
5.  **Get Connection String**:
    *   "Connect" button dabayein.
    *   "Drivers" select karein.
    *   String copy karein: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
    *   `<password>` ki jagah apna password daalein.

## 2. OpenAI API Key (AI ke liye)
1.  [OpenAI Platform](https://platform.openai.com/signup) par login karein.
2.  Menu mein **API Keys** par jayein.
3.  "Create new secret key" click karein.
4.  Key copy karein (Ye `sk-...` se shuru hogi).
    *   *Note: Free trial khatam ho gaya ho toh shayad $5 add karne padenge.*

## 3. NewsAPI Key (News fetch karne ke liye)
1.  [NewsAPI.org](https://newsapi.org/register) par register karein.
2.  Dashboard se apni **API Key** copy karein (Ye free hai).

---

## Kahan Daalein Ye Keys?

Apne project folder mein `server/.env` file kholein aur wahan ye values paste karein:

\`\`\`env
PORT=5000
# Apna MongoDB Atlas URL yahan dalein
MONGO_URI=mongodb+srv://admin:password123@cluster0.mongodb.net/trendpulse?retryWrites=true&w=majority

# Apni Keys yahan dalein
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
NEWS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

File save karein aur project restart karein (`npm start`). Ab aapka project **Real Database** aur **Real AI** use karega!
