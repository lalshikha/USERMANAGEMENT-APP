'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type UserType = 'general' | 'admin' | 'vendor';
type UserStatus = 'active' | 'inactive';
type User = {
  id: number;
  name: string;
  type: UserType;
  status: UserStatus;
};

const TYPES: UserType[] = ['general', 'admin', 'vendor'];
const STATUSES: UserStatus[] = ['active', 'inactive'];
const USERS_KEY = 'user-management-users';
const AUTH_KEY = 'user-management-auth';

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<'add' | 'search'>('add');

  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<UserType | ''>('');
  const [newStatus, setNewStatus] = useState<UserStatus | ''>('');
  const [addMessage, setAddMessage] = useState({ text: '', type: '' });

  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState<UserType | ''>('');
  const [searchStatus, setSearchStatus] = useState<UserStatus | ''>('');
  const [selected, setSelected] = useState<number[]>([]);
  const [searchMessage, setSearchMessage] = useState({ text: '', type: '' });

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<UserType>('general');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem(AUTH_KEY) === 'true');
    try {
      setUsers(JSON.parse(localStorage.getItem(USERS_KEY) || '[]'));
    } catch {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  const nextId = useMemo(
    () => users.reduce((max, user) => Math.max(max, user.id), 0) + 1,
    [users],
  );

  const results = useMemo(() => {
    const name = searchName.trim().toLowerCase();
    return users.filter(
      (user) =>
        (!name || user.name.toLowerCase().includes(name)) &&
        (!searchType || user.type === searchType) &&
        (!searchStatus || user.status === searchStatus),
    );
  }, [users, searchName, searchType, searchStatus]);

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (username === 'user' && password === '1234') {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setAuthenticated(true);
      setLoginError('');
      return;
    }

    setLoginError('Invalid username or password.');
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setUsername('');
    setPassword('');
    setSelected([]);
    setEditingUser(null);
  };

  const addUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newName.trim();

    if (!name || !newType || !newStatus) {
      setAddMessage({ text: 'Please complete all fields.', type: 'error' });
      return;
    }

    if (users.some((user) => user.name.toLowerCase() === name.toLowerCase())) {
      setAddMessage({ text: 'A user with this name already exists.', type: 'error' });
      return;
    }

    setUsers((current) => [
      ...current,
      { id: nextId, name, type: newType, status: newStatus },
    ]);
    setNewName('');
    setNewType('');
    setNewStatus('');
    setAddMessage({ text: 'User saved successfully.', type: 'success' });
  };

  const toggleSelection = (id: number) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const toggleAll = () => {
    const visibleIds = results.map((user) => user.id);
    const allVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

    setSelected(allVisibleSelected ? [] : visibleIds);
  };

  const deleteSelected = () => {
    if (!selected.length) {
      setSearchMessage({ text: 'Select at least one user to delete.', type: 'error' });
      return;
    }

    setUsers((current) => current.filter((user) => !selected.includes(user.id)));
    setSelected([]);
    setSearchMessage({ text: 'Selected user(s) deleted successfully.', type: 'success' });
  };

  const openEditModal = () => {
    if (selected.length !== 1) {
      setSearchMessage({ text: 'Select exactly one user to edit.', type: 'error' });
      return;
    }

    const userToEdit = users.find((user) => user.id === selected[0]);

    if (!userToEdit) {
      setSearchMessage({ text: 'The selected user could not be found.', type: 'error' });
      return;
    }

    setEditName(userToEdit.name);
    setEditType(userToEdit.type);
    setEditStatus(userToEdit.status);
    setEditMessage('');
    setEditingUser(userToEdit);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditMessage('');
  };

  const saveEditedUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    const name = editName.trim();

    if (!name) {
      setEditMessage('name is required.');
      return;
    }

    const duplicateNameExists = users.some(
      (user) =>
        user.id !== editingUser.id && user.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicateNameExists) {
      setEditMessage('A user with this name already exists.');
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === editingUser.id
          ? { ...user, name, type: editType, status: editStatus }
          : user,
      ),
    );

    setSearchMessage({ text: 'User updated successfully.', type: 'success' });
    setEditingUser(null);
    setEditMessage('');
  };

  if (!authenticated) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-intro">
            <div className="app-chip">Vercel-ready Next.js app</div>
            <h1>User Management App</h1>
            <p>
              v1.0.1
            </p>
            <div className="credentials-card">
              <strong>Default demo credentials</strong>
              <span>Username: user</span>
              <span>Password: 1234</span>
            </div>
          </div>

          <form className="login-form" onSubmit={login}>
            <div className="welcome">Welcome</div>
            <h2>Login</h2>
            <p className="form-description">
              Enter the required username and password to open the Add User and
              Search User page.
            </p>

            {loginError && <div className="message error">{loginError}</div>}

            <label htmlFor="username">
              Username
              <input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
              />
            </label>

            <label htmlFor="password">
              Password
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </label>

            <button className="login-button" type="submit">
              Login
            </button>
          </form>
        </section>
      </main>
    );
  }

  const allVisibleSelected =
    results.length > 0 && results.every((user) => selected.includes(user.id));

  return (
    <main className="app-page">
      <header className="app-header">
        <h1>User Management App</h1>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="workspace">
        <div className="tabs" role="tablist" aria-label="User management tabs">
          <button
            className={tab === 'add' ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={tab === 'add'}
            onClick={() => setTab('add')}
          >
            Add User
          </button>
          <button
            className={tab === 'search' ? 'active' : ''}
            type="button"
            role="tab"
            aria-selected={tab === 'search'}
            onClick={() => setTab('search')}
          >
            Search User
          </button>
        </div>

        {tab === 'add' ? (
          <section className="panel">
            <h2>Add User</h2>

            {addMessage.text && (
              <div className={`message ${addMessage.type}`} role="alert">
                {addMessage.text}
              </div>
            )}

            <form onSubmit={addUser} className="user-form">
              <label>
                Id
                <input value={nextId} readOnly />
              </label>

              <label>
                name
                <input
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                type
                <select
                  value={newType}
                  onChange={(event) => setNewType(event.target.value as UserType)}
                  required
                >
                  <option value="">Select type</option>
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                status
                <select
                  value={newStatus}
                  onChange={(event) => setNewStatus(event.target.value as UserStatus)}
                  required
                >
                  <option value="">Select status</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <button className="primary-button" type="submit">
                Save
              </button>
            </form>
          </section>
        ) : (
          <section className="panel">
            <h2>Search User</h2>

            {searchMessage.text && (
              <div className={`message ${searchMessage.type}`} role="alert">
                {searchMessage.text}
              </div>
            )}

            <div className="search-grid">
              <label>
                name
                <input
                  value={searchName}
                  onChange={(event) => setSearchName(event.target.value)}
                  placeholder="Search by name"
                />
              </label>

              <label>
                type
                <select
                  value={searchType}
                  onChange={(event) => setSearchType(event.target.value as UserType)}
                >
                  <option value="">All types</option>
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                status
                <select
                  value={searchStatus}
                  onChange={(event) => setSearchStatus(event.target.value as UserStatus)}
                >
                  <option value="">All statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="toolbar">
              <button
                className="secondary-button"
                type="button"
                onClick={openEditModal}
                disabled={selected.length !== 1}
              >
                Edit selected
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={deleteSelected}
                disabled={selected.length === 0}
              >
                Delete selected
              </button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all visible users"
                        checked={allVisibleSelected}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>Id</th>
                    <th>name</th>
                    <th>type</th>
                    <th>status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty">
                        No matching users.
                      </td>
                    </tr>
                  ) : (
                    results.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select ${user.name}`}
                            checked={selected.includes(user.id)}
                            onChange={() => toggleSelection(user.id)}
                          />
                        </td>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.type}</td>
                        <td>{user.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>

      {editingUser && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={closeEditModal}
        >
          <section
            className="edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">User Management</p>
                <h2 id="edit-user-title">Edit User</h2>
                <p className="modal-description">
                  Update the selected user&apos;s name, type, or status.
                </p>
              </div>
              <button
                className="modal-close-button"
                type="button"
                onClick={closeEditModal}
                aria-label="Close edit user dialog"
              >
                Ã—
              </button>
            </div>

            <form onSubmit={saveEditedUser}>
              {editMessage && (
                <div className="message error" role="alert">
                  {editMessage}
                </div>
              )}

              <div className="modal-id">
                <span>Id</span>
                <strong>{editingUser.id}</strong>
              </div>

              <label className="modal-field">
                name
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  maxLength={100}
                  autoFocus
                  required
                />
              </label>

              <label className="modal-field">
                type
                <select
                  value={editType}
                  onChange={(event) => setEditType(event.target.value as UserType)}
                >
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="modal-field">
                status
                <select
                  value={editStatus}
                  onChange={(event) => setEditStatus(event.target.value as UserStatus)}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button className="primary-button modal-save-button" type="submit">
                  Save changes
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}