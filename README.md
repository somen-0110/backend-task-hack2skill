# Overview

Express API with JWT authentication, user-based isolation, embedded tasks/subtasks, and soft deletion.

## Setup

1. Copy `.env.example` to `.env` and set variables.
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
  { "name": "Alice", "email": "alice@example.com", "password": "Password123!" }
  ```

- **Login:**  
  `POST /auth/login`  
  Body:

  ```json
  { "email": "alice@example.com", "password": "Password123!" }
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
    "tasks": [
      /* Task[] */
    ]
  }
  ```

  (Excludes deleted tasks/subtasks.)

- **Create a task:**  
  `POST /tasks`  
  Body:

  ```json
  {
    "subject": "Build API",
    "deadline": "2025-08-31T00:00:00.000Z",
    "status": "in_progress"
  }
  ```

  Returns:

  ```json
  {
    "task": {
      /* Task */
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
      /* Task */
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
      /* Subtask[] */
    ]
  }
  ```

  (Non-deleted only.)

- **Replace subtasks:**  
  `PUT /tasks/:taskId/subtasks`  
  Body:
  ```json
  [
    {
      "subject": "Design schema",
      "deadline": "2025-08-20T00:00:00.000Z",
      "status": "done"
    },
    {
      "subject": "Implement routes",
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
- Consider adding indexes and validation as needed.
