import React, { useEffect, useState } from 'react'
import { getPersons, getPersonById, postPerson, addDevice, updatePerson, register, getDevices, deletePerson } from '../api/person-api'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { deleteDevices, getAllDevices, updateDevice } from '../api/device-api';

const styles = {
    adminPageContainer: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
    },
    adminPageHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    switchTableButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        textTransform: 'none', // Prevents uppercase text
    },
    switchTableButtonHover: {
        backgroundColor: '#0056b3',
    },
    adminPageContent: {
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '20px',
    },
    loadingMessage: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#007bff',
    },
    userTable: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#f2f2f2',
        fontWeight: 'bold',
    },
    tableCell: {
        border: '1px solid #ccc',
        padding: '10px',
        textAlign: 'left',
    },
    tableRowEven: {
        backgroundColor: '#f9f9f9',
    },
    tableRowHover: {
        backgroundColor: '#e9e9e9',
    },
};

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [editedDeviceData, setEditedDeviceData] = useState({});
    const [isHovered, setIsHovered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'CLIENT', password: '' });
    const [selectedUserDevices, setSelectedUserDevices] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [switchTable, setSwitchTable] = useState(true);
    const [devices, setDevices] = useState([]);
    const [newDevice, setNewDevice] = useState({ description: '', address: '', maxEnergyConsumption: '' });
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(''); // State to hold the selected user ID

    useEffect(() => {
        getPersons((data, status) => {
            setLoading(false);
            if (status === 401) {
                setError("Unauthorized. Please log in again.");
                navigate("/login")
            } else
                if (data) {
                    setUsers(data);
                    console.log(data);
                } else {
                    setError("Failed to fetch users");
                }
        });
        getAllDevices((data, status) => {
            setLoading(false);
            if (status === 401) {
                setError("Unauthorized. Please log in again.");
                navigate("/login")
            } else
                if (data) {
                    setDevices(data);
                    console.log(data);
                } else {
                    setError("Failed to fetch users");
                }
        });
    }, []);

    const handleDoubleClickTable = (user) => {
        setEditMode(user.id);
        setEditedData({ ...user });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    }
    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        setNewUser((prevUser) => ({ ...prevUser, [name]: value }));
    };
    const handleCancel = () => {
        setEditMode(null);
    };
    const handleSave = (userId) => {
        updatePerson(userId, editedData, (response, status) => {
            if (status == 200) {
                setUsers((previousData) =>
                    previousData.map((user) => {
                        if (user.id === userId)
                            return { ...user, ...editedData };
                        else return user;
                    })
                )
                setEditMode(null);
            }
            else {
                alert("Failed to update user");
            }
        })
        setEditMode(null);
        console.log("Save data");
        console.log(editedData, userId);
    };
    const handleEnter = (e, userId) => {
        if (e.key === 'Enter') {
            handleSave(userId);
        }
    };
    // modal add user
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    const handleSavePerson = () => {
        const { name, email, role, password } = newUser; // Extract only necessary fields
        const userData = { name, email, role, personPassword: password };
        if (!newUser.password) {
            alert("Password is required");
            return;
        }
        register(userData, (data, status) => {
            if (status === 201) {
                alert("User addded successful!");
                getPersons((data, status) => {
                    if (status === 200 && data) {
                        setUsers(data);
                    } else {
                        setError("Failed to fetch updated users");
                    }
                });
                setNewUser({ name: '', email: '', role: 'CLIENT', password: '' });
                setIsModalOpen(false);
            } else {
                setError("Error user add");
            }
        });
    };
    const handleDeviceModal = (user) => {
        setSelectedUser(user)
        getDevices(user.id, (devices, status) => {
            if (status === 200) {
                setSelectedUserDevices(devices);
                setIsDeviceModalOpen(true);
            } else {
                setError("Failed to fetch devices");
            }
        });
    };

    const closeDeviceModal = () => {
        setIsDeviceModalOpen(false);
        setSelectedUserDevices([]);
    };

    const handleLogout = () => {
        Cookies.remove('jwt', { secure: true, sameSite: 'strict' });
        Cookies.remove('personId', { secure: true, sameSite: 'strict' });
        Cookies.remove('role', { secure: true, sameSite: 'strict' });
        Cookies.remove('active', { secure: true, sameSite: 'strict' });

        alert("You have successfully logged out.");

        navigate("/");
    };

    const handleDeleteUser = (user) => {
        const isConfirmed = window.confirm(`Are you sure you want to delete the user ${user.name}?`);
        if (isConfirmed) {
            deletePerson(user.id, (data, status) => {
                if (status === 200) {
                    alert("You have successfully deleted the user.");
                    setUsers((prevUsers) => {
                        return prevUsers.filter((user1) => user1.id !== user.id);
                    });
                    getAllDevices((data, status) => {
                        setLoading(false);
                        if (status === 401) {
                            setError("Unauthorized. Please log in again.");
                            navigate("/login")
                        } else
                            if (data) {
                                setDevices(data);
                                console.log(data);
                            } else {
                                setError("Failed to fetch users");
                            }
                    });
                } else {
                    alert("failed to delete user");
                }
            });

        }

    };
    const handleDoubleClickDevice = (device) => {
        setEditMode(device.id);
        setEditedDeviceData({ ...device });
    };

    const handleDeviceChange = (e) => {
        const { name, value } = e.target;
        setEditedDeviceData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveDevice = (deviceId) => {
        setEditMode(null);
        setLoading(true);
        updateDevice(deviceId, editedDeviceData, (response, status) => {
            if (status == 200) {
                setDevices((previousData) =>
                    previousData.map((device) => {
                        if (device.id === deviceId)
                            return { ...device, ...editedDeviceData };
                        else return device;
                    })
                )
                setLoading(false);
            }
            else {
                alert("Failed to update user");
            }
        })

    };
    const handleCancelDeviceEdit = () => {
        setEditMode(null);
    };

    const handleDeleteDevice = (device) => {
        const isConfirmed = window.confirm(`Are you sure you want to delete the device with id ${device.id}?`);
        if (isConfirmed) {
            deleteDevices(device.id, (data, status) => {
                alert("You have successfully deleted the device.");
                if (status == 200) {
                    setDevices((prevDevices) =>
                        prevDevices.filter((device1) => device1.id !== device.id)
                    );
                }
                else {
                    alert("failed to delete the device");
                }
            })
        }
    };
    const handleAddDeviceUserChange = (e) => {
        setSelectedUserId(e.target.value);
    };
    const handleAddDeviceChange = (e) => {
        const { name, value } = e.target;
        setNewDevice((prev) => ({ ...prev, [name]: value }));
    };
    const handleAddDeviceClose = () => {
        setIsAddDeviceOpen(false);
        setNewDevice({ description: '', address: '', maxEnergyConsumption: '' });
    };
    const handleAddDeviceOpen = () => {
        setIsAddDeviceOpen(true);
    };
    const handleDeviceSubmit = () => {
        const userId = selectedUserId;
        const deviceData = { ...newDevice, maxEnergyConsumption: parseFloat(newDevice.maxEnergyConsumption) };
        console.log("submit:", deviceData);
        setIsAddDeviceOpen(false);
        setLoading(true);
        addDevice(userId, deviceData, (data, status) => {
            if (status === 200) {
                alert("Device added successfully!");
                getAllDevices((data, status) => {
                    setLoading(false);
                    if (status === 401) {
                        setError("Unauthorized. Please log in again.");
                        navigate("/login")
                    } else
                        if (data) {
                            setDevices(data);
                            console.log(data);
                        } else {
                            setError("Failed to fetch users");
                        }
                });
            }
        });
    };

    const handleChatButton = () => {
        navigate("/adminChat")
    }

    return (
        <div style={styles.adminPageContainer}>
            <div style={styles.adminPageHeader}>
                <h2>Admin Dashboard</h2>
                <Button onClick={handleChatButton}>
                    My Chats
                </Button>
                <Button
                    style={isHovered ? { ...styles.switchTableButton, ...styles.switchTableButtonHover } : styles.switchTableButton}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleOpenModal}
                >
                    ADD User
                </Button>
                <Button
                    style={isHovered ? { ...styles.switchTableButton, ...styles.switchTableButtonHover } : styles.switchTableButton}
                    onClick={() => setSwitchTable(!switchTable)}
                >
                    Switch Table
                </Button>
                <Button
                    style={isHovered ? { ...styles.switchTableButton, ...styles.switchTableButtonHover } : styles.switchTableButton}
                    onClick={handleAddDeviceOpen}
                >
                    ADD Device
                </Button>
                <Button
                    style={isHovered ? { ...styles.switchTableButton, ...styles.switchTableButtonHover } : styles.switchTableButton}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </div>
            <div style={styles.adminPageContent}>
                {loading ? (
                    <p style={styles.loadingMessage}>Loading users...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    switchTable ? (
                        // Devices Table
                        <TableContainer component={Paper}>
                            <Table style={styles.userTable}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={styles.tableHeader}>Device ID</TableCell>
                                        <TableCell style={styles.tableHeader}>Description</TableCell>
                                        <TableCell style={styles.tableHeader}>Address</TableCell>
                                        <TableCell style={styles.tableHeader}>Max Energy Consumption</TableCell>
                                        <TableCell style={styles.tableHeader}>Options</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {devices.map((device, index) => (
                                        <TableRow
                                            key={device.id}
                                            onDoubleClick={() => handleDoubleClickDevice(device)}
                                            style={
                                                index % 2 === 0
                                                    ? { ...styles.tableRowEven, ...styles.tableCell }
                                                    : styles.tableCell
                                            }
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.tableRowHover.backgroundColor)}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                                        >
                                            <TableCell style={styles.tableCell}>{device.id}</TableCell>
                                            <TableCell style={styles.tableCell}>
                                                {editMode === device.id ? (
                                                    <TextField
                                                        name="description"
                                                        value={editedDeviceData.description}
                                                        onChange={handleDeviceChange}
                                                        variant='outlined'
                                                        size='small'
                                                    />
                                                ) : (
                                                    device.description
                                                )}
                                            </TableCell>
                                            <TableCell style={styles.tableCell}>
                                                {editMode === device.id ? (
                                                    <TextField
                                                        name="address"
                                                        value={editedDeviceData.address}
                                                        onChange={handleDeviceChange}
                                                        variant='outlined'
                                                        size='small'
                                                    />
                                                ) : (
                                                    device.address
                                                )}
                                            </TableCell>
                                            <TableCell style={styles.tableCell}>
                                                {editMode === device.id ? (
                                                    <TextField
                                                        name="maxEnergyConsumption"
                                                        value={editedDeviceData.maxEnergyConsumption}
                                                        onChange={handleDeviceChange}
                                                        type="number"
                                                        variant='outlined'
                                                        size='small'
                                                    />
                                                ) : (
                                                    `${device.maxEnergyConsumption} kWh`
                                                )}
                                            </TableCell>
                                            <TableCell style={styles.tableCell}>
                                                {editMode === device.id ? (
                                                    <>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleSaveDevice(device.id)}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="secondary"
                                                            size="small"
                                                            onClick={handleCancelDeviceEdit}
                                                            style={{ marginLeft: '8px' }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="text"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleDoubleClickDevice(device)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="text"
                                                            color="secondary"
                                                            size="small"
                                                            onClick={() => handleDeleteDevice(device)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        // Users Table
                        <TableContainer component={Paper}>
                            <Table style={styles.userTable}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={styles.tableHeader}>ID</TableCell>
                                        <TableCell style={styles.tableHeader}>Name</TableCell>
                                        <TableCell style={styles.tableHeader}>Email</TableCell>
                                        <TableCell style={styles.tableHeader}>Role</TableCell>
                                        <TableCell style={styles.tableHeader}>Options</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user, index) => (
                                        <TableRow
                                            key={user.id}
                                            onDoubleClick={() => handleDoubleClickTable(user)}
                                            onKeyDown={(e) => handleEnter(e, user.id)}
                                            style={
                                                index % 2 === 0
                                                    ? { ...styles.tableRowEven, ...styles.tableCell }
                                                    : styles.tableCell
                                            }
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.tableRowHover.backgroundColor)}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                                        >
                                            <TableCell style={styles.tableCell}>{user.id}</TableCell>
                                            <TableCell style={styles.tableCell}>
                                                {editMode === user.id ? (
                                                    <TextField
                                                        name="name"
                                                        value={editedData.name}
                                                        onChange={handleChange}
                                                        variant='outlined'
                                                        size='small'
                                                    />
                                                ) : (
                                                    user.name
                                                )}
                                            </TableCell>
                                            <TableCell style={styles.tableCell}>
                                                {editMode === user.id ? (
                                                    <TextField
                                                        name="email"
                                                        value={editedData.email}
                                                        onChange={handleChange}
                                                        variant='outlined'
                                                        size='small'
                                                    />
                                                ) : (
                                                    user.email
                                                )}
                                            </TableCell>
                                            <TableCell style={styles.tableCell}>
                                                {editMode == user.id ? (
                                                    <Select
                                                        name="role"
                                                        value={editedData.role}
                                                        onChange={handleChange}
                                                        variant='outlined'
                                                        size='small'
                                                    >
                                                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                                                        <MenuItem value="CLIENT">CLIENT</MenuItem>
                                                    </Select>
                                                ) : (
                                                    user.role
                                                )}
                                            </TableCell>
                                            <TableCell tyle={styles.tableCell}>
                                                {editMode === user.id ? (
                                                    <>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleSave(user.id)}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            color="secondary"
                                                            size="small"
                                                            onClick={handleCancel}
                                                            style={{ marginLeft: '8px' }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <><Button
                                                        variant="text"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleDoubleClickTable(user)}
                                                    >
                                                        Edit
                                                    </Button>
                                                        <Button
                                                            variant="text"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleDeviceModal(user)}
                                                        >
                                                            View Devices
                                                        </Button>
                                                        <Button
                                                            variant="text"
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => handleDeleteUser(user)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                )}
            </div>
            {/* ADD PERSON */}
            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <TextField
                        name="name"
                        label="Name"
                        value={newUser.name}
                        onChange={handleNewUserChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        name="email"
                        label="Email"
                        value={newUser.email}
                        onChange={handleNewUserChange}
                        fullWidth
                        margin="dense"
                    />
                    <Select
                        name="role"
                        value={newUser.role}
                        onChange={handleNewUserChange}
                        fullWidth
                        margin="dense"
                    >
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                        <MenuItem value="CLIENT">CLIENT</MenuItem>
                    </Select>
                    <TextField
                        name="password"
                        label="Password"
                        type="password"
                        value={newUser.password}
                        onChange={handleNewUserChange}
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="secondary">Cancel</Button>
                    <Button onClick={handleSavePerson} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
            {/* ADD DEVICE  */}
            <Dialog open={isAddDeviceOpen} onClose={handleAddDeviceClose}>
                <DialogTitle>Adaugă un nou dispozitiv</DialogTitle>
                <DialogContent>
                    {/* Dropdown to select the user */}
                    <TextField
                        select
                        label="Selectează Utilizatorul"
                        value={selectedUserId}
                        onChange={handleAddDeviceUserChange}
                        fullWidth
                        margin="dense"
                    >
                        {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.email} {/* Display user's name or any other identifying field */}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Device details input fields */}
                    <TextField
                        name="description"
                        label="Descriere"
                        value={newDevice.description}
                        onChange={handleAddDeviceChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        name="address"
                        label="Adresă"
                        value={newDevice.address}
                        onChange={handleAddDeviceChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        name="maxEnergyConsumption"
                        label="Consum Max. Energie (kWh)"
                        value={newDevice.maxEnergyConsumption}
                        onChange={handleAddDeviceChange}
                        type="number"
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddDeviceClose} color="secondary">Anulează</Button>
                    <Button
                        onClick={() => handleDeviceSubmit()}
                        color="primary"
                        disabled={!selectedUserId}
                    >
                        Adaugă
                    </Button>
                </DialogActions>
            </Dialog>
            {/* VIEW DEVICES */}
            <Dialog open={isDeviceModalOpen} onClose={closeDeviceModal}>
                <DialogTitle>Devices for {selectedUser?.name}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1">ID: {selectedUser?.id}</Typography>
                    <Typography variant="subtitle1">Email: {selectedUser?.email}</Typography>

                    <Typography variant="h6" style={{ marginTop: '20px' }}>Devices</Typography>
                    {selectedUserDevices.length > 0 ? (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Device ID</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Max Energy</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedUserDevices.map((device) => (
                                    <TableRow key={device.id}>
                                        <TableCell>{device.id}</TableCell>
                                        <TableCell>{device.description}</TableCell>
                                        <TableCell>{device.address}</TableCell>
                                        <TableCell>{device.maxEnergyConsumption}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <Typography>No devices found for this user.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeviceModal} color="primary">Close</Button>
                </DialogActions>
            </Dialog>

        </div>
    );
}

export default AdminDashboard