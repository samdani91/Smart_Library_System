# 📁 Phase_2 – Smart Library System (Microservices Architecture)

## 📌 Overview

In the microservices version of the Smart Library System, the application is divided into three independent services — each responsible for a specific domain: User, Book, and Loan. Every service has its own database and communicates with others via HTTP APIs (no queues or Kafka involved in this version).

---

## 🧩 Services Overview

### 1. 👥 User Service
Handles registration, profile management, and user-related queries.
- 🚪 REST Base Path: /api/users
- 📦 Owns a user database.

### 2. 📚 Book Service
Manages book inventory, search, and updates to availability.
- 🚪 REST Base Path: /api/books
- 📦 Owns a book database.

### 3. 🔁 Loan Service
Issues and returns books by communicating with both User Service and Book Service.
- 🚪 REST Base Path: /api/loans
- 📦 Owns a loan database.


## 🛢️  Databases (One per service)

| Service         | Database   | Tables  |
|-----------------|------------|---------|
| **User Service**| `user_db`  | `users` |
| **Book Service**| `book_db`  | `books` |
| **Loan Service**| `loan_db`  | `loans` |


---

# 🔗 Inter-Service Communication

## Communication Patterns

In this microservices architecture, services communicate with each other through synchronous HTTP/REST APIs. Here’s how the communication flows:

### ➡️ Direct Service-to-Service Communication

The **Loan Service** directly calls APIs exposed by the **User Service** and **Book Service**.

#### Example Flow (Book Issuing):
- Calls `GET /api/users/{id}` to verify the user exists
- Calls `GET /api/books/{id}` to check book availability
- Calls `PATCH /api/books/{id}/availability` to update book availability

---

## 🔧 Implementation Details

- **Service URLs:**  
  In development, services may use predefined URLs:  
  `http://user-service:8081`  
  `http://book-service:8082`

- **HTTP Clients:**  
  Services use HTTP clients to make REST API calls.

- **Circuit Breakers:**  
  Implement circuit breakers to handle service failures gracefully.

- **Timeout Handling:**  
  Set appropriate timeouts to prevent cascading failures across services.

---

## 🔁 Example: Loan Creation Flow

When a client sends a request to create a loan:

1. **Client sends** `POST /api/loans` → **Loan Service**
2. **Loan Service performs:**
   - `GET /api/users/{user_id}` → **User Service**
   - `GET /api/books/{book_id}` → **Book Service**
   - `PATCH /api/books/{book_id}/availability` → **Book Service**
   - `INSERT` into `loan_db.loans`
3. Returns response to Client

---

## 🚨 Error Handling

- If **User Service** is unavailable → `503 Service Unavailable`
- If **Book Service** is unavailable → `503 Service Unavailable`
- If the **user doesn’t exist** → `404 Not Found`
- If the **book doesn’t exist** or **no copies available** → `400 Bad Request`

**Note:** No shared database. Each service is data-isolated to ensure decoupling and autonomy.

---

# 🧪 API Documentation (Microservices)

Each microservice exposes RESTful APIs for client and inter-service communication.

## API Design Principles

- **RESTful Architecture:** Access resources via standard HTTP methods (GET, POST, PUT, DELETE)
- **JSON Payloads:** Use JSON format for all requests and responses
- **Service Isolation:** Each service maintains its own API namespace and database
- **Stateless Communication:** Servers do not store client state between requests
- **Proper Status Codes:** Use HTTP status codes to indicate:
  - Success (2xx)
  - Client Errors (4xx)
  - Server Errors (5xx)

> The following endpoints demonstrate core functionality of each microservice. You are encouraged to add more APIs to fulfill additional requirements or use cases.

---

### 📘 Core API Endpoints & Sample JSON Format

#### 👥 User Service
| Method | Endpoint                   | Description                      |
|--------|-----------------------     |----------------------------------|
| POST   | `/api/users`               | Register a new user              |
| GET    | `/api/users/:id`           | Get user details by ID           |
| PUT    | `/api/users/:id`           | Update user information          |
| GET    | `/api/users/stats/active`  | Get the most active users        |

#### Request: (POST `/api/users`)
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "role": "student"
}
```

#### Request: (PUT `/api/users/:id`)
```json
{
  "name": "Alice Johnson",
  "email": "alice.johnson@example.com"
}
```

#### 📚 Book Service
| Method | Endpoint                   | Description                      |
|--------|-----------------------     |----------------------------------|
| POST   | `/api/books`               | Add a new book                   |
| GET    | `/api/books/search?=clean` | Search books by title/author/etc |
| GET    | `/api/books/:id`           | Get book details by ID           |
| PUT    | `/api/books/:id`           | Update book info                 |
| DELETE | `/api/books/:id`           | Remove book from catalog         |
| GET    | `/api/books/stats/popular` | Get the most borrowed books      |
| PATCH    | `/api/books/:id/availability` | Update a book’s available copies (used internally by Loan Service during issue/return)    |

#### Request: (POST `/api/books`)
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "copies": 3
}

```
#### Request: (PUT `/api/books/:id`)
```json
{
  "copies": 5,
  "available_copies": 3
}

```


#### 🔁 Loan Service
| Method | Endpoint                     | Description                      |
|--------|-----------------------       |----------------------------------|
| POST   | `/api/loans`                 | Issue a book to a user           |
| PUT    | `/api/loans/returns`         | Return a loaned book             |
| GET    | `/api/loans/:id/`      | Get details of a specific loan   |
| GET    | `/api/loans/user/:user_id`   | View loan history for a user     |
| GET    | `/api/loans/overdue`         | List all overdue loans           |
| PUT    | `/api/loans/:id/extend`      | Extend the due date for a loan   |
| GET    | `/api/loans/stats/overview`  | Get system overview statistics   |

#### Request: (POST `/api/loans`)
```json
{
  "user_id": 1,
  "book_id": 42,
  "due_date": "2025-05-15T23:59:59Z"
}

```
#### Request: (POST `/api/loans/returns`)
```json
{
  "loan_id": 1001
}

```

#### Request: (PUT `/api/loans/:id/extend`)
```json
{
  "extension_days": 7
}

```
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
  127.0.0.1 user-service
  127.0.0.1 book-service
  127.0.0.1 loan-service
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