import React, { useState } from 'react';
import { register } from '../api/person-api';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Input,
    Link,
    Typography,
} from "@mui/material";

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
        width: "calc(100% - 10px)", // Center within the container with slight margin
        padding: "12px",
        fontSize: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#f7f7f7",
        transition: "border-color 0.3s, box-shadow 0.3s",
        margin: "0 auto", // Center the input fields within the container
    },
    inputFocus: {
        borderColor: "#e28743",
        boxShadow: "0 0 5px rgba(226, 135, 67, 0.3)",
        outline: "none",
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
    typography: {
        margin: "0.5rem 0",
        fontWeight: "bold",
        fontFamily: "Roboto",
        color: "#e28743",
    },
    registerRouting: {
        fontFamily: "Roboto",
        color: "#333",
        marginTop: "1rem",
        textAlign: "center",
    },
};

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const role = 'CLIENT';
    const [password, setPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isHovering, setIsHovering] = useState(false); // State for hover effect
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== rePassword) {
            setError("Passwords do not match.");
            return;
        }

        const personRegister = { name, email, role, personPassword: password };

        register(personRegister, (data, status, err) => {
            if (status === 201) {
                setMessage("Registration successful! You can now log in.");
                navigate('/login');
            } else {
                setMessage("Registration failed.");
            }
        });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    return (
        <Container style={styles.container}>
            <Box style={styles.box}>
                <Typography variant="h4" style={styles.typography}>
                    Register
                </Typography>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <Box style={styles.fieldContainer}>
                        <label style={styles.label}>Name</label>
                        <Input
                            placeholder="Your Name"
                            required
                            name="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={styles.input}
                            disableUnderline
                        />
                    </Box>
                    <Box style={styles.fieldContainer}>
                        <label style={styles.label}>Email</label>
                        <Input
                            placeholder="Email@domain.com"
                            required
                            name="email"
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
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            disableUnderline
                        />
                    </Box>
                    <Box style={styles.fieldContainer}>
                        <label style={styles.label}>Confirm Password</label>
                        <Input
                            placeholder="Confirm Password"
                            required
                            name="rePassword"
                            type="password"
                            value={rePassword}
                            onChange={(e) => setRePassword(e.target.value)}
                            style={styles.input}
                            disableUnderline
                        />
                    </Box>
                    {error && (
                        <Typography color="error" style={{ marginTop: "10px" }}>{error}</Typography>
                    )}
                    {message && (
                        <Typography color={message === "Registration failed." ? "error" : "primary"} style={{ marginTop: "10px" }}>
                            {message}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        style={{
                            ...styles.submitButton,
                            ...(isHovering ? styles.submitButtonHover : {}),
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        Register
                    </Button>
                </form>
                <Box style={styles.registerRouting}>
                    <Typography variant="subtitle1">
                        Already have an account?
                    </Typography>
                    <Link
                        onClick={() => navigate("/login")}
                        underline="hover"
                        variant="subtitle1"
                        style={{
                            color: "#e28743",
                            fontFamily: "Roboto",
                            cursor: "pointer",
                        }}
                    >
                        Log in here
                    </Link>
                </Box>
            </Box>
        </Container>
    );
}

export default Register;
