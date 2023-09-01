# Social_Network
## Summary
A simple REST JSON API for a social network written in NodeJS and Express. In this social network, as usual, there are users with profile info as well as friends. Every user role can be either 'admin' (associated with 0) and 'end user' (associated with 1). Admin can fetch and modify information about all users. Also he can create and delete users. On the other hand end user has access to his profile information only. All users can upload their avatar picture.

## Installation
1. Make sure you have [Postgres](https://www.postgresql.org/) installed on your machine.
2. In the top level of the application open terminal and type `npm install` to install dependencies.
3. Here is a list of environmental variables and example values that have to be passed in order to configure the application (via `.env` file on the top level of the app or *manually* when starting the web server):
    > PORT=4000  
    > DB_USERNAME=postgres  
    > DB_PASSWORD=test  
    > DATABASE=test  
    > DB_HOST=localhost  
    > SECRET=supertopsecret
    > ADMIN_PASSWORD=admin123
    * ADMIN_PASSWORD is used if and only if in users Postgres table there is no user admin. If that is the case, user with username *admin* is created in the database with this password.
4. On top level of the application open terminal and type `node server.js` to run the web server. 
5. You are all set!

## Endpoints
### Endpoints only user with role __admin__ can access
- GET /api/users?page=:page - retrieve users with pagination
- POST /api/users - create user with username, email (optional), password and role (0 or 1 if application is not extended to have more than two roles). All of these properties are passed to the request body.
- PATCH /api/users/:id/password - modify password to user with this particular id. A field named `password` is passed in the request body.
- DELETE /api/users/:id - delete user with this particular id.

### Endpoints for authentication
- POST /api/auth/login - self-explanatory. Fields `username` and `password` are passed to the request body.
- POST /api/auth/logout

### Endpoints only __end user__ can access
- POST /api/user/friends - add friend with username `friendUsername` (passed to the request body) to the friends list of the currently logged in user
- DELETE /api/user/friends - deletes friend with username `friendUsername` (passed to the request body)

### Endpoints all users can access
- GET /api/user - get information about currently logged in user
- PATCH /api/user/{property: username, email, password} - edit information about {property} (passed to the request body)
- POST /api/user/avatar - add profile picture to the currently logged in user. A property with type *file* has to be passed to the request body.

* Every endpoint has some internal validations like email, password and username validations.

## Some of the used libraries
- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/) (for making queries to the database)
- [Cookie-parser](https://www.npmjs.com/package/cookie-parser) (for storing the token for authentication instead of passing it to all the requests as header)
- [Bcrypt](https://www.npmjs.com/package/bcrypt) (for protecting the password)
- [Multer](https://www.npmjs.com/package/multer) (for creating and saving image avatars)