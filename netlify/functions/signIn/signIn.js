//signIn
const bcrypt = require("bcrypt");
const { createClient } = require("../../server.js");
const jwt = require('jsonwebtoken');

const handler = async (event) => {
  const dbClient = createClient();
  let errorStatusCode = 500;

  try {
    // 1. Connect to the database and get a reference to the `users` collection
    await dbClient.connect();
    const users = dbClient.usersCollection();

    // 2. Get the email and password from the request body
    const { email, password } = JSON.parse(event.body);

    // 3. Check to see if the user exists, if not return error (401 Unauthorized)
    const existingUser = await users.findOne({ email });
    if (existingUser == null) {
      errorStatusCode = 401;
      throw new Error(`Invalid password or email`);
    }

    // 4. Compare the password, if it doesn't match return error (401 Unauthorized)
    const matches = await bcrypt.compare(password, existingUser.password);
    if (!matches) {
      errorStatusCode = 401;
      throw new Error(`Invalid password or email`);
    }

    // 5. Create a JWT and serialize as a secure http-only cookie
    const userId = existingUser._id;
    const name = existingUser.name;
    const mobile = existingUser.mobile;
    const status = existingUser.status;
    const role = existingUser.role;
    const token = jwt.sign({ _id: email }, process.env.SECRETKEY, {
      expiresIn: '10d'
    })

    // 6. Return the user id and a Set-Cookie header with the JWT cookie
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId, token, email, name, mobile, status, role }),
    };
  } catch (err) {
    return {
      statusCode: errorStatusCode,
      body: JSON.stringify({ msg: err.message }),
    };
  } finally {
    dbClient.close();
  }
};

module.exports = { handler };
