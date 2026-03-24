# 🚀 SmartQueue - Queue Management Backend

SmartQueue is a backend system designed to manage real-world queue operations efficiently. It handles user authentication, role-based access, group management, queue creation, and ticket processing.

The goal of this project is to simulate how real systems manage queues with proper state handling, consistency, and backend architecture.

---

## 🧠 Project Overview

SmartQueue is built to solve common queue-related problems such as:

- Managing multiple users in a queue
- Assigning sequential ticket numbers
- Handling real-time queue flow
- Ensuring consistency during operations like "Call Next"

This project focuses heavily on backend logic and system design rather than UI.

---

## ⚙️ Features

### 🔐 Authentication System
- User Registration & Login
- JWT-based authentication
- Refresh token handling using cookies
- Secure logout mechanism

---

### 👤 User Management
- Update user details (name, profile image)
- Delete user
- Protected routes using middleware

---

### 🛡️ Role-Based Access Control (RBAC)
- Default role: User
- Admin role assigned on group creation
- Super Admin:
  - View all users
  - Block / Unblock users

---

### 👥 Group (Workspace) System
- Create and delete groups
- Link users with groups
- Admin ownership logic
- MongoDB transactions for consistency

---

### 📦 Queue System
- Create queues inside groups
- Associate queues with specific groups
- Maintain queue state

---

### 🎟️ Ticket System
- Users can join queues
- Automatic ticket number generation
- Track ticket states:
  - Waiting
  - Serving
  - Completed

---

### 🔄 Queue Processing (Core Logic)
- Call Next Ticket
- Move current ticket → completed
- Move next ticket → serving
- Update queue state (current serving number)
- Ensures proper sequential flow

---

## 🏗️ Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose)  
- **Authentication:** JWT + Cookies  
- **Architecture:** REST API, MVC pattern  

---

## 🎯 Key Learnings

- Designing real-world backend systems
- Implementing role-based authorization
- Managing state transitions in queues
- Using MongoDB transactions for consistency
- Writing scalable and modular backend code

---

## 🚧 Future Enhancements

- Skip ticket functionality
- Complete ticket API
- Live queue tracking (position, people ahead)
- WebSocket integration for real-time updates

---

## 📌 Conclusion

SmartQueue is a backend-focused project that goes beyond CRUD operations and focuses on real business logic, making it a strong foundation for understanding system design and backend architecture.