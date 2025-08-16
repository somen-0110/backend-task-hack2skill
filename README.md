# Overview

Express API with JWT authentication, user-based isolation, embedded tasks/subtasks, and soft deletion.

## Setup

1. Create a `.env` and set variables. Variables to be set are:

   ```bash
   PORT: <Enter Your Port Number Here. Default = 3000>
   NODE_ENV=<Set the node environment. (Example: production, development)>
   MONGO_URI=<Enter your DB URI (Example: mongodb://localhost:27017/tasks_db)>
   JWT_SECRET=<Generate a random string for signing and verifying the jwt tokens>
   JWT_EXPIRES_IN=<Set the expiry for the token. Default = 7d>
   BCRYPT_SALT_ROUNDS=<Enter the number of salt rounds for hashing the password. Default = 10>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Authentication

- **Register:**  
  `POST /auth/register`  
  Body:

  ```json
  {
    "name": "Enter a name here",
    "email": "name@example.com",
    "password": "Password123!"
  }
  ```

- **Login:**  
  `POST /auth/login`  
  Body:

  ```json
  { "email": "name@example.com", "password": "Password123!" }
  ```

  Response:

  ```json
  {
    "token": "...",
    "user": { "id": "...", "name": "Alice", "email": "alice@example.com" }
  }
  ```

- Use `Authorization: Bearer <token>` for all `/tasks` routes.

## Tasks

- **Get all tasks:**  
  `GET /tasks`  
  Returns:

  ```json
  {
    "tasks": []
  }
  ```

  (Excludes deleted tasks/subtasks.)

- **Create a task:**  
  `POST /tasks`  
  Body:

  ```json
  {
    "subject": "Sample Task 1",
    "deadline": "2025-08-31T00:00:00.000Z",
    "status": "in_progress"
  }
  ```

  Returns:

  ```json
  {
    "task": {
      Returns the new task created
    }
  }
  ```

- **Update a task:**  
  `PUT /tasks/:taskId`  
  Body:

  ```json
  { "subject": "...", "deadline": "...", "status": "..." }
  ```

  Returns:

  ```json
  {
    "task": {
      Return the updated task
    }
  }
  ```

- **Delete (soft) a task:**  
  `DELETE /tasks/:taskId`  
  Returns a confirmation message.

## Subtasks

- **Get subtasks:**  
  `GET /tasks/:taskId/subtasks`  
  Returns:

  ```json
  {
    "subtasks": [
      Returns the array of subtasks
    ]
  }
  ```

  (Non-deleted only.)

- **Update subtasks:**  
  `PUT /tasks/:taskId/subtasks`  
  Body:
  ```json
  [
    {
      "subject": "SubTask 1",
      "deadline": "2025-08-20T00:00:00.000Z",
      "status": "done"
    },
    {
      "subject": "SubTask 2",
      "deadline": "2025-08-25T00:00:00.000Z",
      "status": "in_progress"
    }
  ]
  ```
  - Only non-deleted subtasks are replaced.
  - Previously deleted subtasks remain in the database.
  - Returns current non-deleted subtasks.

## Data Model

- **User**

  ```ts
  {
     name: string,
     email: string,
     passwordHash: string,
     tasks: Task[]
  }
  ```

- **Task**

  ```ts
  {
     _id: string,
     subject: string,
     deadline: Date,
     status: 'pending' | 'in_progress' | 'done',
     isDeleted: boolean,
     subtasks: Subtask[]
  }
  ```

- **Subtask**
  ```ts
  {
     _id: string,
     subject: string,
     deadline: Date,
     status: string,
     isDeleted: boolean
  }
  ```

## Notes

- All reads exclude `isDeleted: true`.
- `PUT` on subtasks replaces only the non-deleted set; deleted subtasks are preserved.
- Task update is blocked if the task is soft-deleted.
