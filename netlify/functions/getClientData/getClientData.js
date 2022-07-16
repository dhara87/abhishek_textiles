const { createClient } = require("../../server.js");
const jwt = require("jsonwebtoken");

const handler = async (event) => {
  const dbUser = createClient();
  await dbUser.connect();

  if (
    event.headers.authorization &&
    event.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const users = dbUser.usersCollection();
      token = event.headers.authorization.split(" ")[1];

      if (!token) {
        throw new Error(`Not authorized, no token`);
      }

      //decodes token id
      const decoded = await jwt.verify(token, process.env.SECRETKEY);
      const findUser = decoded._id;

      const user = await users.findOne({ email: findUser });
      event.user = user;

      if (event.user !== null && event.user.status === "true") {
        console.log("Authorized");
        const discussion = dbUser.clientCollection();
        const userId = event.user._id;

        const bodyData = await discussion.find({ uid: userId }).toArray();

        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        };
      } else {
        throw new Error("Not authorized, token failed1");
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
};

module.exports = { handler };
