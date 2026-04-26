import express from "express";
import bcrypt from 'bcrypt';

const router = express.Router();

//CREATE
router.post("/", async (req, res) => {
    const db = req.db;
    const { name, email, password, role } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);

        const result = await db.run(`
            INSERT INTO employees (name, email, password_hash, role)
            VALUES (?, ?, ?, ?)`, [name, email, hash, role]
        );

        res.status(201).json({id: result.insertId, message: "Employee added successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Error creating employee"});
    }
});

//READ ALL
router.get("/", async (req, res) => {
   const db = req.db;

   try {
       const employees = await db.all(`
        SELECT id, name, email, role
        FROM employees 
   `);
       res.status(200).json(employees);

   } catch (err){
       console.error(err);
       res.status(500).json({error: "Error getting employees"});
   }

});

//READ ONE
router.get("/:id", async (req, res) => {
    const db = req.db;
    const id = req.params.id;

    try {
        const employee = await db.get(`
        SELECT id, name, email, role
        FROM employees
        WHERE id = ?`,
            [id]
        );

        if(!employee) {
            return res.status(404).json({ message: "No employee found!"});
        }

        res.status(200).json(employee);

    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Error getting employee"});
    }
})


//UPDATE
router.put("/:id", async (req, res) => {
    const { role } = req.body;
    const db = req.db;
    const id = req.params.id;

    const employee = await db.get(`
        SELECT id
        FROM employees
        WHERE id = ?`, [id]
    );

    if(!employee) {
        return res.status(404).json({ message: "No employee found!"});
    }

    try{
        const result = await db.run(
            `UPDATE employees
             SET role = ? 
             WHERE id = ?`,[role, id]
            );

        res.status(200).json({message: "Updated successfully"});
    }catch(err){
        console.error(err);
        res.status(500).json({error: "Error updating role"});
    }

});


//DELETE
router.delete("/:id", async (req, res) => {
   const db = req.db;
   const id = req.params.id;

   const employee = await db.get(`
        SELECT id
        FROM employees
        WHERE id = ?`, [id]
   );

   if(!employee) {
       return res.status(404).json({ message: "No employee found!"});
   }

   try{
       const result = await db.run(`
        DELETE FROM employees WHERE id = ?`, [req.params.id]
       );

       res.status(200).json({message: "Deleted successfully"});
   }catch(err){
       console.error(err);
       res.status(500).json({error: "Delete failed"});
   }

});
router.get("/csrf-token", (req, res) => {
    res.json({ token: "secret-123-csrf" });
});

router.post("/login", async (req, res) => {
    const db = req.db;
    const { username, password } = req.body;

    try {
        const employee = await db.get(`SELECT * FROM employees WHERE name = ?`, [username]);

        if (employee) {
            const match = await bcrypt.compare(password, employee.password_hash);

            if (match) {
                res.cookie('session_id', 'user-session-' + employee.id, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'strict',
                    maxAge: 3600000
                });

                return res.status(200).json({ message: "Login successful" });
            }
        }

        res.status(401).json({ error: "Invalid credentials" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during login" });
    }
});

export default router;
