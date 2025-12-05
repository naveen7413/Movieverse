# 📽️ Movieverse — MERN Movie Recommendation App

Movieverse is a full-stack MERN application that delivers AI-powered movie recommendations using user preferences, categories, and trending content.  
Designed with a Netflix-style interface, it provides a smooth, responsive, and interactive movie browsing experience.

---

## 🚀 Features

### 🎬 Frontend (React + Vite)
- Modern Netflix-like UI  
- Fully responsive layout  
- AI-powered movie recommendations  
- Movie detail popups  
- Category-based filtering  
- Secure login & register  
- Framer-motion animations  
- Dark/Light mode  
- Global state management (Context API)

---

### 🛠️ Backend (Node.js + Express.js)
- JWT-based secure authentication  
- User login & registration  
- Movie CRUD API  
- Recommendation API  
- Mongoose models (Users & Movies)  
- Clean folder-structured backend  

---

### 🗄️ Database (MongoDB)
- Hosted on MongoDB Atlas  
- Collections:
  - users  
  - movies  
  - recommendations  

---

## 📁 Project Structure

```
Movieverse/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── styles/
│   └── index.html
│
└── README.md
```

---

## 🧩 Tech Stack

### Frontend
- React  
- Vite  
- React Router  
- Framer Motion  
- Context API  
- CSS  

### Backend
- Node.js  
- Express.js  
- JWT  
- Bcrypt  
- Mongoose  

### Database
- MongoDB (Atlas)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```sh
git clone https://github.com/naveen7413/Movieverse.git
cd Movieverse
```

---

### 2️⃣ Backend Setup

```sh
cd backend
npm install
npm start
```

Create a `.env` file:

```
MONGO_URI=your_mongo_connection_uri
JWT_SECRET=your_secret_key
PORT=5000
```

---

### 3️⃣ Frontend Setup

```sh
cd ../frontend
npm install
npm run dev
```

Frontend will start on:  
👉 http://localhost:5173

---

## 🔐 Environment Variables

### Backend `.env`

```
MONGO_URI=
JWT_SECRET=
PORT=5000
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:5000
VITE_OPENAI_KEY=your_api_key
```

---

## 🧪 API Endpoints

### Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login user |

### Movie Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/movies/ | Get all movies |
| POST | /api/movies/add | Add new movie |
| PUT | /api/movies/:id | Update movie |
| DELETE | /api/movies/:id | Delete movie |

### AI Recommendation Route

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/recommend | Get AI-generated movie recommendations |

---

## 📦 Building for Production

### Frontend:

```sh
npm run build
```

### Backend:

```sh
npm start
```

---

## 📌 Future Improvements

- Watchlist feature  
- User viewing history  
- Movie rating system  
- Trending movies page  
- Social sharing  
- Multi-language support  

---

## 👨‍💻 Author

**Naveen Kumar**  
MERN Full-Stack Developer  
GitHub: https://github.com/naveen7413  

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!

