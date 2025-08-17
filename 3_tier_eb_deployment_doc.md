# 3-Tier Application Deployment on AWS Elastic Beanstalk – Detailed Steps

---

## Project Overview

- **Frontend:** React application (Dockerized)  
- **Backend:** Node.js API (Express)  
- **Database:** MySQL (RDS instance)  
- **Deployment:** AWS Elastic Beanstalk  
- **Environment:** Production (`NODE_ENV=production`)  

**Goal:** Full end-to-end connectivity between frontend, backend, and database, with secure credentials, environment variables, and API connectivity.

---

## 1️⃣ Project Structure

```
3-Tier-DevOps-Project/
│
├─ api/                 # Backend Node.js code
│   ├─ app.js           # Main server file
│   ├─ package.json
│   ├─ package-lock.json
│   ├─ Procfile         # For EB to know how to start server
│   ├─ models/
│   │   └─ db.js        # DB connection setup
│   ├─ controllers/     # API controllers
│   │   ├─ authController.js
│   │   └─ userController.js
│   ├─ routes/          # API routes
│   │   ├─ authRoutes.js
│   │   └─ userRoutes.js
│   ├─ middleware/      # Auth & role middleware
│   └─ .ebextensions/  # EB configuration (Node version, env variables)
│
├─ client/              # React frontend code
│   ├─ Dockerfile       # Docker config for React frontend
│   ├─ .dockerignore
│   ├─ env.sh           # Environment variable injection script
│   ├─ default.conf     # NGINX config
│   ├─ package.json
│   ├─ public/
│   │   └─ index.html
│   └─ src/
│       └─ axios.js    # Axios setup with backend API
└─ README.md
```

---

## 2️⃣ Backend Setup (Node.js + MySQL)

### 2.1 Files and Purpose

- **app.js** – Starts Express server on port 8080, configures routes, middleware, handles authentication & API requests.  
- **models/db.js** – Configures MySQL connection using environment variables, enables connection pooling.  
- **.ebextensions/node.config** – Specifies Node.js version for EB runtime.  
- **Procfile** – Defines startup command for EB:  
```
web: node app.js
```  
- **Routes & Controllers**  
  - `authRoutes.js` – `/api/auth/login` route for login  
  - `userRoutes.js` – `/api/users` route for user data  
  - `authController.js` – Handles login logic  
  - `userController.js` – Handles fetching users  
  - `middleware/auth.js` – Validates JWT token

### 2.2 Backend Deployment Steps

1. Zip backend folder:
```bash
cd api
zip -r ../backend.zip . -x "*.git*"
```

2. Confirm Procfile exists in zip:
```bash
unzip -l ../backend.zip | grep Procfile
```

3. Upload zip to **Elastic Beanstalk Backend Environment**.

4. Check logs if backend is not reachable:
```bash
/var/log/web.stdout.log   # Backend server logs
/var/log/nginx/error.log  # Proxy/Nginx logs
```

**Common Issue:**
```
Access denied for user 'admin'@'172.31.36.237' (using password: NO)
```

**Reason:** EB environment variables were not configured for database credentials.  

**Solution:** Set environment variables in EB console or AWS Secrets Manager:  
```
DB_HOST, DB_NAME, DB_USER, DB_PASS, JWT_SECRET, NODE_ENV
```

---

## 3️⃣ Frontend Setup (React + Docker + NGINX)

### 3.1 Files and Purpose

- **Dockerfile** – Builds React app and serves using NGINX.  
- **env.sh** – Exports runtime environment variables (backend API URL).  
- **default.conf** – NGINX config to serve React build folder, handles `/api` requests via reverse proxy.  
- **axios.js** – Configures Axios with backend API:
```javascript
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
```

### 3.2 Frontend Deployment Steps

1. Build React project locally:
```bash
npm install
npm run build
```

2. Prepare Docker image:
```bash
docker build -t react-frontend .
```

3. Zip frontend files:
```bash
zip -r ../frontend.zip Dockerfile build default.conf env.sh
```

4. Upload zip to **Elastic Beanstalk Frontend Environment**.

5. Ensure environment variable `REACT_APP_API_URL` points to backend EB URL.

---

## 4️⃣ Database Setup (AWS RDS MySQL)

- **RDS Endpoint:** `myappdb.dfghj75b.ap-south-1.rds.amazonaws.com`  
- **DB Name:** `crud_app`  
- **User:** `admin`  
- **Password:** `Rahul`  

Backend connects via `models/db.js` using these environment variables.

---

## 5️⃣ Environment Variables Used

| Key               | Value                                         |
|-----              |-------|
| DB_HOST           | myappdb.dfghj75b.ap-south-1.rds.amazonaws.com |
| DB_NAME           | crud_app                                      |
| DB_USER           | admin                                         |
| DB_PASS           | Rahul                                         |
| JWT_SECRET        | DevOpsShack123                                |
| NODE_ENV          | production                                    |
| REACT_APP_API_URL | Backend EB URL                                |

**Stored in EB environment configuration** to secure credentials. Ensures backend/frontend don’t store secrets in code.

---

## 6️⃣ Issues & Resolutions

| Issue                       | Reason                                         | Solution                                                    |
|-------                      |--------                                        |---------                                                    |
| Backend 504 Gateway Timeout | Backend couldn’t connect to DB (Access denied) | Set correct DB credentials in EB environment                |
| fetch / Axios failing       | Frontend pointing to wrong backend URL         | Set `REACT_APP_API_URL` environment variable in frontend EB |
| NGINX warnings (types_hash) | Default NGINX config                           | Ignored – doesn’t affect functionality                      |
| Bash fetch() syntax         | Using JS code in Bash                          | Use curl in terminal or browser JS console for API calls    |
---

## 7️⃣ Commands Used

**Backend**
```bash
cd api
zip -r ../backend.zip . -x "*.git*"
git add .
git commit -m "Backend deployed and working"
git push origin main
```

**Frontend**
```bash
cd client
npm run build
docker build -t react-frontend .
zip -r ../frontend.zip Dockerfile build default.conf env.sh
git add .
git commit -m "Frontend deployed with correct API URL"
git push origin main
```

**Testing Backend API**
```bash
curl -H "Authorization: Bearer DevOpsShack123" http://myapp-backend-env.eba-xxxx/api/users
```

---

## 8️⃣ Deployment Workflow Summary

1. Prepare **backend zip** → Upload to EB backend environment.  
2. Prepare **frontend zip** (Dockerized) → Upload to EB frontend environment.  
3. Configure EB **environment variables** for DB credentials and API URLs.  
4. Test backend API using `curl`.  
5. Test frontend → Ensure it calls backend API successfully.  
6. Check EB logs if API not working.

**Outcome:** React frontend calls backend API successfully, backend connects to MySQL RDS, full end-to-end deployment achieved.

