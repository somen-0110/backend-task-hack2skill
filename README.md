# Overview

Express API with JWT authentication, user-based isolation, embedded tasks/subtasks, and soft deletion.

## Setup

1. Create a `.env` and set variables. Variables to be set are:

   ```json
   PORT: Enter the port number. Default value is 3000.
   NODE_ENV: Set the node environment.
   MONGO_URI: Enter your DB connection string.
   JWT_SECRET: Generate a random string which signs and verifies the token.
   JWT_EXPIRES_IN: Set the expiry for the token.
   BCRYPT_SALT_ROUNDS: Enter the number of salt rounds for hashing the password.
   ```

   - The default value for PORT is 3000.
   - Sample connenction string looks something like

   ```bash
   mongodb://localhost:27017/tasks_db
   ```

   - Following code can be used to generate a random JWT_SECRET

   ```bash
   node -e 'console.log(require('crypto').randomBytes(32).toString('hex'))
   ```

   - Default value for Token expiry is 7d(7 days).
   - Default value for number of salt rounds is 10.
   - A sample env file looks something like this

   ```bash
    PORT=5000
    NODE_ENV=development
    MONGO_URI=mongodb://localhost:27017/tasks_db
    JWT_SECRET=0969bfe3b10d07255ed5109871036c61cc2b263da6f0219986b41b2045f392ae
    JWT_EXPIRES_IN=7d
    BCRYPT_SALT_ROUNDS=10
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
    "name": "John Doe",
    "email": "johndoe@email.com",
    "password": "Password123!"
  }
  ```

- **Login:**  
  `POST /auth/login`  
  Body:

  ```json
  { "email": "johndoe@example.com", "password": "Password123!" }
  ```

  Response:

  ```json
  {
    "token": "...",
    "user": { "id": "...", "name": "John Doe", "email": "johndoe@example.com" }
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
