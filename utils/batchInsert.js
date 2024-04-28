const connectDB = require("../config/db.config");

const batchInsert = async (data) => {
  let connection;
  try {
    connection = await connectDB();

    let query =
      "INSERT INTO test (abc, bcd, cde, def, efg, fgh, ghi, hij, ijk, jkl) VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10)";

    let bindData = data.map((val) => {
      return val.slice(0, 10);
    });

    const result = await connection.executeMany(query, bindData);
    await connection.commit();
    console.log("Data inserted", result);
  } catch (error) {
    console.error("Error occurr while inserting", error);
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

module.exports = batchInsert;
