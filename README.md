# AI Bharat Document Verification System

A comprehensive document verification system using AI/ML techniques to detect forged documents and extract information via OCR.

## 🎯 Project Overview

This project combines:
- **Frontend**: React + TypeScript + Vite with Shadcn UI components
- **Backend**: Node.js Express API with MongoDB
- **ML Services**: 
  - Forge detection using deep learning
  - OCR (Optical Character Recognition) API

## 🏗️ Project Structure

```
Ai_Bharat_Doc_varify/
├── frontend/          # React + TypeScript frontend
├── backend/           # Express.js backend API
├── ML/               # Machine learning services
│   ├── forge_detection/
│   └── OCR_api/
├── DEPLOYMENT_CHECKLIST.md
└── README.md
```

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **bun** (for frontend)
- **MongoDB** (local or cloud - MongoDB Atlas)
- **Python 3.8+** (for ML services)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Darshan-raja/Ai_Bharat_Doc_varify.git
cd Ai_Bharat_Doc_varify
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your configurations
# - Add MongoDB URI
# - Set JWT_SECRET
# - Configure email settings (optional)

npm start
```

Backend runs on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ../frontend
npm install

# Build for production
npm run build

# Or run development server
npm run dev
```

Frontend runs on `http://localhost:5173` (dev) or use production build

### 4. ML Services (Optional)

#### Forge Detection

```bash
cd ../ML/forge_detection
pip install -r requirements.txt
python main.py
```

#### OCR API

```bash
cd ../ML/OCR_api
pip install -r requirements.txt
python main.py
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

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

See [backend/.env.example](backend/.env.example) for all available options.

## 📚 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents/upload` - Upload document for verification
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Admin dashboard data

## 🔐 Security Notes

⚠️ **Important for Production:**
- Change `JWT_SECRET` to a strong, random value
- Never commit `.env` files
- Set `NODE_ENV=production` on deployment
- Configure CORS with specific allowed origins
- Use HTTPS for all communications
- Ensure MongoDB has authentication enabled

## 🛠️ Development

### Frontend Development
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Check code quality
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
npm start        # Start server
npm run test     # Run tests (if configured)
```

### ML Development
```bash
cd ML/forge_detection
python main.py

cd ML/OCR_api
python main.py
```

## 📦 Dependencies

### Backend
- **Express** - Web framework
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Shadcn UI** - UI components
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Tailwind CSS** - Styling

## 🚢 Deployment

### Option 1: Render/Railway (Backend)
1. Connect your GitHub repository
2. Set environment variables in platform dashboard
3. Set build command: `npm install`
4. Set start command: `npm start`

### Option 2: Vercel (Frontend)
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set `VITE_API_URL` environment variable

### Option 3: Docker
Create a `Dockerfile` for containerized deployment

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify `JWT_SECRET` is set
- Check if port 5000 is already in use

### Frontend build fails
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check ESLint configuration for TypeScript files
- Run `npm run lint` to identify issues

### API calls failing
- Check CORS configuration in `server.js`
- Verify API URL in frontend environment
- Check network tab in browser DevTools

## 📄 License

ISC License

## 👥 Contributors

- Darshan Raja (@Darshan-raja)

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Last Updated:** December 23, 2025

**Note:** This project is still in development. See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for deployment preparation steps.
