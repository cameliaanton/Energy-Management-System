import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Button, Box, Typography, Card, CardContent } from '@mui/material';

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f2f5',
        padding: '20px'
    },
    card: {
        maxWidth: 400,
        padding: '20px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        textAlign: 'center',
    },
    welcomeText: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#3f51b5',
        marginBottom: '20px',
    },
    subtitle: {
        color: '#666',
        marginBottom: '20px',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '20px'
    },
    button: {
        padding: '10px 20px',
        fontWeight: 'bold',
        borderRadius: '8px',
    },
};

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = Cookies.get('jwt');
        const role = Cookies.get('role');

        if (token && role) {
            if (role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (role === 'CLIENT') {
                navigate('/client-dashboard');
            }
        }
    }, [navigate]);

    return (
        <Box style={styles.container}>
            <Card style={styles.card}>
                <CardContent>
                    <Typography style={styles.welcomeText} gutterBottom>
                        Welcome
                    </Typography>
                    <Typography variant="body1" style={styles.subtitle}>
                        Please log in or register to continue.
                    </Typography>
                    <Box style={styles.buttonContainer}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/login')}
                            style={styles.button}
                        >
                            Login
                        </Button>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => navigate('/register')}
                            style={styles.button}
                        >
                            Register
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default Home;
