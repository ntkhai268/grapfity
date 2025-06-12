import React, { useState, useEffect, useRef } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  UserType,
  CreateUserPayload,
  UpdateUserPayload,
  fetchUserId,
} from "../services/userService.ts";
import "../styles/admin.css";

const Section_admin_users: React.FC = () => {
  // Dữ liệu gốc và đã lọc
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Checkbox
  const [checkedRows, setCheckedRows] = useState<Record<number, boolean>>({});
  const [allChecked, setAllChecked] = useState(false);

  // Filter dropdown
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Modal Add User
  const [addOpen, setAddOpen] = useState(false);
  const [newUser, setNewUser] = useState<CreateUserPayload>({
    userName: "",
    email: "",
    password: "",
    roleId: 1,
    Name: "",
    Birthday: "",
    Address: "",
    PhoneNumber: "",
  });

  // Modal Edit User
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UpdateUserPayload>({
    id: 0,
    userName: "",
    email: "",
    password: "",
    roleId: 1,
    Name: "",
    Birthday: "",
    Address: "",
    PhoneNumber: "",
  });
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // 1) Lần đầu fetch users
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
        setFilteredUsers(data);
        // init checkbox
        const init: Record<number, boolean> = {};
        data.forEach((u) => (init[u.id] = false));
        setCheckedRows(init);
        setAllChecked(false);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    })();
  }, []);

  // 2) Khi searchTerm hoặc users thay đổi → áp dụng filter
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = term
      ? users.filter(
          (u) =>
            u.userName.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            (u.Name?.toLowerCase().includes(term) ?? false)
        )
      : [...users];
    setFilteredUsers(result);
    // reset checkbox
    const reset: Record<number, boolean> = {};
    result.forEach((u) => (reset[u.id] = false));
    setCheckedRows(reset);
    setAllChecked(false);
  }, [searchTerm, users]);

  // 3) Đóng filter khi click ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterOpen &&
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterOpen]);
  const [userId, setUserId] = useState<number | null>(null);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const id = await fetchUserId();
        setUserId(id);
      } catch (err: any) {
        console.error(err);
        setError("Không thể lấy userId");
      } finally {
        setLoading(false);
      }
    };
    loadUserId();
  }, []);
  // Checkbox handlers
  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAllChecked(checked);
    setCheckedRows((prev) =>
      Object.fromEntries(
        Object.keys(prev).map((k) => [Number(k), checked])
      ) as Record<number, boolean>
    );
  };
  const handleCheckRow = (id: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = e.target.checked;
    const updated = { ...checkedRows, [id]: checked };
    setCheckedRows(updated);
    setAllChecked(filteredUsers.every((u) => updated[u.id]));
  };

  // Filter / Sort dropdown
  const toggleFilter = () => setFilterOpen((o) => !o);
  const applyFilter = (type: string) => {
    let updated = [...users];
    switch (type) {
      case "Admin":
        updated = updated.filter((u) => u.roleId === 2);
        break;
      case "User":
        updated = updated.filter((u) => u.roleId === 1);
        break;
      case "Newest first":
        updated.sort((a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
        break;

      case "Oldest first":
        updated.sort((a, b) =>
          new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
        );
        break;
      case "A → Z":
        updated.sort((a, b) => a.userName.localeCompare(b.userName));
        break;
      case "Z → A":
        updated.sort((a, b) => b.userName.localeCompare(a.userName));
        break;
      default:
        break;
    }
    setFilteredUsers(updated);
    setCheckedRows(
      Object.fromEntries(updated.map((u) => [u.id, false])) as Record<
        number,
        boolean
      >
    );
    setAllChecked(false);
    setFilterOpen(false);
  };

  // Handle Add User
  const toggleAddModal = () => setAddOpen((o) => !o);
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(newUser);
      const data = await fetchUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
      alert("Thêm user thất bại.");
    }
    setAddOpen(false);
    setNewUser({
      userName: "",
      email: "",
      password: "",
      roleId: 1,
      Name: "",
      Birthday: "",
      Address: "",
      PhoneNumber: "",
    });
  };

  // Handle Edit User
  const handleEditClick = (u: UserType) => {
    setEditUser({
      id: u.id,
      userName: u.userName,
      email: u.email,
      password: "",
      roleId: u.roleId ?? 1,
      Name: u.Name ?? "",
      Birthday: u.Birthday?.slice(0, 10) ?? "",
      Address: u.Address ?? "",
      PhoneNumber: u.PhoneNumber ?? "",
    });
    setConfirmPassword("");
    setEditOpen(true);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "password") {
      setEditUser((prev) => ({ ...prev, password: value }));
    } else if (name === "confirmPassword") {
      setConfirmPassword(value);
    }
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser.password !== confirmPassword) {
      alert("Password và Confirm Password không khớp.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", editUser.id.toString());
      formData.append("password", editUser.password);

      await updateUser(formData);
      const data = await fetchUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
      alert("Cập nhật user thất bại.");
    }

    setEditOpen(false);
  };
  const handleRoleSelect = (role: number) =>
    setNewUser((prev) => ({ ...prev, roleId: role }));
  // Handle Delete Selected
  const handleDeleteSelected = async () => {
    const ids = Object.entries(checkedRows)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
  
    if (!ids.length) return;
  
    // Kiểm tra nếu có ID = 1
    if (ids.includes(1)) {
      alert("Không thể xoá user có ID = 1 (quản trị viên mặc định).");
      return;
    }
  
    if (!window.confirm(`Xác nhận xóa ${ids.length} user?`)) return;
  
    try {
      await Promise.all(ids.map((id) => deleteUser(id)));
      const data = await fetchUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error(err);
      alert("Xóa user thất bại.");
    }
  };
  

  const formatDate = (iso?: string): string =>
  iso ? new Date(iso).toLocaleDateString() : "N/A";
  const mapRole = (roleId?: number | null): string =>
    roleId === 2 ? "Admin" : roleId === 1 ? "User" : "N/A";

  const selectedCount = Object.values(checkedRows).filter(Boolean).length;

  return (
    <section className="section_admin">
      {/* HEADER */}
      <div className="user_management_header_admin">
        <div className="search_users_admin">
          <input
            type="text"
            placeholder="Search username, email or name"
            className="search_input_users_admin"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="user_actions_admin">
          <span className="selected_count_admin">
            {selectedCount} Selected
          </span>
          <button
            className="delete_button_admin"
            disabled={selectedCount === 0}
            onClick={handleDeleteSelected}
          >
            Delete
          </button>
          {userId === 1 && (
        <button
          className="export_button_admin"
          onClick={toggleAddModal}
        >
          Add
        </button>
      )}
          <div className="filter_dropdown_admin" ref={filterRef}>
            <button
              className="filter_button_admin"
              onClick={toggleFilter}
            >
              Filter
            </button>
            {filterOpen && (
              <ul className="filter_menu_admin">
                {["Admin","User","Newest first","Oldest first","A → Z","Z → A"].map((opt) => (
                  <li key={opt} onClick={() => applyFilter(opt)}>{opt}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {/* TABLE */}
      <div className="users_table_admin">
      <div className="table_header_admin">
          <div className="table_cell_admin checkbox_cell_admin">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={handleCheckAll}
            />
          </div>
          <div className="table_cell_admin name_cell_admin">Username</div>
          <div className="table_cell_admin name_cell_admin">Full Name</div>
          <div className="table_cell_admin position_cell_admin">Email</div>
          <div className="table_cell_admin position_cell_admin">
            Birthday
          </div>
          <div className="table_cell_admin country_cell_admin">Address</div>
          <div className="table_cell_admin status_cell_admin">Phone</div>
          <div className="table_cell_admin country_cell_admin">Created</div>
          <div className="table_cell_admin status_cell_admin">Role</div>
          <div className="table_cell_admin action_cell_admin" />
        </div>

        {filteredUsers.map((u) => (
          <div className="table_row_admin" key={u.id}>
            <div className="table_cell_admin checkbox_cell_admin">
              <input
                type="checkbox"
                checked={checkedRows[u.id] || false}
                onChange={handleCheckRow(u.id)}
              />
            </div>
            <div className="table_cell_admin name_cell_admin">
              <div className="user_info_admin">
                <div className="user_avatar_letter_admin">
                  {u.userName.charAt(0).toUpperCase()}
                </div>
                <div className="user_details_admin">
                  <div className="user_name_admin">{u.userName}</div>
                </div>
              </div>
            </div>
            <div className="table_cell_admin name_cell_admin">
              {u.Name}
            </div>
            <div className="table_cell_admin position_cell_admin">
              {u.email}
            </div>
            <div className="table_cell_admin position_cell_admin">
              {u.Birthday ? new Date(u.Birthday).toLocaleDateString() : ""}
            </div>
            <div className="table_cell_admin country_cell_admin">
              {u.Address}
            </div>
            <div className="table_cell_admin status_cell_admin">
              {u.PhoneNumber}
            </div>
            <div className="table_cell_admin country_cell_admin">
              {formatDate(u.createdAt)}
            </div>
            <div className="table_cell_admin status_cell_admin">
              <span
                className={`status_badge_admin ${
                  u.roleId === 2
                    ? "status_active_admin"
                    : u.roleId === 1
                    ? "status_pending_admin"
                    : ""
                }`}
              >
                {mapRole(u.roleId)}
              </span>
            </div>
            <div className="table_cell_admin action_cell_admin">
              <button
                className="edit_button_admin"
                onClick={() => handleEditClick(u)}
              >
                Edit
              </button>
              <button
  className="delete_button_admin"
  disabled={!checkedRows[u.id]} // <-- chỉ bật nếu checkbox được chọn
  onClick={async () => {
    if (window.confirm(`Bạn có chắc muốn xoá user "${u.userName}"?`)) {
      try {
        await deleteUser(u.id);
        const data = await fetchUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        console.error(err);
        alert("Xoá user thất bại.");
      }
    }
  }}
>
  Delete
</button>
            </div>
          </div>
        ))}
      </div>
      {/* Modal Add User */}
      {addOpen && (
        <div className="modal_overlay_admin">
          <div className="modal_content_admin">
            <h3>Add New User</h3>
            <form onSubmit={handleAddSubmit}>
              <input
                name="userName"
                placeholder="Username"
                value={newUser.userName}
                onChange={handleNewUserChange}
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={handleNewUserChange}
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={handleNewUserChange}
                required
              />
              <input
                name="Name"
                placeholder="Full Name"
                value={newUser.Name}
                onChange={handleNewUserChange}
              />
              <input
                name="Birthday"
                type="date"
                placeholder="Birthday"
                value={newUser.Birthday}
                onChange={handleNewUserChange}
              />
              <input
                name="Address"
                placeholder="Address"
                value={newUser.Address}
                onChange={handleNewUserChange}
              />
              <input
                name="PhoneNumber"
                placeholder="Phone Number"
                value={newUser.PhoneNumber}
                onChange={handleNewUserChange}
              />
              <div className="role_field_admin">
                <span className="role_label_admin">Role:</span>
                <div className="role_toggle_group_admin">
  <button
    type="button"
    className="role_button_admin active"
    onClick={() => handleRoleSelect(2)}
  >
    Admin
  </button>
</div>
              </div>
              <div className="modal_actions_admin">
                <button type="submit" className="save_button_admin">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel_button_admin"
                  onClick={toggleAddModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Edit User */}
      {editOpen && (
        <div className="modal_overlay_admin">
          <div className="modal_content_admin">
            <h3>Edit User</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form_group_admin">
                <label>User:</label>
                <input name="userName" value={editUser.userName} readOnly />
              </div>
              <input
                name="password"
                type="password"
                placeholder="New Password"
                value={editUser.password}
                onChange={handleEditChange}
                required
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleEditChange}
                required
              />
              <div className="modal_actions_admin">
                <button type="submit" className="save_button_admin">Save</button>
                <button type="button" className="cancel_button_admin" onClick={() => setEditOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Section_admin_users;
