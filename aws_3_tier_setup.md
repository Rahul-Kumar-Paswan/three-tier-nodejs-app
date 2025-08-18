# 3-Tier Application Deployment on AWS – Infrastructure Setup

## 1️⃣ Architecture Overview

### Components
- **Frontend**: React app, Dockerized, deployed on AWS Elastic Beanstalk (EB).
- **Backend**: Node.js API (Express), deployed on EB.
- **Database**: MySQL on Amazon RDS.
- **IAM Roles**: Service roles for EB to access AWS resources securely.
- **Security Groups (SG)**: Control inbound/outbound traffic.
- **Elastic Beanstalk Environments**: Separate environments for frontend and backend.

### Flow Diagram
```
React Frontend (EB Docker)
        |
   HTTPS/API Calls
        |
Node.js Backend (EB)
        |
   MySQL Queries
        |
     Amazon RDS
```

**Why**: This architecture ensures a clear separation of concerns, better scalability, and secure access between frontend, backend, and database.

---

## 2️⃣ AWS Infrastructure Setup

### Step 1: VPC and Subnet
- Used **default VPC** in ap-south-1.
- **Subnets**: EB and RDS must be in private/public subnets depending on access.
- **Reason**: Isolate resources and control traffic flow.

---

### Step 2: Security Groups

**Backend SG**
- Name: `sg-backend-eb`
- Inbound: TCP 8080 from frontend SG.
- Outbound: Allow MySQL 3306 to RDS SG.

**RDS SG**
- Name: `sg-rds`
- Inbound: TCP 3306 from `sg-backend-eb`.
- Outbound: Allow all (or restrict to backend SG).

**Frontend SG**
- Name: `sg-frontend-eb`
- Inbound: TCP 80/443 from Internet.
- Outbound: Allow all to backend SG (8080).

**Why**: Controls which components can communicate; ensures security and avoids unauthorized access.

---

### Step 3: MySQL Database (RDS)

**Steps:**
1. Go to **RDS → Create Database → MySQL**
2. DB instance identifier: `myappdb`
3. Master username: `admin`, password: `Rahul`
4. DB name: `crud_app`
5. Instance type: `db.t3.micro`
6. VPC: Default VPC, private subnet
7. Security Group: `sg-rds`
8. Public access: **No**
9. Storage: **20 GB SSD**

**Why**: Managed MySQL provides backups, scaling, and security.

---

### Step 4: IAM Roles

**Elastic Beanstalk Service Role**
- Policies: `AWSElasticBeanstalkEnhancedHealth`, `AmazonS3ReadOnlyAccess`
- Purpose: EB environment can manage EC2, S3, logs.

**Instance Profile Role**
- Policy: `AmazonRDSFullAccess`
- Purpose: EB backend instance can securely connect to RDS.

---

### Step 5: Backend Elastic Beanstalk Setup

1. EB → Create Environment → **Web Server → Node.js**
2. Upload **backend.zip** (includes app.js, models/, .ebextensions, Procfile)
3. Configure:
   - Instance type: `t3.micro`
   - SG: `sg-backend-eb`
   - Environment variables:
```
DB_HOST=myappdb.dfghj75b.ap-south-1.rds.amazonaws.com
DB_NAME=crud_app
DB_USER=admin
DB_PASS=Rahul
JWT_SECRET=DevOpsShack123
NODE_ENV=production
```
4. Deployment policy: **Rolling updates**

**Why**: EB automates deployment, scaling, and monitoring for backend services.

---

### Step 6: Frontend Elastic Beanstalk Setup

1. EB → Create Environment → **Web Server → Docker**
2. Upload **frontend.zip** (Dockerfile, build/, default.conf, env.sh)
3. Configure:
   - Instance type: `t3.micro`
   - SG: `sg-frontend-eb`
   - Environment variable:
```
REACT_APP_API_URL=http://myapp-backend-env.eba-xxxx.ap-south-1.elasticbeanstalk.com
```
4. Deployment policy: **Rolling updates**

**Why**: Docker bundles frontend with NGINX; EB deploys container easily.

---

### Step 7: Environment Variables

**Backend EB**
```
DB_HOST=myappdb.dfghj75b.ap-south-1.rds.amazonaws.com
DB_NAME=crud_app
DB_USER=admin
DB_PASS=Rahul
JWT_SECRET=DevOpsShack123
NODE_ENV=production
```

**Frontend EB**
```
REACT_APP_API_URL=http://myapp-backend-env.eba-xxxx.ap-south-1.elasticbeanstalk.com
```

**Why**: Avoid hardcoding credentials; keeps secrets secure.

---

### Step 8: Testing & Troubleshooting

**Backend API Test**
```
curl -X GET http://myapp-backend-env.eba-xxxx/api/users
```

**Logs**
```
eb logs backend-env
# Or manually:
# /var/log/web.stdout.log
# /var/log/nginx/error.log
```

**Frontend**
- Open EB URL, test login/signup → Should reach backend.

**Common Issues**
- **504 Gateway Timeout** → Backend cannot connect to RDS → Fix SG & environment variables
- **ER_ACCESS_DENIED_ERROR** → Wrong DB credentials → Fix environment variables in EB
- **NGINX warnings (types_hash)** → Can ignore

---

### Step 9: Git Versioning
```
git add .
git commit -m "Backend and frontend deployed on AWS EB with RDS"
git push origin main
```

---

### Step 10: Summary
- **Frontend EB**: React Docker + NGINX
- **Backend EB**: Node.js API
- **RDS MySQL**: Database
- **Security Groups**: Frontend → Backend → RDS
- **IAM Roles**: EB instance + service access
- **Environment Variables**: Secure storage for credentials

✅ **Outcome**: React frontend calls backend API successfully, backend connects to MySQL RDS, full end-to-end deployment done.

