import React, { useEffect, useState } from 'react';
import { getDevices, getPersonById, addDevice } from '../api/person-api';
import Cookies from 'js-cookie';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton } from '@mui/material';
import { deleteDevices, updateDevice } from '../api/device-api';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { HOST } from "../api/hosts";

const styles = {
    pageContainer: {
        width: '100%',
        height: '100hv',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#f7f9fc',
    },
    welcomeText: {
        color: '#2f3e9e',
        fontWeight: 'bold',
    },
    cardContainer: {
        width: '100%',
        maxWidth: '600px',
        marginBottom: '30px',
    },
    cardTitle: {
        fontSize: '18px',
        color: '#ffffff',
        fontWeight: 'bold',
    },
    deviceColors: ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFD93D', '#9D4EDD'], // Color options for devices
    button: {
        marginBottom: '20px',
        backgroundColor: '#3f51b5',
        color: '#ffffff',
    },
    noDevicesText: {
        color: '#666',
        marginTop: '20px',
    },
};

function ClientDashboard() {
    const [user, setUser] = useState('');
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingDevice, setEditingDevice] = useState({
        description: '',
        address: '',
        maxEnergyConsumption: '',
    });
    const [isEditDeviceOpen, setIsEditDeviceOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const id = Cookies.get('personId');
        getPersonById(id, (data, status) => {
            if (status === 200 && data) {
                setUser(data);
                getDevices(data.id, (devices, deviceStatus) => {
                    if (deviceStatus === 200) {
                        setDevices(devices);
                    } else {
                        setError("Failed to fetch devices");
                    }
                    setLoading(false);
                });
            } else {
                setError("Failed to fetch user data");
                setLoading(false);
            }
        });
    }, []);

    useEffect(() => {
        if (devices.length === 0) return;

        const socket = new SockJS(`${HOST.backend_monitoring_api}/ws`);
        const stompClient = Stomp.over(socket);

        stompClient.connect(
            {},
            () => {
                console.log("Connected to WebSocket");

                const subscribedDeviceIds = new Set();

                stompClient.subscribe("/topic/alerts", (message) => {
                    console.log("Received alert:", message.body);
                    handleNewMessage(message.body);
                });

                // Subscribe to device-specific alerts (only once per device)
                devices.forEach((device) => {
                    if (!subscribedDeviceIds.has(device.id)) {
                        subscribedDeviceIds.add(device.id);
                        const topic = `/topic/alerts/${device.id}`;
                        stompClient.subscribe(topic, (message) => {
                            console.log(`Received message for ${topic}:`, message.body); // Now the variable 'topic' is correctly defined
                            handleNewMessage(message.body);
                        });
                    }
                });
            },
            (error) => {
                console.error("WebSocket connection error:", error);
            }
        );

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect(() => console.log("Disconnected from WebSocket"));
            }
        };
    }, [devices]);


    const handleNewMessage = (message) => {
        console.log("Processing new message:", message);
        setNotifications((prev) => {
            const updated = [...prev, message];
            const uniqueNotifications = Array.from(new Set(updated));
            return uniqueNotifications.slice(-10); // Keep only the last 10 notifications
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }



    const handleEditDeviceChange = (e) => {
        const { name, value } = e.target;
        setEditingDevice((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditDeviceClose = () => {
        setIsEditDeviceOpen(false);
        setEditingDevice({ description: '', address: '', maxEnergyConsumption: '' });
    };

    const handleEditDeviceOpen = (device) => {
        setEditingDevice(device);
        setIsEditDeviceOpen(true);
    };


    const handleEditDeviceSubmit = () => {
        const deviceData = { ...editingDevice, maxEnergyConsumption: parseFloat(editingDevice.maxEnergyConsumption) };
        setLoading(true);
        console.log("device data:", deviceData);
        updateDevice(editingDevice.id, deviceData, (data, status) => {
            if (status === 200) {
                setDevices((prevDevices) =>
                    prevDevices.map((device) => (device.id === editingDevice.id ? data : device))
                );
                handleEditDeviceClose();
            } else {
                setError("Failed to update device");
            }
            setLoading(false);
        })
    };

    const handleDeleteDevice = (id) => {
        setLoading(true);
        deleteDevices(id, (data, status) => {
            if (status == 200) {
                setDevices((prevDevices) =>
                    prevDevices.filter((device) => device.id !== id)
                );
            }
            setLoading(false);
        })
    };

    const handleLogout = () => {
        Cookies.remove('jwt', { secure: true, sameSite: 'strict' });
        Cookies.remove('personId', { secure: true, sameSite: 'strict' });
        Cookies.remove('role', { secure: true, sameSite: 'strict' });
        Cookies.remove('active', { secure: true, sameSite: 'strict' });

        alert("You have successfully logged out.");

        navigate("/login");
    };

    const handleOpenDatePicker = (device) => {
        setSelectedDevice(device);
        setIsDatePickerOpen(true);
    };

    const handleDatePickerClose = () => {
        setIsDatePickerOpen(false);
        setSelectedDevice(null);
    };

    const handleViewHistory = () => {
        if (selectedDevice) {
            const formattedDate = selectedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
            localStorage.setItem("currentDate", formattedDate);
            navigate(`/historical-consumption`, { state: { deviceId: selectedDevice.id, date: formattedDate } });
        }
        handleDatePickerClose();
    };

    const handleChatOpen = () => {
        navigate("/clientChat")
    };

    return (
        <Box style={styles.pageContainer}>

            {error && (
                <Alert severity="error" style={{ marginBottom: '20px' }}>
                    {error}
                </Alert>
            )}
            <Box>
                {notifications.map((notification, index) => (
                    <Alert
                        key={index}
                        severity="warning"
                        style={{ marginBottom: "10px" }}
                        onClose={() => {
                            setNotifications((prev) => prev.filter((_, i) => i !== index));
                        }}
                    >
                        {notification}
                    </Alert>
                ))}
            </Box>

            <Typography variant="h4" gutterBottom style={styles.welcomeText}>
                Bine ai venit, {user ? user.name : "Utilizator"}!
            </Typography>
            <Button
                onClick={handleLogout}
            >
                Logout
            </Button>
            <Button
                onClick={handleChatOpen}
            >
                MyChats
            </Button>
            {/* User Details Card */}
            <Box style={styles.cardContainer}>
                <Card style={{ backgroundColor: '#6BCB77', color: '#ffffff' }}>
                    <CardContent>
                        <Typography variant="h6">Detaliile tale</Typography>
                        <Typography color="inherit">
                            <strong>Nume:</strong> {user.name}
                        </Typography>
                        <Typography color="inherit">
                            <strong>Email:</strong> {user.email}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            <Typography variant="h6" gutterBottom style={{ color: styles.welcomeText.color }}>
                Dispozitivele tale
            </Typography>

            {/* Add Device Button */}
            {/* <Button variant="contained" onClick={handleAddDeviceOpen} style={styles.button}>
                Adaugă Dispozitiv
            </Button> */}

            {devices.length > 0 ? (
                <Grid container spacing={3} justifyContent="center">
                    {devices.map((device, index) => (
                        <Grid item xs={12} sm={6} md={4} key={device.id}>
                            <Card style={{ backgroundColor: styles.deviceColors[index % styles.deviceColors.length], color: '#ffffff' }}>
                                <CardContent>
                                    <Typography variant="h6" style={styles.cardTitle}>
                                        {device.description}
                                    </Typography>
                                    <Typography color="inherit">
                                        Adresă: {device.address}
                                    </Typography>
                                    <Typography color="inherit">
                                        Consum Max. Energie: {device.maxEnergyConsumption} kWh
                                    </Typography>
                                    <Box>
                                        <IconButton onClick={() => { handleEditDeviceOpen(device) }}>Edit</IconButton>
                                        <IconButton onClick={() => { handleDeleteDevice(device.id) }}>Delete</IconButton>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleOpenDatePicker(device)}
                                        >
                                            Vizualizează Istoricul
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body1" style={styles.noDevicesText}>
                    Nu există dispozitive asociate cu acest cont. Creează unul!
                </Typography>
            )}

            {/* Add Device Modal */}
            {/* <Dialog open={isAddDeviceOpen} onClose={handleAddDeviceClose}>
                <DialogTitle>Adaugă un nou dispozitiv</DialogTitle>
                <DialogContent>
                    <TextField
                        name="description"
                        label="Descriere"
                        value={newDevice.description}
                        onChange={handleDeviceChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        name="address"
                        label="Adresă"
                        value={newDevice.address}
                        onChange={handleDeviceChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        name="maxEnergyConsumption"
                        label="Consum Max. Energie (kWh)"
                        value={newDevice.maxEnergyConsumption}
                        onChange={handleDeviceChange}
                        type="number"
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddDeviceClose} color="secondary">Anulează</Button>
                    <Button onClick={handleDeviceSubmit} color="primary">Adaugă</Button>
                </DialogActions>
            </Dialog> */}
            {/* Edit Device Modal */}

            <Dialog open={isEditDeviceOpen} onClose={handleEditDeviceClose}>
                <DialogTitle>Editare dispozitiv</DialogTitle>
                <DialogContent>
                    <TextField
                        name="description"
                        label="Descriere"
                        value={editingDevice.description}
                        onChange={handleEditDeviceChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        name="address"
                        label="Adresă"
                        value={editingDevice.address}
                        onChange={handleEditDeviceChange}
                        fullWidth
                        margin="dense"
                    />
                    <TextField
                        name="maxEnergyConsumption"
                        label="Consum Max. Energie (kWh)"
                        value={editingDevice.maxEnergyConsumption}
                        onChange={handleEditDeviceChange}
                        type="number"
                        fullWidth
                        margin="dense"
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDeviceClose} color="secondary">Anulează</Button>
                    <Button onClick={handleEditDeviceSubmit} color="primary">Salvează</Button>
                </DialogActions>
            </Dialog>
            {/* Date Picker Dialog */}
            <Dialog open={isDatePickerOpen} onClose={handleDatePickerClose}>
                <DialogTitle>Alege o dată</DialogTitle>
                <DialogContent>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                        maxDate={new Date()} // Restrict past dates
                        inline
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDatePickerClose} color="secondary">
                        Anulează
                    </Button>
                    <Button onClick={handleViewHistory} color="primary">
                        Vizualizează
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ClientDashboard;
