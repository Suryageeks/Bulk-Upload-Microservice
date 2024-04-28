const connectDB = require("../config/db.config");

const batchExcelInsert = async (data) => {
  let connection;
  try {
    connection = await connectDB();
    let query =
      "INSERT INTO test (abc, bcd, cde, def, efg, fgh, ghi, hij, ijk, jkl) VALUES (:A, :B, :C, :D, :E, :F, :G, :H, :I, :J)";
    const result = await connection.executeMany(query, data);
    await connection.commit();
    console.log("Data Inserted ", result);
  } catch (error) {
    console.error("Error occurred while insertion ", error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error occurr while closing connection", error);
      }
    }
  }
};

module.exports = batchExcelInsert;
