# Final Project Back-End Dev Init
Welcome to the Final Project Back-End Dev Init repository! This repository contains the backend implementation for my final project. Below, you'll find information on how to set up and use the project, as well as details on each endpoint available in the API.

## Features
- User registration and login
- CRUD operations for logs, todos, and events
- Get logs and todos by user ID and selected date
- Get events by user ID and selected date
- Partial updates for logs, todos, and events

## Prerequisites
Before you begin, ensure you have met the following requirements:

- Node.js installed on your local machine
- MySQL database server set up and running
- Git installed on your local machine (optional for cloning the repository)

## How to Clone the Project
To clone this project to your local machine, follow these steps:

1. Open your terminal or command prompt.
2. Navigate to the directory where you want to clone the project.
3. Run the following command:

```
git clone https://github.com/Awassanan/final-project-back-end-dev-init.git
```

## Setup Instructions
To set up and run the project locally, follow these steps:

1. Navigate to the project directory.
2. Install dependencies by running the following command:

```
npm install
```

3. Create database name 'todofinalproj'.
4. Change user and password in server.js at line 16 - 17 to your account.
5. Start the server by running the following command, the server will running on port 3000:

```
npm start
```

## API Endpoints with Mock Examples and Testing
Below are the available endpoints in the API along with their descriptions:

For each endpoint, mock example requests and responses are provided to help you understand how to interact with the API.

To test the API endpoints, you can use tools like Postman or write automated tests using frameworks like Mocha and Chai. Personally, I suggest Jest and supertest. You can use these mock examples for testing

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Method and Endpoint</th>
      <th>Example JSON Body</th>
      <th>Response</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Create new user account</strong></td>
      <td>POST: <code>/users/register</code></td>
      <td>
        <pre>{
  "username": "Mety Knight",
  "password": "1234",
  "email": "metyiscute@mail.com"
}</pre>
      </td>
      <td>
        <strong>Error cases:</strong><br>
        - "Invalid username!"<br>
        - "Invalid password!"<br>
        - "Invalid confirm_password"<br>
        - "Invalid email!"<br>
        - "Password and Confirm password must be the same"<br>
        - "Duplicate username, please try a new one"<br>
        - "Internal Server Error from registration!"<br><br>
        <strong>Success case:</strong><br>
        - "User is registered successfully, 1 record inserted"
      </td>
    </tr>
    <tr>
      <td><strong>Log in</strong></td>
      <td>POST: <code>/users/login</code></td>
      <td>
        <pre>{
  "username": "Mety Knight",
  "password": "1234"
}</pre>
      </td>
      <td>
        <strong>Error cases:</strong><br>
        - "Invalid username!"<br>
        - "Invalid password!"<br>
        - "Internal Server Error from finding password"<br>
        - "Username not found!"<br>
        - "Internal Server Error from updating last login"<br>
        - "Incorrect credentials!"<br>
        - "Internal Server Error from logging in"<br><br>
        <strong>Success case:</strong><br>
        - "Login successful"
      </td>
    </tr>
    <tr>
      <td><strong>Get all daily logs per user per selected date</strong></td>
      <td>GET: <code>/logs?user_id={id}&selected_date=YYYY-MM-DD</code></td>
      <td>-</td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing user_id parameter"<br>
        - "Missing date parameter"<br>
        - "Invalid date format. Please use YYYY-MM-DD"<br>
        - "Internal Server Error from finding log"<br>
        - "No log content"<br><br>
        <strong>Success case:</strong><br>
        <pre>[
  {
    "log_id": 5,
    "user_id": 1,
    "content": "Go to Kirby home",
    "date": "2024-06-14 10:40:00",
    "created_at": "2024-06-14 15:02:43",
    "last_modified": "2024-06-14 17:03:45"
  },
  ...
]</pre>
      </td>
    </tr>
    <tr>
      <td><strong>Create new daily log</strong></td>
      <td>POST: <code>/logs</code></td>
      <td>
        <pre>{
  "user_id": "1",
  "content": "Eat parfait",
  "date": "2024-06-19 20:00:00"
}</pre>
      </td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing user_id"<br>
        - "Missing content"<br>
        - "Missing date"<br>
        - "Internal Server Error from finding user"<br>
        - "User not found!"<br>
        - "Internal Server Error from creating new log"<br><br>
        <strong>Success case:</strong><br>
        - "New log entry added, 1 record inserted"
      </td>
    </tr>
    <tr>
      <td><strong>Get specific log by log id</strong></td>
      <td>GET: <code>/logs/:id?user_id={id}</code></td>
      <td>-</td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing log_id parameter"<br>
        - "Missing user_id parameter"<br>
        - "Internal Server Error from finding log"<br>
        - "Log not found!"<br><br>
        <strong>Success case:</strong><br>
        <pre>{
  "log_id": 5,
  "user_id": 1,
  "content": "Go to Kirby home",
  "date": "2024-06-14 10:40:00",
  "created_at": "2024-06-14 15:02:43",
  "last_modified": "2024-06-14 17:03:45"
}</pre>
      </td>
    </tr>
    <tr>
      <td><strong>Partial or full update log by log id</strong></td>
      <td>PUT: <code>/logs/:id</code></td>
      <td>
        <pre>{
  "user_id": 1,
  "content": "Go to Kirby home with Fumu",
  "date": "2024-06-14 10:40:00"
}</pre>
      </td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing log_id parameter"<br>
        - "Missing user_id"<br>
        - "No fields to update"<br>
        - "Internal Server Error from finding log"<br>
        - "Log not found!"<br>
        - "Internal Server Error from updating log"<br><br>
        <strong>Success case:</strong><br>
        - "Log entry updated successfully"
      </td>
    </tr>
    <tr>
      <td><strong>Delete log by log id</strong></td>
      <td>DELETE: <code>/logs/:id?user_id={id}</code></td>
      <td>-</td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing log_id parameter"<br>
        - "Missing user_id parameter"<br>
        - "Internal Server Error from finding log"<br>
        - "Log not found"<br>
        - "Internal Server Error from deleting log"<br><br>
        <strong>Success case:</strong><br>
        - "Log entry deleted successfully, 1 record deleted"
      </td>
    </tr>
    <tr>
      <td><strong>Get all to-do lists per user per selected date</strong></td>
      <td>GET: <code>/todos?user_id={id}&selected_date=YYYY-MM-DD</code></td>
      <td>-</td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing user_id parameter"<br>
        - "Missing selected_date parameter"<br>
        - "Invalid date format. Please use YYYY-MM-DD"<br>
        - "Internal Server Error from finding to-do list"<br>
        - "No to-do content"<br><br>
        <strong>Success case:</strong><br>
        <pre>[
  {
    "todo_id": 1,
    "user_id": 1,
    "title": "Practice sword",
    "description": "Go to Kabu cliff with Kirby",
    "due_date": "2024-06-17 14:00:00",
    "priority": "High",
    "status": "Past Due",
    "created_at": "2024-06-14 20:53:00",
    "last_modified": "2024-06-18 23:00:00"
  },
  ...
]</pre>
      </td>
    </tr>
    <tr>
      <td><strong>Create new to-do</strong></td>
      <td>POST: <code>/todos</code></td>
      <td>
        <pre>{
  "user_id": 13,
  "title": "Practice sword",
  "description": "Go to Kabu cliff with Papa Mety",
  "due_date": "2024-06-17 14:00:00",
  "priority": "High",
  "status": "Pending"
}</pre>
      </td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing user_id"<br>
        - "Missing title"<br>
        - "Missing description"<br>
        - "Missing due_date"<br>
        - "Missing priority"<br>
        - "Missing status"<br>
        - "Internal Server Error from finding user"<br>
        - "User not found!"<br>
        - "Internal Server Error from creating new todo"<br><br>
        <strong>Success case:</strong><br>
        - "New to-do added, 1 record inserted"
      </td>
    </tr>
    <tr>
      <td><strong>Get specific to-do by to-do id</strong></td>
      <td>GET: <code>/todos/:id?user_id={id}</code></td>
      <td>-</td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing todo_id parameter"<br>
        - "Missing user_id parameter"<br>
        - "Internal Server Error from finding todo"<br>
        - "To-do not found!"<br><br>
        <strong>Success case:</strong><br>
        <pre>{
  "todo_id": 1,
  "user_id": 1,
  "title": "Practice sword",
  "description": "Go to Kabu cliff with Kirby",
  "due_date": "2024-06-17 14:00:00",
  "priority": "High",
  "status": "Past Due",
  "created_at": "2024-06-14 20:53:00",
  "last_modified": "2024-06-18 23:00:00"
}</pre>
      </td>
    </tr>
    <tr>
      <td><strong>Partial or full update to-do by to-do id</strong></td>
      <td>PUT: <code>/todos/:id</code></td>
      <td>
        <pre>{
  "user_id": 1,
  "title": "Practice sword",
  "description": "Go to Kabu cliff with Kirby",
  "due_date": "2024-06-17 14:00:00",
  "priority": "Medium",
  "status": "Past Due"
}</pre>
      </td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing todo_id parameter"<br>
        - "Missing user_id"<br>
        - "No fields to update"<br>
        - "Internal Server Error from finding todo"<br>
        - "To-do not found!"<br>
        - "Internal Server Error from updating todo"<br><br>
        <strong>Success case:</strong><br>
        - "To-do updated, 1 record updated"
      </td>
    </tr>
    <tr>
      <td><strong>Delete to-do by to-do id</strong></td>
      <td>DELETE: <code>/todos/:id?user_id={id}</code></td>
      <td>-</td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing todo_id parameter"<br>
        - "Missing user_id parameter"<br>
        - "Internal Server Error from finding todo"<br>
        - "To-do not found"<br>
        - "Internal Server Error from deleting todo"<br><br>
        <strong>Success case:</strong><br>
        - "To-do deleted, 1 record deleted"
      </td>
    </tr>
    <tr>
      <td><strong>Get all calendar events per user per selected month</strong></td>
      <td>GET: <code>/events?user_id={id}&selected_month=YYYY-MM</code></td>
      <td>-</td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing user_id parameter"<br>
        - "Missing selected_month parameter"<br>
        - "Invalid date format. Please use YYYY-MM"<br>
        - "Internal Server Error from finding calendar events"<br>
        - "No calendar events in this month"<br><br>
        <strong>Success case:</strong><br>
        <pre>[
  {
    "event_id": 2,
    "user_id": 1,
    "title": "Singing Contest",
    "description": "I'm a superstar, I'm your father!!!",
    "start_date": "2024-06-20 17:00:00",
    "end_date": "2024-07-01 22:59:59",
    "status": "Upcoming",
    "created_at": "2024-06-18 21:58:54",
    "last_modified": "2024-06-18 21:58:54"
  },
  ...
]</pre>
      </td>
    </tr>
    <tr>
      <td><strong>Create new calendar event</strong></td>
      <td>POST: <code>/events</code></td>
      <td>
        <pre>{
  "user_id": 1,
  "title": "Take over Dream Land",
  "description": "I'm a rebellion!!!",
  "start_date": "2024-06-20 17:00:00",
  "end_date": "2024-07-01 22:59:59",
  "status": "Upcoming"
}</pre>
      </td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing user_id"<br>
        - "Missing title"<br>
        - "Missing description"<br>
        - "Missing start_date"<br>
        - "Missing end_date"<br>
        - "Missing status"<br>
        - "Internal Server Error from finding user"<br>
        - "User not found!"<br>
        - "Internal Server Error from creating new event"<br><br>
        <strong>Success case:</strong><br>
        - "New event added to calendar, 1 record inserted"
      </td>
    </tr>
    <tr>
      <td><strong>Get specific calendar event by event id</strong></td>
      <td>GET: <code>/events/:id?user_id={id}</code></td>
      <td>-</td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing event_id parameter"<br>
        - "Missing user_id parameter"<br>
        - "Internal Server Error from finding event"<br>
        - "Event not found!"<br><br>
        <strong>Success case:</strong><br>
        <pre>{
  "event_id": 2,
  "user_id": 1,
  "title": "Singing Contest",
  "description": "I'm a superstar, I'm your father!!!",
  "start_date": "2024-06-20 17:00:00",
  "end_date": "2024-07-01 22:59:59",
  "status": "Upcoming",
  "created_at": "2024-06-18 21:58:54",
  "last_modified": "2024-06-18 21:58:54"
}</pre>
      </td>
    </tr>
    <tr>
      <td><strong>Partial or full update calendar event by event id</strong></td>
      <td>PUT: <code>/events/:id</code></td>
      <td>
        <pre>{
  "user_id": 1,
  "title": "Kill Dedede",
  "description": "I will be a rebel. LMAO, I hate him",
  "start_date": "2024-06-01 21:00:00",
  "end_date": "2024-06-30 23:59:59",
  "status": "Upcoming"
}</pre>
      </td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing event_id parameter"<br>
        - "Missing user_id"<br>
        - "No fields to update"<br>
        - "Internal Server Error from finding event"<br>
        - "Event not found!"<br>
        - "Internal Server Error from updating event"<br><br>
        <strong>Success case:</strong><br>
        - "Calendar event updated, 1 record updated"
      </td>
    </tr>
    <tr>
      <td><strong>Delete calendar event by event id</strong></td>
      <td>DELETE: <code>/events/:id?user_id={id}</code></td>
      <td>-</td>
      <td>
        <strong>Error cases:</strong><br>
        - "Missing event_id parameter"<br>
        - "Missing user_id parameter"<br>
        - "Internal Server Error from finding event"<br>
        - "Event not found"<br>
        - "Internal Server Error from deleting event"<br><br>
        <strong>Success case:</strong><br>
        - "Calendar event deleted, 1 record deleted"
      </td>
    </tr>
  </tbody>
</table>

## Future Plan
- Add more features, such as filtering, searching by keyword, edit profile, and so forth.
- Modify some database for future requirements support.
- Frontend implementation followed by my Components Library and Design Systems in my final section below.
- Add automatically Unit tesing for all API endpoints using Jest and Supertest.
- Integration testing between Frontend and Backend

## Components Library
### Color Palette
| Color | Color Code |
|-------|------------|
| ![#FF21B3](https://via.placeholder.com/15/FF21B3/000000?text=+) | #FF21B3 |
| ![#FF88D5](https://via.placeholder.com/15/FF88D5/000000?text=+) | #FF88D5 |
| ![#FFB8E6](https://via.placeholder.com/15/FFB8E6/000000?text=+) | #FFB8E6 |
| ![#FFE8F6](https://via.placeholder.com/15/FFE8F6/000000?text=+) | #FFE8F6 |
| ![#FFB9B8](https://via.placeholder.com/15/FFB9B8/000000?text=+) | #FFB9B8 |
| ![#FF8A89](https://via.placeholder.com/15/FF8A89/000000?text=+) | #FF8A89 |
| ![#F65353](https://via.placeholder.com/15/F65353/000000?text=+) | #F65353 |
| ![#007AFF](https://via.placeholder.com/15/007AFF/000000?text=+) | #007AFF |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |
| ![#xxx](https://via.placeholder.com/15/xxx/000000?text=+) | #xxx |

---

Please feel free to suggest your feedback to my project. Thanks for watching!
