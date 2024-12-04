import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
const db = mysql.createPool({
  connectionLimit: 10, 
  host: "localhost",
  user: "root",
  password: "kavindu8008",
  database: "test",
});

const checkDbConnection = (req, res, next) => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ message: "Database connection error." });
    }
    connection.release(); 
    next();
  });
};
app.get("/", (req, res) => {
  res.json("hello");
});

app.get("/books", checkDbConnection, (req, res) => {
  const q = "SELECT * FROM books";
  db.query(q, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching books." });
    }
    return res.json(data);
  });
});

app.post("/books", checkDbConnection, (req, res) => {
  const q = "INSERT INTO books(`title`, `desc`, `price`) VALUES (?)";

  const values = [
    req.body.title,
    req.body.desc,
    req.body.price,
  ];

  db.query(q, [values], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error inserting book." });
    }
    return res.status(201).json({ message: "Book added successfully.", data });
  });
});

app.delete("/books/:id", checkDbConnection, (req, res) => {
  const bookId = req.params.id;
  const q = "DELETE FROM books WHERE id = ?";

  db.query(q, [bookId], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error deleting book." });
    }
    return res.json({ message: "Book deleted successfully.", data });
  });
});

app.put("/books/:id", (req, res) => {
  const { id } = req.params;
  const { title, desc, price } = req.body;

  const query = "UPDATE books SET title = ?, `desc` = ?, price = ? WHERE id = ?";
  db.query(query, [title, desc, price, id], (err, result) => {
    if (err) {
      console.error("Error updating book:", err);
      return res.status(500).json({ error: "Failed to update book" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({ message: "Book updated successfully" });
  });
});

// Start the server
app.listen(8800, () => {
  console.log("Connected to backend on port 8800.");
});
