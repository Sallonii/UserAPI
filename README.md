# API Documentation

## Authentication

This API performs operations on the `user` table, which consists of the following columns:

**User Table**

| Column   | Type |
| -------- | ---- |
| username | TEXT |
| name     | TEXT |
| password | TEXT |
| gender   | TEXT |
| location | TEXT |

### API Endpoints

#### API 1: Register

**Path:** `/register`  
**Method:** `POST`

**Request:**

```json
{
  "username": "adam_richard",
  "name": "Adam Richard",
  "password": "richard_567",
  "gender": "male",
  "location": "Detroit"
}

Response Scenarios:

Scenario 1: Username already exists

Status code: 400
Status text: User already exists
Scenario 2: Password is too short

Status code: 400
Status text: Password is too short
Scenario 3: Successful registration

Status code: 200
Status text: User created successfully
API 2: Login
Path: /login
Method: POST

Request:

json
Copy code
{
  "username": "adam_richard",
  "password": "richard_567"
}
Response Scenarios:

Scenario 1: Unregistered user

Status code: 400
Status text: Invalid user
Scenario 2: Incorrect password

Status code: 400
Status text: Invalid password
Scenario 3: Successful login

Status code: 200
Status text: Login success!
Response body:
json
Copy code
{
  "token": "<JWT_TOKEN>"
}
API 3: Change Password
Path: /change-password
Method: PUT

Request:

json
Copy code
{
  "username": "adam_richard",
  "oldPassword": "richard_567",
  "newPassword": "richard@123"
}
Response Scenarios:

Scenario 1: Incorrect current password

Status code: 400
Status text: Invalid current password
Scenario 2: New password is too short

Status code: 400
Status text: Password is too short
Scenario 3: Successful password update

Status code: 200
Status text: Password updated
API 4: Get All Users
Path: /users
Method: GET
Authentication: Bearer Token

Response:

Status code: 200
Response body:
json
Copy code
[
  {
    "username": "adam_richard",
    "name": "Adam Richard",
    "gender": "male",
    "location": "Detroit"
  },
  ...
]
API 5: Get User by Username
Path: /users/:username
Method: GET
Authentication: Bearer Token

Response Scenarios:

Scenario 1: User not found

Status code: 404
Status text: User not found
Scenario 2: Successful retrieval

Status code: 200
Response body:
json
Copy code
{
  "username": "adam_richard",
  "name": "Adam Richard",
  "gender": "male",
  "location": "Detroit"
}
API 6: Update User Information
Path: /users/:username
Method: PUT
Authentication: Bearer Token

Request:

json
Copy code
{
  "name": "Adam Richard Updated",
  "password": "newpassword",
  "gender": "male",
  "location": "New York"
}
Response Scenarios:

Scenario 1: Successful update
Status code: 200
Status text: User updated successfully
API 7: Delete User
Path: /users/:username
Method: DELETE
Authentication: Bearer Token

Response Scenarios:

Scenario 1: Successful deletion
Status code: 200
Status text: User deleted successfully
Usage Guidelines
To ensure efficient and secure usage of the API, please follow these guidelines:

Authentication:

Use the JWT token provided upon successful login for all subsequent requests that require authentication.
Include the token in the Authorization header as Bearer <TOKEN>.
Rate Limiting:

Implement rate limiting on your client-side to avoid overwhelming the server with too many requests. A typical limit is 100 requests per minute per user.
Proper Error Handling:

Handle HTTP status codes properly:
200 for successful operations.
400 for bad requests (e.g., invalid input data).
401 for unauthorized requests (e.g., missing or invalid token).
403 for forbidden requests (e.g., invalid token).
404 for not found (e.g., user not found).
500 for server errors.
Display meaningful error messages to the end-user based on the status text received from the API.
Data Validation:

Validate input data on the client-side before sending requests to the API to reduce unnecessary server load and ensure data integrity.
Ensure passwords are at least 5 characters long and adhere to your application's security standards.
Security Best Practices:

Always use HTTPS to encrypt data in transit.
Store tokens securely on the client-side (e.g., in HTTP-only cookies or secure storage).
Avoid exposing sensitive information such as passwords or tokens in URLs.
By following these guidelines, you can ensure secure, efficient, and reliable interactions with the API.
```
