# 📁 Phase_1 – Smart Library System (Monolithic Architecture)

## 📌 Overview

This folder contains the **Phase 1** implementation of the Smart Library System using a **monolithic architecture**. The system integrates all core functionalities — user management, book cataloging, and book loan tracking — into a single, unified Node.js application.

This version is ideal for simple deployments where services are tightly coupled and managed as a single unit.

---

## 🧩 Functional Modules

### 1. 👥 User Management Module
- Register a new user (students or faculty).
- Update user profile information.
- Retrieve user details.

### 2. 📚 Book Management Module
- Add, update, or delete books from the catalog.
- View book availability.
- Search books by title, author, or genre.

### 3. 🔁 Loan Management Module
- Issue books to users.
- Return books and update availability.
- View active and historical loan records.


## 🛢️ Unified Database Schema

| Table  | Description                        |
|--------|------------------------------------|
| `users` | Stores user information.           |
| `books` | Stores book catalog details.       |
| `loans` | Tracks issued and returned books.  |

---

### 📐 API Design Principles

- **RESTful Architecture**: Resources accessed using HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
- **JSON Payloads**: All requests and responses use JSON.
- **Consistent Naming**: Endpoints follow the format `/api/{resource}`.
- **Stateless Communication**: No client state is stored on the server between requests.
- **Proper Status Codes**: Uses standard HTTP codes:  
  - `200 OK`, `201 Created` for success  
  - `400 Bad Request`, `404 Not Found` for client errors  
  - `500 Internal Server Error` for server errors

---

### 📘 Core API Endpoints & Sample JSON Format

#### 👥 User Management
| Method | Endpoint                   | Description                      |
|--------|-----------------------     |----------------------------------|
| POST   | `/api/users`               | Register a new user              |
| GET    | `/api/users/:id`           | Get user details by ID           |
| GET    | `/api/users/stats/active`  | Get the most active users        |

#### Request: (POST `/api/users`)
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "role": "student"
}

```

#### 📚 Book Management
| Method | Endpoint                   | Description                      |
|--------|-----------------------     |----------------------------------|
| POST   | `/api/books`               | Add a new book                   |
| GET    | `/api/books/search?=clean` | Search books by title/author/etc |
| GET    | `/api/books/:id`           | Get book details by ID           |
| PUT    | `/api/books/:id`           | Update book info                 |
| DELETE | `/api/books/:id`           | Remove book from catalog         |
| GET    | `/api/books/stats/popular` | Get the most borrowed books      |

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


#### 🔁 Loan Management
| Method | Endpoint                     | Description                      |
|--------|-----------------------       |----------------------------------|
| POST   | `/api/loans`                 | Issue a book to a user           |
| PUT    | `/api/loans/returns`         | Return a loaned book             |
| GET    | `/api/loans/:user_id`        | View loan history for a user     |
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

## Run Locally

Clone the project

```bash
  git clone https://github.com/samdani91/Smart_Library_System.git
```

Go to the project directory

```bash
  cd Phase_1
```

Install dependencies

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

