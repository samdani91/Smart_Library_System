# 📁 Phase_3 – Reverse Proxy with Nginx

## 📌 Overview

This phase introduces Nginx as a reverse proxy, acting as the single entry point to route traffic to backend microservices with Phase_2 .
---
## 📦 Topics Covered

- ✅ Installing and configuring Nginx on Linux  
- ✅ Understanding `nginx.conf` structure and virtual hosts  
- ✅ Path-based routing:
  - `/api/users` → User Service  
  - `/api/books` → Book Service  
  - `/api/loans` → Loan Service  
- ✅ Static file delivery for frontend (optional)  
- ✅ Centralized request logging  
- ✅ Handling 404s and upstream errors  

---

## DNS Setup

Go to etc directory 

```bash
  cd /etc
```

Open hosts file

```bash
  sudo gedit hosts
```
Add these lines at the end of the file and save
```bash
  127.0.0.1 library-app.com
  127.0.0.1 user-service
  127.0.0.1 book-service
  127.0.0.1 loan-service
```

## Nginx Setup

Install nginx

```bash
  sudo apt update
  sudo apt install nginx
```

Create Configuration

```bash
  sudo nano /etc/nginx/nginx.conf
  # Paste contents of nginx.txt  here
```
Test Configuration
```bash
  sudo nginx -t
```

Apply Configuration
```bash
  sudo systemctl reload nginx
```

Monitor Logs
```bash
  sudo tail -f /var/log/nginx/error.log
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`

`DATABASE_URL`


## Run Locally

Clone the project

```bash
  git clone https://github.com/samdani91/Smart_Library_System.git
```

Go to the project directory

```bash
  cd Phase_2
```

Go to the each service directory

```bash
  cd User_Service
  cd Book_Service
  cd Loan_Service
```

Install dependencies in each service directory

```bash
  npm install
```
Run MongoDB Service

```bash
  sudo systemctl start mongod.service

```

Start the server

```bash
  npm run dev
```