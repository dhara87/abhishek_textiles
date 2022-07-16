const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const { createClient } = require("../../server.js");
const jwt = require("jsonwebtoken");

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
      if (event.user !== null && event.user.role === 1) {
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
    const { id, userStatus } = JSON.parse(event.body);

    // 3. Check to see if the user exists, if not return error (401 Unauthorized)
    const existingUser = await users.findOne({ _id: ObjectId(`${id}`) });
    if (existingUser == null) {
      errorStatusCode = 401;
      throw new Error(`Invalid email`);
    }

    if (existingUser.role === 1) {
      errorStatusCode = 401;
      throw new Error(`You can not change status of admin`);
    }

    const userId = existingUser._id;
    const name = existingUser.name;
    const status = userStatus;
    const role = existingUser.role;

    // await users.updateOne(
    //   { _id: userId },
    //   {
    //     $set: {
    //       name: name,
    //       status: status,
    //       role: role,
    //     },
    //   },
    //   { upsert: true }
    // );

    await users.updateOne(
      { _id: ObjectId(`${userId}`) },
      {
        $set: {
          name: name,
          status: status,
          role: role,
        },
      }
    );

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
        name,
        status,
        role,
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
