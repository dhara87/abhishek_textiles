//signUp

const jwt = require("jsonwebtoken");
const { createClient } = require("../../server.js");

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
      } else {
        throw new Error("Not authorized, token failed");
      }
    } catch (error) {
      console.log(error);
      throw new Error("Something Went Wrong");
    }
  }

  try {
    const {
      employee_Name,
      client_Email,
      client_Number,
      company_Name,
      place,
      time,
      discussion,
    } = JSON.parse(event.body);

    const discussions = dbUser.clientCollection();
    // insert the email and password in collection
    const { insertId } = await discussions.insertOne({
      uid: event.user._id,
      employee_Name,
      client_Email,
      client_Number,
      company_Name,
      place: place,
      time: time,
      discussion,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: insertId,
        employee_Name,
        client_Email,
        client_Number,
        company_Name,
        place,
        time,
        discussion,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }),
    };
  } finally {
    dbUser.close;
  }
};

module.exports = { handler };
