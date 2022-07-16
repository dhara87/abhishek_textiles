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

      if (event.user !== null && event.user.status === "true" && event.user.role == 1) {
        console.log("Admin Authorized");
        const userId = event.user._id;
        const users = dbUser.usersCollection();
        // const data = await discussion.find({ uid: userId }).toArray();
        const employeeList = await users.find({role : 2}).toArray();

        return {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeList),
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
