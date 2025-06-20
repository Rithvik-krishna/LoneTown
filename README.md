# 💖 Lone Town — Mindful Matchmaking Platform

**Lone Town** is a next-gen dating platform that promotes intentional connections through deep compatibility, emotional awareness, and state-driven matchmaking. It eliminates swipe fatigue by offering one meaningful match at a time — with powerful real-time chat, milestone tracking, and freeze-based reflection phases.

---

## 🌟 Features

### ✅ Core Functionalities
- **One Match per Day** — no parallel conversations
- **Real-Time Chat** powered by Socket.io
- **100 Message Milestone Unlocks** 🎥 video call option
- **Pin/Unpin Match** — lock-in or exit with consequences
- **Freeze Periods** — intentional reflection phase after unpin
- **User State Engine** — manages `available`, `pinned`, `frozen`
- **Onboarding Flow** — collect traits like love language, attachment style, etc.
- **Match Feedback System** — rate your match post conversation

### 🧠 Future Plans
- Deep compatibility algorithm
- Intentionality analytics dashboard
- Daily match drops via cron or scheduler
- Video call implementation
- Admin dashboard for monitoring

---

## 🖥️ Tech Stack

| Layer       | Tech                      |
|------------|---------------------------|
| Frontend   | React.js + Tailwind CSS   |
| Backend    | Node.js + Express.js      |
| Real-Time  | Socket.io                 |
| Database   | MongoDB with Mongoose     |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/Rithvik-krishna/LoneTown.git
cd LoneTown
```

### 2. Setup Backend

```bash
cd lone-town-backend
npm install
# Create a `.env` file with your MongoDB URI
npm start
```

> `.env` file example:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 3. Setup Frontend

```bash
cd ../lone-town-frontend
npm install
npm run dev
```

> Ensure Vite is configured to proxy `/api` to your backend in `vite.config.js`:
```js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
};
```

---

## 🧪 Testing Scenarios

| Test | Description |
|------|-------------|
| ✅ Login Flow | Register two users via `/login` |
| ✅ Onboarding | Complete form with preferences |
| ✅ Match Allocation | Match users with fallback or `/find-match` |
| ✅ Chat | Message in real-time across browsers |
| ✅ Milestone Unlock | Test 100 messages → video call unlocked |
| ✅ Pin/Unpin Logic | Test button behavior & state changes |
| ✅ Freeze Timer | Unpin and verify 24h lockout with timer |
| ✅ Feedback | Submit match feedback after freeze/milestone |

---

## 🗂️ Folder Structure

```
LoneTown/
├── lone-town-backend/
│   ├── models/
│   ├── routes/
│   └── server.js
└── lone-town-frontend/
    ├── components/
    ├── pages/
    └── App.jsx
```

---

## 🧠 Author

**Rithvik Krishna**  
🌐 [GitHub](https://github.com/Rithvik-krishna)  
📫 [Email](mailto:rithvik.personal.dev@gmail.com)

---

## 🪪 License

This project is open-source and licensed under the MIT License.
