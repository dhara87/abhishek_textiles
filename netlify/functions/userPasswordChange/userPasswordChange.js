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

      if (event.user !== null && event.user.status === "true") {
        console.log("Authorized");

        const { password, newPassword } = JSON.parse(event.body);

        const matches = await bcrypt.compare(password, existingUser.password);

        if (!matches) {
          errorStatusCode = 401;
          throw new Error(`Invalid password or email`);
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        const token = jwt.sign({ _id: findUser }, process.env.SECRETKEY, {
          expiresIn: "10d",
        });

        const userId = existingUser._id;
        // const name = existingUser.name;
        // const mobile = existingUser.mobile;
        // const status = existingUser.status;
        // const role = existingUser.role;

        await users.updateOne(
          { _id: ObjectId(`${userId}`) },
          {
            $set: {
              token: token,
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
            // name,
            // mobile,
            // status,
            // role,
            message: "Password Changed",
          }),
        };
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Not Authorized",
          }),
        };
        // throw new Error("Not authorized, token failed");
      }
    } catch (error) {
      console.log(error);
      throw new Error("Old Password is Incorrect")
      // return {
      //   statusCode: 500,
      //   body: JSON.stringify({
      //     message: "",
      //   }),
      // };
    }
  } else {
    throw new Error("No token found");
  }
};

module.exports = { handler };
