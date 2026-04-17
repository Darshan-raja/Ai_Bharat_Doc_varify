# BharatVerify — AI‑Driven Identity Proof Checker

A comprehensive **document verification** system that uses **AI/ML** to help detect forged identity documents and **extract information via OCR**.

<p align="center">
  <img width="1915" height="996" alt="BharatVerify Screenshot 1" src="https://github.com/user-attachments/assets/3a369fa7-a346-4c8b-b0db-15dd57d35aa5" />
</p>

<p align="center">
  <img width="1919" height="986" alt="BharatVerify Screenshot 2" src="https://github.com/user-attachments/assets/38f0cd7a-813d-424f-a454-a72e9e03cd75" />
</p>

## Demo (Videos)
- https://github.com/user-attachments/assets/e1cf3309-0339-4dd6-8ac0-82a7bfd3d45d  
- https://github.com/user-attachments/assets/792ec698-e7d2-451b-9875-b8261f45a96a  
- https://github.com/user-attachments/assets/87388d8a-2079-4fd7-b90e-e09fb90727bb  

---

## Key Features
- **User authentication** (register/login/logout)
- **Document upload & verification workflow**
- **Forgery detection (ML service)** *(optional / pluggable)*
- **OCR extraction (ML service / OCR API)** *(optional / pluggable)*
- **Admin endpoints** for dashboard access

---

## Tech Stack
- **Frontend:** React + TypeScript + Vite (Shadcn UI)
- **Backend:** Node.js + Express + MongoDB
- **ML Services:**
  - Forgery detection (deep learning)
  - OCR API

---

## Project Structure
```text
Ai_Bharat_Doc_varify/
├── frontend/                 # React + TypeScript frontend
├── backend/                  # Express.js backend API
├── ML/                       # Machine learning services
│   ├── forge_detection/
│   └── OCR_api/
├── DEPLOYMENT_CHECKLIST.md
└── README.md
```

---

## Prerequisites
- **Node.js** v16+
- **npm** (or bun for frontend if preferred)
- **MongoDB** (local or MongoDB Atlas)
- **Python** 3.8+ (only for ML services)
- **Git**

---

## Quick Start

### 1) Clone the Repository
```bash
git clone https://github.com/Darshan-raja/Ai_Bharat_Doc_varify.git
cd Ai_Bharat_Doc_varify
```

### 2) Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Start server
npm start
```

Backend runs at: `http://localhost:5000`

### 3) Frontend Setup
```bash
cd ../frontend
npm install

# Development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

To build for production:
```bash
npm run build
npm run preview
```

---

## ML Services (Optional)

> If you don’t need ML locally, you can skip this section and run only frontend + backend.

### A) Forge Detection Service
```bash
cd ML/forge_detection
pip install -r requirements.txt

# Example (FastAPI/Uvicorn)
uvicorn main:app --reload --port 8000
```

### B) OCR API Service
```bash
cd ML/OCR_api
pip install -r requirements.txt
python main.py
```

---

## Environment Variables (Backend)

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_secret_key_here

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

See `backend/.env.example` for the full list.

---

## API Endpoints

### Authentication
- `POST /api/users/register` — Register a new user
- `POST /api/users/login` — Login
- `POST /api/users/logout` — Logout

### Documents
- `GET /api/documents` — List all documents
- `POST /api/documents/upload` — Upload a document for verification
- `GET /api/documents/:id` — Get document details
- `PUT /api/documents/:id` — Update document
- `DELETE /api/documents/:id` — Delete document

### Admin
- `POST /api/admin/login` — Admin login
- `GET /api/admin/dashboard` — Admin dashboard data

---

## Security Notes (Production)
- Rotate `JWT_SECRET` and use a strong random value
- **Never commit** `.env` files
- Set `NODE_ENV=production` in deployment environments
- Restrict CORS to known origins
- Use HTTPS end-to-end
- Ensure MongoDB authentication & IP allowlists are configured (Atlas)

---

## Deployment

### Backend (Render / Railway)
1. Connect the GitHub repository
2. Configure environment variables in the dashboard
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend (Vercel)
1. Import the repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` env var to your backend URL

### Docker (Optional)
Add Dockerfiles for `frontend`, `backend`, and ML services and compose them with `docker-compose`.

---

## Troubleshooting

### Backend won’t start
- Verify MongoDB connection string (`MONGO_URI`)
- Confirm `JWT_SECRET` is set
- Check if port `5000` is already in use

### Frontend build fails
- Reinstall dependencies:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- Run:
  ```bash
  npm run lint
  ```

### API calls failing
- Verify backend is running and reachable
- Confirm CORS configuration in backend
- Check frontend environment config (e.g., `VITE_API_URL`)

---

## License
ISC License

<p align="center">
  <img width="1532" height="1031" alt="License / Reference Image 1" src="https://github.com/user-attachments/assets/d6186102-1e54-4578-a37f-3717c7d84164" />
</p>

<p align="center">
  <img width="1236" height="837" alt="License / Reference Image 2" src="https://github.com/user-attachments/assets/8fc3685e-753c-451d-bd71-6f66b5d0f9b7" />
</p>

---

## Contributors
- **Darshan Raja** — Backend, AI/ML (Team Lead)
- **Vinyak** — Frontend
- **Prajwal** — Backend
- **Divya** — UI/UX

---

## Support
For bugs, questions, or feature requests, please open a GitHub Issue in this repository.
