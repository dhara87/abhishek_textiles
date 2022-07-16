//signIn
const bcrypt = require("bcrypt");
const { createClient } = require("../../server.js");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const handler = async (event) => {
  const dbClient = createClient();
  let errorStatusCode = 500;
  await dbClient.connect();
  const users = dbClient.usersCollection();

  if (
    event.headers.authorization &&
    event.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const users = dbClient.usersCollection();
      token = event.headers.authorization.split(" ")[1];

      if (!token) {
        throw new Error(`Not authorized, no token`);
      }

      //decodes token id
      const decoded = await jwt.verify(token, process.env.SECRETKEY);
      const findUser = decoded._id;

      const existingUser = await users.findOne({ email: findUser });
      event.user = existingUser;

      if (
        event.user !== null &&
        event.user.status === "true" &&
        event.user.role == 1
      ) {
        console.log("Authorized");
      } else {
        throw new Error("Not authorized, token failed");
      }
    } catch (error) {
      console.log(error);
      throw new Error("Something Went Wrong");
    }
  } else {
    throw new Error("No token found");
  }

  try {
    // 2. Get the email and password from the request body
    const { uid, password } = JSON.parse(event.body);
    // 3. Check to see if the user exists, if not return error (401 Unauthorized)
    const existingUser = await users.findOne({ _id: ObjectId(`${uid}`) });
    if (existingUser == null) {
      errorStatusCode = 401;
      throw new Error(`Invalid email`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    existingUser.password = passwordHash;
    // 5. Create a JWT and serialize as a secure http-only cookie
    const userId = existingUser._id;
    const name = existingUser.name;
    const email = existingUser.email;
    const mobile = existingUser.mobile;
    const status = existingUser.status;
    const role = existingUser.role;
    const token = jwt.sign({ _id: email }, process.env.SECRETKEY, {
      expiresIn: "10d",
    });


    await users.updateOne(
      { _id: ObjectId(`${uid}`) },
      {
        $set: {
          password: passwordHash,
        },
      }
    );

    // 6. Return the user id and a Set-Cookie header with the JWT cookie
    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
        token,
        email,
        name,
        mobile,
        status,
        role,
        message: "successfully password changed",
      }),
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
