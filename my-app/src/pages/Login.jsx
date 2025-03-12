import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/person-api';
import Cookies from 'js-cookie';
import { Box, Button, Link, Container, Input, Typography, Snackbar, Alert } from "@mui/material";

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f4f0",
    },
    box: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "320px",
        padding: "1.5rem",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        borderRadius: "10px",
        backgroundColor: "white",
        border: `1px solid #e28743`,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
    },
    fieldContainer: {
        width: "100%",
        marginTop: "15px",
        textAlign: "left",
    },
    label: {
        fontSize: "12px",
        color: "#888",
        fontWeight: 500,
        marginBottom: "5px",
        paddingLeft: "5px",
    },
    input: {
        width: "calc(100% - 10px)",
        padding: "12px",
        fontSize: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f7f7f7",
        transition: "border-color 0.3s, box-shadow 0.3s",
        margin: "0 auto",
    },
    submitButton: {
        backgroundColor: "#e28743",
        color: "white",
        fontWeight: "bold",
        margin: "1rem 0",
        borderRadius: "20px",
        fontFamily: "Roboto",
        padding: "0.5rem",
        textTransform: "none",
        width: "100%",
        transition: "background-color 0.3s, transform 0.2s",
    },
    submitButtonHover: {
        backgroundColor: "#bf6c34",
        transform: "scale(1.02)",
    },
    registerRouting: {
        fontFamily: "Roboto",
        color: "f9f4f0",
    },
    typography: {
        margin: "0.5rem 0",
        fontWeight: "bold",
        fontFamily: "Roboto",
        color: "#e28743",
    },
};

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showErrorSnackbar, setShowErrorSnackbar] = useState(false); // For controlling Snackbar visibility
    const [isHovering, setIsHovering] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const personLogin = { email, personPassword: password };

        login(personLogin, (data, status, err) => {
            if (err) {
                setError("Login failed. Please check your credentials.");
                setShowErrorSnackbar(true); // Show Snackbar on error
                return;
            }

            Cookies.set('jwt', data.jwt, { expires: 1, secure: true, sameSite: 'strict' });
            Cookies.set('personId', data.personId, { expires: 1, secure: true, sameSite: 'strict' });
            Cookies.set('role', data.role, { expires: 1, secure: true, sameSite: 'strict' });
            Cookies.set('active', 'true', { expires: 1, secure: true, sameSite: 'strict' })

            if (data.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else {
                navigate('/client-dashboard');
            }
        });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const handleCloseSnackbar = () => setShowErrorSnackbar(false);

    return (
        <Container style={styles.container}>
            <Box style={styles.box}>
                <Typography variant="h4" style={styles.typography}>
                    Login
                </Typography>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <Box style={styles.fieldContainer}>
                        <label style={styles.label}>Email</label>
                        <Input
                            placeholder="Email"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            disableUnderline
                        />
                    </Box>
                    <Box style={styles.fieldContainer}>
                        <label style={styles.label}>Password</label>
                        <Input
                            placeholder="Password"
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            disableUnderline
                        />
                    </Box>
                    <Button
                        type="submit"
                        style={{
                            ...styles.submitButton,
                            ...(isHovering ? styles.submitButtonHover : {}),
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        Sign in
                    </Button>
                    <Box
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "10px",
                            justifyContent: "center",
                        }}
                    >
                        <Typography style={styles.registerRouting} variant="subtitle1">
                            Don’t have an account?
                        </Typography>
                        <Link
                            onClick={() => navigate("/register")}
                            underline="hover"
                            variant="subtitle1"
                            // style={styles.registerRouting}
                            style={{
                                color: "#e28743",
                                fontFamily: "Roboto",
                                cursor: "pointer",
                            }}
                        >
                            Register here
                        </Link>
                    </Box>
                </form>
            </Box>

            <Snackbar
                open={showErrorSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default Login;
