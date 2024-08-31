# Tic-Tac-Toe Extended

This is a full-stack Tic-Tac-Toe game application built with React.js (frontend) and Node.js (backend).

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/)

## Installation

1. **Clone the repository:**
 
   ```bash
   git clone https://github.com/iamdineshbasnet/tic-tac-toe-extended.git
   
   cd tic-tac-toe-extended
   ```
2. **Install dependencies for both client and server:**
   
   ```bash
   # For Server
   cd server
   
   npm install

   # For Client
   cd client
   
   npm install
   ```

3. **Environment Setup:**

   **Client**

   Create a .env file in the client directory with the following content:

   ```bash
   REACT_APP_BASE_URL=
   REACT_APP_VERSION=
   ```

   **Server**
   
   Create a .env file in the server directory with the following content:

   ```bash
   # PORT=3000
   # MONGO_URI=
   # ALLOWED_HOST=
   # ACCESS_TOKEN_SECRET=
   # REFRESH_TOKEN_SECRET=
   # VERSION=
   ```

   generate a secret for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` using the following command:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
## Running the Project

1. Start the Node.js server:
   
   ```bash
   cd server
   npm run dev
   ```

2. Start the React.js app:
   
   ```bash
   cd client
   npm run dev
   ```

## Contributing
If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.
