const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const databasePath = path.join(__dirname, "userData.db");

const app = express();

app.use(express.json());

const JWT_SECRET = "your_secret_key"; // Replace with your actual secret key

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const validatePassword = (password) => {
  return password.length > 4;
};

// Middleware for authenticating JWT token
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return response.status(401).send("Access Token Required");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return response.status(403).send("Invalid Access Token");
    request.user = user;
    next();
  });
};

// Create a new user (Register)
app.post("/register", async (request, response) => {
  try {
    const { username, name, password, gender, location } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
    const databaseUser = await database.get(selectUserQuery);

    if (databaseUser === undefined) {
      const createUserQuery = `
      INSERT INTO
        user (username, name, password, gender, location)
      VALUES
        (
          '${username}',
          '${name}',
          '${hashedPassword}',
          '${gender}',
          '${location}'  
        );`;
      if (validatePassword(password)) {
        await database.run(createUserQuery);
        response.send("User created successfully");
      } else {
        response.status(400).send("Password is too short");
      }
    } else {
      response.status(400).send("User already exists");
    }
  } catch (error) {
    response.status(500).send("Server Error");
  }
});

// Login user and provide JWT token
app.post("/login", async (request, response) => {
  try {
    const { username, password } = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
    const databaseUser = await database.get(selectUserQuery);

    if (databaseUser === undefined) {
      response.status(400).send("Invalid user");
    } else {
      const isPasswordMatched = await bcrypt.compare(
        password,
        databaseUser.password
      );
      if (isPasswordMatched) {
        const token = jwt.sign(
          { username: databaseUser.username },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        console.log(token);
        response.json({ token });
      } else {
        response.status(400).send("Invalid password");
      }
    }
  } catch (error) {
    response.status(500).send("Server Error");
  }
});

// Change password
app.put("/change-password", authenticateToken, async (request, response) => {
  try {
    const { username, oldPassword, newPassword } = request.body;
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
    const databaseUser = await database.get(selectUserQuery);

    if (databaseUser === undefined) {
      response.status(400).send("Invalid user");
    } else {
      const isPasswordMatched = await bcrypt.compare(
        oldPassword,
        databaseUser.password
      );
      if (isPasswordMatched) {
        if (validatePassword(newPassword)) {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          const updatePasswordQuery = `
            UPDATE user
            SET password = '${hashedPassword}'
            WHERE username = '${username}';`;
          await database.run(updatePasswordQuery);
          response.send("Password updated");
        } else {
          response.status(400).send("Password is too short");
        }
      } else {
        response.status(400).send("Invalid current password");
      }
    }
  } catch (error) {
    response.status(500).send("Server Error");
  }
});

// Get all users
app.get("/users", authenticateToken, async (request, response) => {
  try {
    const getUsersQuery = `SELECT * FROM user;`;
    const users = await database.all(getUsersQuery);
    response.json(users);
  } catch (error) {
    response.status(500).send("Server Error");
  }
});

// Get a single user by username
app.get("/users/:username", authenticateToken, async (request, response) => {
  try {
    const { username } = request.params;
    const getUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
    const user = await database.get(getUserQuery);
    if (user === undefined) {
      response.status(404).send("User not found");
    } else {
      response.json(user);
    }
  } catch (error) {
    response.status(500).send("Server Error");
  }
});

// Update user information
app.put("/users/:username", authenticateToken, async (request, response) => {
  try {
    const { username } = request.params;
    const { name, password, gender, location } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const updateUserQuery = `
      UPDATE user
      SET
        name = '${name}',
        password = '${hashedPassword}',
        gender = '${gender}',
        location = '${location}'
      WHERE
        username = '${username}';`;

    await database.run(updateUserQuery);
    response.send("User updated successfully");
  } catch (error) {
    response.status(500).send("Server Error");
  }
});

// Delete a user
app.delete("/users/:username", authenticateToken, async (request, response) => {
  try {
    const { username } = request.params;
    const deleteUserQuery = `DELETE FROM user WHERE username = '${username}';`;

    await database.run(deleteUserQuery);
    response.send("User deleted successfully");
  } catch (error) {
    response.status(500).send("Server Error");
  }
});

module.exports = app;
