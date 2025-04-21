// controllers/roleController.js
const { sql, getPool } = require('../config/database');

async function getAllRoles(req, res) {
  try {
    const roles = await getAllRolesRaw();
    res.json(roles);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAllRolesRaw() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT * FROM Roles');
  return result.recordset;
}

async function getRoleById(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('RoleID', sql.Int, id)
      .query('SELECT * FROM Roles WHERE RoleID = @RoleID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function createRole(req, res) {
  try {
    const { Name, Description, Display_Name, UserID } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('Name', sql.VarChar(100), Name)
      .input('Description', sql.Text, Description)
      .input('Display_Name', sql.VarChar(100), Display_Name)
      .input('UserID', sql.Int, UserID)
      .query(`
        INSERT INTO Roles (Name, Description, Display_Name, UserID)
        VALUES (@Name, @Description, @Display_Name, @UserID);
        SELECT SCOPE_IDENTITY() as NewRoleID;
      `);

    const newRoleID = result.recordset[0].NewRoleID;
    res.status(201).json({ message: 'Role created successfully', RoleID: newRoleID });
  } catch (err) {
    console.error('Error creating role:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { Name, Description, Display_Name, UserID } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input('RoleID', sql.Int, id)
      .input('Name', sql.VarChar(100), Name)
      .input('Description', sql.Text, Description)
      .input('Display_Name', sql.VarChar(100), Display_Name)
      .input('UserID', sql.Int, UserID)
      .query(`
        UPDATE Roles
        SET Name = @Name,
            Description = @Description,
            Display_Name = @Display_Name,
            UserID = @UserID
        WHERE RoleID = @RoleID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deleteRole(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('RoleID', sql.Int, id)
      .query('DELETE FROM Roles WHERE RoleID = @RoleID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    console.error('Error deleting role:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAllRoles,
  getAllRolesRaw,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
