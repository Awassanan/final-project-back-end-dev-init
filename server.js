const express = require("express");
const app = express();
const port = 3000;
const bcrypt = require("bcrypt");
const { format } = require("date-fns");

function mySQLDateTimeNow() {
  return format(new Date(), "yyyy-MM-dd HH:mm:ss");
}

// DB connection
const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "todofinalproj",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");

  // Init Users Table
  const usersTable = `CREATE TABLE IF NOT EXISTS todofinalproj.users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL,
  last_login DATETIME NOT NULL,
  PRIMARY KEY (user_id),
  UNIQUE INDEX username_UNIQUE (username ASC) VISIBLE);`;

  con.query(usersTable, function (err, result) {
    if (err) throw err;
    console.log("Users Table created");
  });

  // Init Daily Logs Table
  const dailyLogsTable = `CREATE TABLE IF NOT EXISTS todofinalproj.daily_logs (
  log_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  content TEXT NOT NULL,
  date DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  last_modified DATETIME NOT NULL,
  PRIMARY KEY (log_id),
  INDEX idx_daily_logs_user_id (user_id ASC) VISIBLE,
  CONSTRAINT fk_daily_logs_user_id
    FOREIGN KEY (user_id)
    REFERENCES todofinalproj.users (user_id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT);`;

  con.query(dailyLogsTable, function (err, result) {
    if (err) throw err;
    console.log("Daily Logs Table created");
  });

  // Init Todo List Table
  const todoListTable = `CREATE TABLE IF NOT EXISTS todofinalproj.todo_list (
  todo_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  due_date DATETIME NOT NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL,
  status ENUM('Pending', 'Completed', 'Past Due') NOT NULL,
  created_at DATETIME NOT NULL,
  last_modified DATETIME NOT NULL,
  PRIMARY KEY (todo_id),
  INDEX idx_todo_user_id (user_id ASC) VISIBLE,
  CONSTRAINT fk_todo_user_id
    FOREIGN KEY (user_id)
    REFERENCES todofinalproj.users (user_id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT);
`;

  con.query(todoListTable, function (err, result) {
    if (err) throw err;
    console.log("Todo List Table created");
  });

  // Init Calendar Events Table
  const calendarEventsTable = `CREATE TABLE IF NOT EXISTS todofinalproj.calendar_events (
  event_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('Upcoming', 'Current', 'Past'),
  created_at DATETIME NOT NULL,
  last_modified DATETIME NOT NULL,
  PRIMARY KEY (event_id),
  INDEX idx_calendar_user_id (user_id ASC) VISIBLE,
  CONSTRAINT fk_calendar_user_id
    FOREIGN KEY (user_id)
    REFERENCES todofinalproj.users (user_id)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT);`;

  con.query(calendarEventsTable, function (err, result) {
    if (err) throw err;
    console.log("Calendar Events Table created");
  });
});

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

// parsing JSON
app.use(express.json());

// API Endpoint
// Sign Up or Register
app.post("/users/register", (req, res) => {
  if (!req.body.username) {
    console.error("Invalid username!");
    res.status(400).send("Invalid username!");
  } else if (!req.body.password) {
    console.error("Invalid password!");
    res.status(400).send("Invalid password!");
  } else if (!req.body.confirm_password) {
    console.error("Invalid confirm_password!");
    res.status(400).send("Invalid confirm_password!");
  } else if (!req.body.email) {
    console.error("Invalid email!");
    res.status(400).send("Invalid email!");
  } else {
    if (req.body.password !== req.body.confirm_password) {
      console.error("Password and Confirm password must be the same");
      return res
        .status(401)
        .send("Password and Confirm password must be the same");
    }
    const saltRounds = 10;
    const password = req.body.password;

    const promisePassword = bcrypt
      .hash(password, saltRounds)
      .then((hash) => {
        return hash;
      })
      .catch((err) => console.error(err.message));

    promisePassword.then((hashedPassword) => {
      const newUser = `INSERT INTO todofinalproj.users(
        username, password, email, created_at, last_login
        ) VALUES (?,?,?,?,?);`;

      con.query(
        newUser,
        [
          req.body.username,
          hashedPassword,
          req.body.email,
          mySQLDateTimeNow(),
          mySQLDateTimeNow(),
        ],
        function (err, result) {
          if (err) {
            if (err.errno === 1062) {
              console.error(err.message);
              res.status(400).send("Duplicate username, please try a new one");
            } else {
              console.error(err.message);
              res.status(500).send("Internal Server Error from registeration!");
            }
          } else {
            res
              .status(201)
              .send("User is registered successfully, 1 record inserted");
          }
        }
      );
    });
  }
});

// Sign In or Login
app.post("/users/login", (req, res) => {
  if (!req.body.username) {
    console.error("Invalid username!");
    res.status(400).send("Invalid username!");
  } else if (!req.body.password) {
    console.error("Invalid password!");
    res.status(400).send("Invalid password!");
  } else {
    const findPassword = `SELECT password FROM users WHERE username = ?;`;

    con.query(findPassword, [req.body.username], function (err, result) {
      if (err) {
        console.error(err.message);
        res.status(500).send("Internal server error from finding password");
      } else if (result.length === 0) {
        console.error("Username not found!");
        res.status(401).send("Username not found!");
      } else {
        const dbPassword = result[0].password;

        bcrypt
          .compare(req.body.password, dbPassword)
          .then((isMatch) => {
            if (isMatch) {
              const lastLogin = `UPDATE todofinalproj.users SET last_login = ? WHERE username = ?;`;

              con.query(
                lastLogin,
                [mySQLDateTimeNow(), req.body.username],
                function (err, updateResult) {
                  if (err) {
                    console.error(err.message);
                    res
                      .status(500)
                      .send("Internal Server Error from updating last login");
                  } else {
                    console.log("Last Login Updated!");
                    res.status(200).send("Login successful");
                  }
                }
              );
            } else {
              res.status(401).send("Incorrect credentials!");
            }
          })
          .catch((err) => {
            console.error(err.message);
            res.status(500).send("Internal Server Error from logging in");
          });
      }
    });
  }
});

// Get all Logs (per user per date)
app.get("/logs", (req, res) => {
  const userId = req.query.user_id;
  const selectedDate = req.query.selected_date;

  if (!userId) {
    return res.status(400).send("Missing user_id parameter");
  } else if (!selectedDate) {
    return res.status(400).send("Missing date parameter");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    console.error("Invalid date format. Please use YYYY-MM-DD.");
    return res.status(400).send("Invalid date format. Please use YYYY-MM-DD.");
  }

  const logQuery = `SELECT log_id, user_id, content,
      DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') AS date, 
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at, 
      DATE_FORMAT(last_modified, '%Y-%m-%d %H:%i:%s') AS last_modified
      FROM daily_logs WHERE user_id = ? AND date LIKE ?`;
  con.query(logQuery, [userId, selectedDate + "%"], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding log");
    }
    if (result.length === 0) {
      console.error("No log content");
      return res.status(204).send("No log content");
    }
    res.status(200).json(result);
  });
});

// Post new log
app.post("/logs", (req, res) => {
  if (!req.body.user_id) {
    console.error("Missing user_id");
    return res.status(400).send("Missing user_id");
  } else if (!req.body.content) {
    console.error("Missing content");
    return res.status(400).send("Missing content");
  } else if (!req.body.date) {
    console.error("Missing date");
    return res.status(400).send("Missing date");
  }

  const foundUser = `SELECT * FROM todofinalproj.users WHERE user_id = ?`;
  con.query(foundUser, [req.body.user_id], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding user");
    }
    if (result.length === 0) {
      console.error("User not found!");
      return res.status(404).send("User not found!");
    }

    const newLog = `INSERT INTO todofinalproj.daily_logs(
        user_id, content, date, created_at, last_modified
        ) VALUES (?,?,?,?,?);`;
    con.query(
      newLog,
      [
        req.body.user_id,
        req.body.content,
        format(req.body.date, "yyyy-MM-dd HH:mm:ss"),
        mySQLDateTimeNow(),
        mySQLDateTimeNow(),
      ],
      function (err, result) {
        if (err) {
          console.error(err.message);
          return res
            .status(500)
            .send("Internal Server Error from creating new log");
        }
        res.status(201).send("New log entry added, 1 record inserted");
      }
    );
  });
});

// Get specific log
app.get("/logs/:id", (req, res) => {
  const logId = req.params.id;
  const userId = req.query.user_id;

  // Only authorized user can get his/her logs
  if (!logId) {
    console.error("Missing log_id parameter");
    return res.status(400).send("Missing log_id parameter");
  } else if (!userId) {
    console.error("Missing user_id parameter");
    return res.status(400).send("Missing user_id parameter");
  }

  const logQuery = `SELECT log_id, user_id, content,
      DATE_FORMAT(date, '%Y-%m-%d %H:%i:%s') AS date, 
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at, 
      DATE_FORMAT(last_modified, '%Y-%m-%d %H:%i:%s') AS last_modified 
      FROM daily_logs WHERE log_id = ? AND user_id = ?`;
  con.query(logQuery, [logId, userId], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding log");
    }
    if (result.length === 0) {
      console.error("Log not found!");
      return res.status(404).send("Log not found!");
    }
    res.status(200).json(result[0]);
  });
});

// Update log
app.put("/logs/:id", (req, res) => {
  const logId = req.params.id;

  if (!logId) {
    console.error("Missing log_id parameter");
    return res.status(400).send("Missing log_id parameter");
  } else if (!req.body.user_id) {
    console.error("Missing user_id");
    return res.status(400).send("Missing user_id");
  }

  // Validate fields based on the request type (full update or not)
  const isFullUpdate = req.body.content || req.body.date;

  if (!isFullUpdate) {
    console.error("No fields to update");
    return res.status(400).send("No fields to update");
  }

  const foundLog = `SELECT * FROM daily_logs WHERE log_id = ? AND user_id = ?`;
  con.query(foundLog, [logId, req.body.user_id], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding log");
    }
    if (result.length === 0) {
      console.error("Log not found!");
      return res.status(404).send("Log not found!");
    }

    // Build the update query dynamically
    let updateQuery = "UPDATE daily_logs SET ";
    const updateValues = [];

    if (req.body.content !== undefined) {
      updateQuery += "content = ?, ";
      updateValues.push(req.body.content);
    }
    if (req.body.date !== undefined) {
      updateQuery += "date = ?, ";
      updateValues.push(req.body.date);
    }

    updateQuery += "last_modified = ? WHERE log_id = ? AND user_id = ?";
    updateValues.push(mySQLDateTimeNow(), logId, req.body.user_id);

    con.query(updateQuery, updateValues, function (err, result) {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Internal Server Error from updating log");
      }
      res.status(200).send("Log entry updated successfully");
    });
  });
});

// // old approach
// app.put("/logs/:id", (req, res) => {
//   const logId = req.params.id;

//   if (!logId) {
//     console.error("Missing log_id parameter");
//     return res.status(400).send("Missing log_id parameter");
//   } else if (!req.body.user_id) {
//     console.error("Missing user_id");
//     return res.status(400).send("Missing user_id");
//   } else if (!req.body.content) {
//     console.error("Missing content");
//     return res.status(400).send("Missing content");
//   } else if (!req.body.date) {
//     console.error("Missing date");
//     return res.status(400).send("Missing date");
//   }

//   const foundLog = `SELECT * FROM daily_logs WHERE log_id = ? AND user_id = ?`;
//   con.query(
//     foundLog,
//     [req.body.log_id, req.body.user_id],
//     function (err, result) {
//       if (err) {
//         console.error(err.message);
//         return res.status(500).send("Internal Server Error from finding log");
//       }
//       if (result.length === 0) {
//         console.error("Log not found!");
//         return res.status(404).send("Log not found!");
//       }

//       const updateLog = `UPDATE todofinalproj.daily_logs
//       SET content = ?, date = ?, last_modified = ?
//       WHERE log_id = ? AND user_id = ?;`;
//       con.query(
//         updateLog,
//         [
//           req.body.content,
//           format(req.body.date, "yyyy-MM-dd HH:mm:ss"),
//           mySQLDateTimeNow(),
//           logId,
//           req.body.user_id,
//         ],
//         function (err, result) {
//           if (err) {
//             console.error(err.message);
//             return res
//               .status(500)
//               .send("Internal Server Error from creating new log");
//           }
//           res
//             .status(201)
//             .send("Log entry updated successfully, 1 record updated");
//         }
//       );
//     }
//   );
// });

// Delete log
app.delete("/logs/:id", (req, res) => {
  const logId = req.params.id;
  const userId = req.query.user_id;

  if (!logId) {
    console.error("Missing log_id parameter");
    return res.status(400).send("Missing log_id parameter");
  } else if (!userId) {
    console.error("Missing user_id parameter");
    return res.status(400).send("Missing user_id parameter");
  }

  // Only user that corresponding to that log_id can delete his/her log
  const foundLog = `SELECT * FROM todofinalproj.daily_logs
  WHERE log_id = ? AND user_id = ?;`;
  con.query(foundLog, [logId, userId], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding log");
    }
    if (result.length === 0) {
      console.error("Log not found");
      return res.status(404).send("Log not found");
    }

    const deleteLog = `DELETE FROM todofinalproj.daily_logs
    WHERE log_id = ? AND user_id = ?;`;

    con.query(deleteLog, [logId, userId], function (err, result) {
      if (err) {
        console.error(err.message);
        return res.status(500).send("Internal Server Error from deleting log");
      }

      console.log("Log entry deleted successfully, 1 record deleted");
      return res
        .status(200)
        .send("Log entry deleted successfully, 1 record deleted");
    });
  });
});

// Get all to-do list (per user per this month due date)
app.get("/todos", (req, res) => {
  const userId = req.query.user_id;
  const selectedDate = req.query.selected_date;

  if (!userId) {
    console.error("Missing user_id parameter");
    return res.status(400).send("Missing user_id parameter");
  } else if (!selectedDate) {
    console.error("Missing selected_date parameter");
    return res.status(400).send("Missing selected_date parameter");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    console.error("Invalid date format. Please use YYYY-MM-DD.");
    return res.status(400).send("Invalid date format. Please use YYYY-MM-DD.");
  }

  const todo = `SELECT todo_id, user_id, title, description,
  DATE_FORMAT(due_date, '%Y-%m-%d %H:%i:%s') AS due_date,
  priority, status,
  DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at, 
  DATE_FORMAT(last_modified, '%Y-%m-%d %H:%i:%s') AS last_modified
  FROM todofinalproj.todo_list
  WHERE user_id = ? AND MONTH(due_date) = ? AND YEAR(due_date) = ?;`;

  // extract month and year
  const year = selectedDate.substring(0, 4);
  const month = selectedDate.substring(5, 7);

  con.query(todo, [userId, month, year], function (err, result) {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .send("Internal Server Error from finding to-do list");
    }
    if (result.length === 0) {
      console.log("No to-do content");
      return res.status(204).send("No to-do content");
    }

    return res.status(200).send(result);
  });
});

// Post todo
app.post("/todos", (req, res) => {
  if (!req.body.user_id) {
    console.error("Missing user_id");
    return res.status(400).send("Missing user_id");
  } else if (!req.body.title) {
    console.error("Missing title");
    return res.status(400).send("Missing title");
  } else if (!req.body.description) {
    console.error("Missing description");
    return res.status(400).send("Missing description");
  } else if (!req.body.due_date) {
    console.error("Missing due_date");
    return res.status(400).send("Missing due_date");
  } else if (!req.body.priority) {
    console.error("Missing priority");
    return res.status(400).send("Missing priority");
  } else if (!req.body.status) {
    console.error("Missing status");
    return res.status(400).send("Missing status");
  }

  const foundUser = `SELECT * FROM todofinalproj.users WHERE user_id = ?`;
  con.query(foundUser, [req.body.user_id], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding user");
    }
    if (result.length === 0) {
      console.error("User not found!");
      return res.status(404).send("User not found!");
    }

    const newTodo = `INSERT INTO todofinalproj.todo_list(
        user_id, title, description, due_date,
        priority, status, created_at, last_modified
        ) VALUES (?,?,?,?,?,?,?,?);`;
    con.query(
      newTodo,
      [
        req.body.user_id,
        req.body.title,
        req.body.description,
        req.body.due_date,
        req.body.priority,
        req.body.status,
        mySQLDateTimeNow(),
        mySQLDateTimeNow(),
      ],
      function (err, result) {
        if (err) {
          console.error(err.message);
          return res
            .status(500)
            .send("Internal Server Error from creating new todo");
        }

        console.log("New to-do added, 1 record inserted");
        return res.status(201).send("New to-do added, 1 record inserted");
      }
    );
  });
});

// Get specific todo
app.get("/todos/:id", (req, res) => {
  const todoId = req.params.id;
  const userId = req.query.user_id;

  // Only authorized user can get his/her todos
  if (!todoId) {
    console.error("Missing todo_id parameter");
    return res.status(400).send("Missing todo_id parameter");
  } else if (!userId) {
    console.error("Missing user_id parameter");
    return res.status(400).send("Missing user_id parameter");
  }

  const todoQuery = `SELECT todo_id, user_id, title, description,
      DATE_FORMAT(due_date, '%Y-%m-%d %H:%i:%s') AS due_date, priority, status,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at, 
      DATE_FORMAT(last_modified, '%Y-%m-%d %H:%i:%s') AS last_modified 
      FROM todo_list WHERE todo_id = ? AND user_id = ?`;
  con.query(todoQuery, [todoId, userId], function (err, result) {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .send("Internal Server Error from finding to-do lists");
    }
    if (result.length === 0) {
      console.error("To-do not found!");
      return res.status(404).send("To-do not found!");
    }
    res.status(200).json(result[0]);
  });
});

// Update todo detail and/or status
app.put("/todos/:id", (req, res) => {
  const todoId = req.params.id;

  if (!todoId) {
    console.error("Missing todo_id parameter");
    return res.status(400).send("Missing todo_id parameter");
  } else if (!req.body.user_id) {
    console.error("Missing user_id");
    return res.status(400).send("Missing user_id");
  }

  // Validate fields based on the request type (full update or status update)
  const isFullUpdate =
    req.body.title ||
    req.body.description ||
    req.body.due_date ||
    req.body.priority ||
    req.body.status !== undefined;

  if (!isFullUpdate) {
    console.error("No fields to update");
    return res.status(400).send("No fields to update");
  }

  const foundTodo = `SELECT * FROM todo_list WHERE todo_id = ? AND user_id = ?`;
  con.query(foundTodo, [todoId, req.body.user_id], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding to-do");
    }
    if (result.length === 0) {
      console.error("To-do not found!");
      return res.status(404).send("To-do not found!");
    }

    // Build the update query dynamically
    let updateQuery = "UPDATE todo_list SET ";
    const updateValues = [];

    if (req.body.title !== undefined) {
      updateQuery += "title = ?, ";
      updateValues.push(req.body.title);
    }
    if (req.body.description !== undefined) {
      updateQuery += "description = ?, ";
      updateValues.push(req.body.description);
    }
    if (req.body.due_date !== undefined) {
      updateQuery += "due_date = ?, ";
      updateValues.push(req.body.due_date);
    }
    if (req.body.priority !== undefined) {
      updateQuery += "priority = ?, ";
      updateValues.push(req.body.priority);
    }
    if (req.body.status !== undefined) {
      updateQuery += "status = ?, ";
      updateValues.push(req.body.status);
    }

    updateQuery += "last_modified = ? WHERE todo_id = ? AND user_id = ?";
    updateValues.push(mySQLDateTimeNow(), todoId, req.body.user_id);

    con.query(updateQuery, updateValues, function (err, result) {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .send("Internal Server Error from updating to-do");
      }
      res.status(200).send("Todo entry updated successfully, 1 record updated");
    });
  });
});

// Delete todo
app.delete("/todos/:id", (req, res) => {
  const todoId = req.params.id;
  const userId = req.query.user_id;

  if (!todoId) {
    console.error("Missing todo_id parameter");
    return res.status(400).send("Missing todo_id parameter");
  } else if (!userId) {
    console.error("Missing user_id parameter");
    return res.status(400).send("Missing user_id parameter");
  }

  // Only user that corresponding to that todo_id can delete his/her todo
  const foundTodo = `SELECT * FROM todofinalproj.todo_list
  WHERE todo_id = ? AND user_id = ?;`;
  con.query(foundTodo, [todoId, userId], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding to-do");
    }
    if (result.length === 0) {
      console.error("Todo not found");
      return res.status(404).send("Todo not found");
    }

    const deleteTodo = `DELETE FROM todofinalproj.todo_list
    WHERE todo_id = ? AND user_id = ?;`;

    con.query(deleteTodo, [todoId, userId], function (err, result) {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .send("Internal Server Error from deleting to-do");
      }

      console.log("Todo entry deleted successfully, 1 record deleted");
      return res
        .status(200)
        .send("Todo entry deleted successfully, 1 record deleted");
    });
  });
});

// Get all calendar events (per user per selected month and year)
app.get("/events", (req, res) => {
  const userId = req.query.user_id;
  const selectedDate = req.query.selected_date;

  if (!userId) {
    console.error("Missing user_id parameter");
    return res.status(400).send("Missing user_id parameter");
  } else if (!selectedDate) {
    console.error("Missing selected_date parameter");
    return res.status(400).send("Missing selected_date parameter");
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
    console.error("Invalid date format. Please use YYYY-MM-DD.");
    return res.status(400).send("Invalid date format. Please use YYYY-MM-DD.");
  }

  const year = selectedDate.substring(0, 4);
  const month = selectedDate.substring(5, 7);

  // Calculate the start and end of the selected month
  const startOfMonth = `${year}-${month}-01 00:00:00`;
  const endOfMonth = `${year}-${month}-${new Date(
    year,
    month,
    0
  ).getDate()} 23:59:59`;

  const query = `
    SELECT event_id, user_id, title, description,
           DATE_FORMAT(start_date, '%Y-%m-%d %H:%i:%s') AS start_date,
           DATE_FORMAT(end_date, '%Y-%m-%d %H:%i:%s') AS end_date, status,
           DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at, 
           DATE_FORMAT(last_modified, '%Y-%m-%d %H:%i:%s') AS last_modified
    FROM todofinalproj.calendar_events
    WHERE user_id = ?
      AND (start_date <= ? AND end_date >= ?);
  `;

  con.query(query, [userId, endOfMonth, startOfMonth], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding events");
    }
    if (result.length === 0) {
      console.log("No calendar events in this month");
      return res.status(204).send("No calendar events in this month");
    }

    return res.status(200).send(result);
  });
});

// Post new event
app.post("/events", (req, res) => {
  if (!req.body.user_id) {
    console.error("Missing user_id");
    return res.status(400).send("Missing user_id");
  } else if (!req.body.title) {
    console.error("Missing title");
    return res.status(400).send("Missing title");
  } else if (!req.body.description) {
    console.error("Missing description");
    return res.status(400).send("Missing description");
  } else if (!req.body.start_date) {
    console.error("Missing start_date");
    return res.status(400).send("Missing start_date");
  } else if (!req.body.end_date) {
    console.error("Missing end_date");
    return res.status(400).send("Missing end_date");
  } else if (!req.body.status) {
    console.error("Missing status");
    return res.status(400).send("Missing status");
  }

  const foundUser = `SELECT * FROM todofinalproj.users WHERE user_id = ?`;
  con.query(foundUser, [req.body.user_id], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding user");
    }
    if (result.length === 0) {
      console.error("User not found!");
      return res.status(404).send("User not found!");
    }

    const newTodo = `INSERT INTO todofinalproj.calendar_events(
        user_id, title, description, start_date, end_date, status, created_at, last_modified
        ) VALUES (?,?,?,?,?,?,?,?);`;
    con.query(
      newTodo,
      [
        req.body.user_id,
        req.body.title,
        req.body.description,
        req.body.start_date,
        req.body.end_date,
        req.body.status,
        mySQLDateTimeNow(),
        mySQLDateTimeNow(),
      ],
      function (err, result) {
        if (err) {
          console.error(err.message);
          return res
            .status(500)
            .send("Internal Server Error from creating new event");
        }

        console.log("New event added to calendar, 1 record inserted");
        return res
          .status(201)
          .send("New event added to calendar, 1 record inserted");
      }
    );
  });
});

// Get specific event
app.get("/events/:id", (req, res) => {
  const eventId = req.params.id;
  const userId = req.query.user_id;

  // Only authorized user can get his/her events
  if (!eventId) {
    console.error("Missing event_id parameter");
    return res.status(400).send("Missing event_id parameter");
  } else if (!userId) {
    console.error("Missing user_id parameter");
    return res.status(400).send("Missing user_id parameter");
  }

  const eventQuery = `SELECT event_id, user_id, title, description,
      DATE_FORMAT(start_date, '%Y-%m-%d %H:%i:%s') AS start_date,
      DATE_FORMAT(end_date, '%Y-%m-%d %H:%i:%s') AS end_date, status,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at, 
      DATE_FORMAT(last_modified, '%Y-%m-%d %H:%i:%s') AS last_modified 
      FROM calendar_events WHERE event_id = ? AND user_id = ?`;
  con.query(eventQuery, [eventId, userId], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding event");
    }
    if (result.length === 0) {
      console.error("Event not found!");
      return res.status(404).send("Event not found!");
    }
    res.status(200).json(result[0]);
  });
});

// Update event
app.put("/events/:id", (req, res) => {
  const eventId = req.params.id;

  if (!eventId) {
    console.error("Missing event_id parameter");
    return res.status(400).send("Missing event_id parameter");
  } else if (!req.body.user_id) {
    console.error("Missing user_id");
    return res.status(400).send("Missing user_id");
  }

  // Validate fields based on the request type (full update or status update)
  const isFullUpdate =
    req.body.title ||
    req.body.description ||
    req.body.start_date ||
    req.body.end_date ||
    req.body.status !== undefined;

  if (!isFullUpdate) {
    console.error("No fields to update");
    return res.status(400).send("No fields to update");
  }

  const foundEvent = `SELECT * FROM calendar_events WHERE event_id = ? AND user_id = ?`;
  con.query(foundEvent, [eventId, req.body.user_id], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding event");
    }
    if (result.length === 0) {
      console.error("Event not found!");
      return res.status(404).send("Event not found!");
    }

    // Build the update query dynamically
    let updateQuery = "UPDATE calendar_events SET ";
    const updateValues = [];

    if (req.body.title !== undefined) {
      updateQuery += "title = ?, ";
      updateValues.push(req.body.title);
    }
    if (req.body.description !== undefined) {
      updateQuery += "description = ?, ";
      updateValues.push(req.body.description);
    }
    if (req.body.start_date !== undefined) {
      updateQuery += "start_date = ?, ";
      updateValues.push(req.body.start_date);
    }
    if (req.body.end_date !== undefined) {
      updateQuery += "end_date = ?, ";
      updateValues.push(req.body.end_date);
    }
    if (req.body.status !== undefined) {
      updateQuery += "status = ?, ";
      updateValues.push(req.body.status);
    }

    updateQuery += "last_modified = ? WHERE event_id = ? AND user_id = ?";
    updateValues.push(mySQLDateTimeNow(), eventId, req.body.user_id);

    con.query(updateQuery, updateValues, function (err, result) {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .send("Internal Server Error from updating event");
      }
      res.status(200).send("Calendar event updated, 1 record updated");
    });
  });
});

// Delete event
app.delete("/events/:id", (req, res) => {
  const eventId = req.params.id;
  const userId = req.query.user_id;

  if (!eventId) {
    console.error("Missing event_id parameter");
    return res.status(400).send("Missing event_id parameter");
  } else if (!userId) {
    console.error("Missing user_id parameter");
    return res.status(400).send("Missing user_id parameter");
  }

  // Only user that corresponding to that event_id can delete his/her event
  const foundEvent = `SELECT * FROM todofinalproj.calendar_events
  WHERE event_id = ? AND user_id = ?;`;
  con.query(foundEvent, [eventId, userId], function (err, result) {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Internal Server Error from finding event");
    }
    if (result.length === 0) {
      console.error("Event not found");
      return res.status(404).send("Event not found");
    }

    const deleteEvent = `DELETE FROM todofinalproj.calendar_events
    WHERE event_id = ? AND user_id = ?;`;

    con.query(deleteEvent, [eventId, userId], function (err, result) {
      if (err) {
        console.error(err.message);
        return res
          .status(500)
          .send("Internal Server Error from deleting event");
      }

      console.log("Calendar event deleted, 1 record deleted");
      return res.status(200).send("Calendar event deleted, 1 record deleted");
    });
  });
});

// filter ? ถ้าทำทันค่อยทำละกันนะ ไม่ได้บังคับ นี่เป็น feature เสริม

// ---------------------- Cron Job ----------------------
const cron = require("node-cron");

// Automatically change todo status from Pending to Past Due When due_date is met
// Schedule a task to run every 10 minutes
cron.schedule("*/10 * * * *", () => {
  const updatePastDueQuery = `
  UPDATE todo_list
    SET status = 'Past Due', last_modified = ?
    WHERE status = 'Pending' AND due_date < NOW();
  `;

  con.query(updatePastDueQuery, [mySQLDateTimeNow()], function (err, result) {
    if (err) {
      console.error("Error updating past due todos:", err.message);
    } else {
      if (result.affectedRows === 0) {
        console.log("No past due todos found");
      } else {
        console.log(
          `${result.affectedRows} past due todos updated successfully`
        );
      }
    }
  });
});

// Automatically change event status from Upcoming to Current When start_date is met
// Schedule a task to run every 10 minutes
cron.schedule("*/10 * * * *", () => {
  const updatePastDueQuery = `
    UPDATE calendar_events
    SET status = 'Current', last_modified = ?
    WHERE status = 'Upcoming' AND start_date < NOW();
  `;

  con.query(updatePastDueQuery, [mySQLDateTimeNow()], function (err, result) {
    if (err) {
      console.error("Error updating current event:", err.message);
    } else {
      if (result.affectedRows === 0) {
        console.log("No current events found");
      } else {
        console.log(
          `${result.affectedRows} current events updated successfully`
        );
      }
    }
  });
});

// Automatically change event status from Current to Past When end_date is met
// Schedule a task to run every 10 minutes
cron.schedule("*/10 * * * *", () => {
  const updatePastDueQuery = `
    UPDATE calendar_events
    SET status = 'Past', last_modified = ?
    WHERE status = 'Current' AND end_date < NOW();
  `;

  con.query(updatePastDueQuery, [mySQLDateTimeNow()], function (err, result) {
    if (err) {
      console.error("Error updating past event:", err.message);
    } else {
      if (result.affectedRows === 0) {
        console.log("No past events found");
      } else {
        console.log(`${result.affectedRows} past events updated successfully`);
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at <http://localhost>:${port}/`);
});
