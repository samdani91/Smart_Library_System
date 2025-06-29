# 📁 Phase_5 – Containerization with Docker & Managing with Docker Compose

## 📌 Overview

This phase introduces **NGINX as a reverse proxy** and uses **Docker Compose** to orchestrate the Smart Library System's services. It routes incoming requests to different backend microservices and handles centralized logging and error management.

---

## 📦 Topics Covered

- ✅ Dockerizing backend services (User, Book, Loan)
- ✅ Installing and configuring NGINX
- ✅ Setting up NGINX as a reverse proxy with Docker
- ✅ Path-based routing using NGINX:
  - `/api/users` → User Service  
  - `/api/books` → Book Service  
  - `/api/loans` → Loan Service  
- ✅ Centralized request logging
- ✅ Handling 404 and upstream errors via custom error responses
- ✅ Managing MongoDB with Docker volume
- ✅ Using `.env` variables inside Docker containers

---

## 📁 Project Structure

Smart_Library_System/Phase_5/

- docker-compose.yml
- nginx.conf
- User_Service/
- Book_Service/
- Loan_Service/


---

## ⚙️ DNS Setup (Optional for Localhost Resolution)

Edit your system's `hosts` file to resolve domain names used in NGINX config:

```bash
sudo nano /etc/hosts
127.0.0.1 library-app.com
127.0.0.1 user-service
127.0.0.1 book-service
127.0.0.1 loan-service
```
Save & exit.

### 🚀 Running the Application with Docker Compose
Ensure Docker and Docker Compose are installed on your machine.

- Clone the Repository
```
git clone https://github.com/samdani91/Smart_Library_System.git
cd Smart_Library_System/Phase_5
```

### 🧪 Running the App
Start all containers and build if needed:

```
docker-compose up -d --build
```

### 📂 Access Services
Once running, you can access your APIs through NGINX:

http://library-app.com/api/users → User Service

http://library-app.com/api/books → Book Service

http://library-app.com/api/loans → Loan Service
