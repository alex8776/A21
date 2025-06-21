# 🧾 Paid Forum Registration (Backend + Frontend)

This project is a full-stack web application (frontend + backend) that allows users to register for a **private forum**. Registration is manually validated by administrators based on **uploaded payment proof**. The backend uses **FastAPI**, **JWT** and **OAuth2** for secure authentication and includes a **role-based access control** system (user, admin, superadmin). The frontend is developed with **vanilla HTML/CSS/JavaScript**.

---

## 🧱 Project Structure

```
forum-project/
├── backend/
│   └── src/
│       ├── config.py
│       ├── __init__.py
│       ├── admin/
│       │   ├── auth.py
│       │   ├── init_superadmin.py
│       │   ├── models.py
│       │   ├── routes.py
│       │   ├── schemas.py
│       ├── database/
│       │   └── main.py
│       ├── static/
│       │   └── uploads/       # where user payment screenshots are stored, Has been removed to the repository
│       ├── users/
│       │   ├── models.py
│       │   ├── router.py
│       │   ├── schemas.py
│       └── utils/
│           └── email_utils.py
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── main.js
```

---

## ⚙️ Features

### User
- ✅ Registration form with payment screenshot upload
- ✅ Secure authentication using JWT (OAuth2PasswordBearer)
- ✅ Profile access after login

### Admin
- ✅ View and review user registrations
- ✅ View/download uploaded payment screenshots
- ✅ Approve or reject registrations

### Super Admin
- ✅ Manage admin accounts (create/delete)
- ✅ Full access to admin functionality

### Backend
- ✅ OAuth2 + JWT authentication
- ✅ Role-based access control
- ✅ Local file storage for uploaded images
- ✅ Email confirmation after validation
- ✅ PostgreSQL database (via SQLModel)

---

## 🛠️ Technologies

- Backend: FastAPI, SQLModel, PostgreSQL, JWT, OAuth2
- Frontend: Vanilla HTML/CSS/JavaScript
- Email: smtplib or aiosmtplib
- File storage: Local filesystem (uploads/)

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Python 3.10+
- Node.js (only if you plan to add frontend dependencies later)
- PostgreSQL installed and running

---

### 🖥️ Backend Setup

#### On **Windows (PowerShell)**:

```powershell
cd backend
python -m venv env
.\env\Scriptsctivate
pip install -r requirements.txt
```

#### On **Mac/Linux (bash)**:

```bash
cd backend
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
```

Create the `.env` file inside `backend/src/`:

```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/forum_db
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
EMAIL_USER=youremail@example.com
EMAIL_PASSWORD=your_app_password
UPLOAD_DIR=static/uploads/
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Run the backend:

```bash
uvicorn src.main:app --reload
```

---

### 🌐 Frontend

- Open `frontend/index.html` in your browser.
- All API requests use `fetch()` to communicate with the backend.
- JWT tokens are stored in `localStorage`.

---

## 🔐 Authentication

- Uses **OAuth2PasswordBearer** and **JWT** for login sessions.
- Each protected route checks user role (`user`, `admin`, `superadmin`).
- Admin dashboard uses token to authenticate and review registrations.

---

## 📬 Registration Flow

1. User submits the registration form with a payment screenshot.
2. Admin reviews submissions via the admin dashboard.
3. If approved, an email confirmation is sent.
4. User can then log in and access protected content.

---

## ✅ TODO

- [ ] Add automated unit tests
- [ ] Migrate image storage to cloud (e.g. AWS S3)
- [ ] Build frontend admin dashboard with access control
- [ ] Add pagination, filtering in admin review panel
- [ ] Implement action logging (audit trail)

---

## 🧑‍💻 Author

Built by **Souleymane and Alexandre** to master backend development, secure authentication, file uploads, and vanilla frontend interaction with REST APIs.

---

## 📜 License

This project is licensed under the MIT License.
