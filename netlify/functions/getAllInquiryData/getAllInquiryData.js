const { createClient } = require("../../server.js");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

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
      // const { uid } = JSON.parse(event.body);

      if (
        event.user !== null &&
        event.user.status === "true" &&
        event.user.role == 1
      ) {
        console.log("Admin Authorized");
        const discussion = dbUser.clientCollection();
        const data = await discussion.find().toArray();

        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        };
      } else {
        console.log("Admin not authorized");
        throw new Error("Something went wrong, Please try later...");
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
};

module.exports = { handler };
