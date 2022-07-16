//signUp
const bcrypt = require("bcrypt");
const { createClient } = require("../../server.js");
// const { createJwtCookie } = require("../../jwt-helper.js");
const jwt = require("jsonwebtoken");

const handler = async (event) => {
  const dbClient = createClient();
  let errorStatusCode = 500;

  try {
    // get the email and password fron body
    const { name, mobile, email, password } = JSON.parse(event.body);

    await dbClient.connect();
    const users = dbClient.usersCollection();

    // check if user already exist
    const existUser = await users.findOne({ email });
    const existUser2 = await users.findOne({ mobile });

    if (existUser !== null) {
      errorStatusCode = 409;
      throw new Error(`A user already registered with this email: ${email}`);
    }

    if (existUser2 !== null) {
      errorStatusCode = 409;
      throw new Error(
        `A user already registered with this Mobile No.: ${mobile}`
      );
    }

    // password hashing
    const passwordHash = await bcrypt.hash(password, 10);

    const token = jwt.sign({ _id: email }, process.env.SECRETKEY, {
      expiresIn: "10d",
    });

    // insert the email and password in collection
    const { insertId } = await users.insertOne({
      token,
      name,
      mobile,
      email,
      role: 2,
      status: "false",
      password: passwordHash,
    });

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: insertId, token: token, name, email, mobile }),
    };
  } catch (err) {
    return {
      statusCode: errorStatusCode,
      body: JSON.stringify({ msg: err.message }),
    };
  } finally {
    dbClient.close;
  }
};

module.exports = { handler };
