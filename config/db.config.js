const oracledb = require("oracledb");

const connectDB = async () => {
  try {
    // oracledb.initOracleClient({ libDir: "/opt/oracle/instantclient_19_8" });  // for thick mode
    const connection = await oracledb.getConnection({
      user: "sys",
      password: "admin",
      connectString: "localhost:1521/XE",
      privilege: oracledb.SYSDBA,
      // mode: oracledb.MODE_THICK
    });
    console.log("connected");
    return connection;
  } catch (error) {
    console.error("Error occurred while connecting:", error);
    throw error;
  }
};

module.exports = connectDB;