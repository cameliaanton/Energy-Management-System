import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useLocation } from "react-router-dom";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { HOST } from '../api/hosts'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function HistoricalConsumptionPage() {
    const location = useLocation();
    const { deviceId, date: initialDate } = location.state || {};
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hourlyData, setHourlyData] = useState([]);
    const savedDate = localStorage.getItem("currentDate");
    const [currentDate, setCurrentDate] = useState(
        savedDate ? new Date(savedDate) : new Date(initialDate)
    );

    useEffect(() => {
        // Salvează data curentă în localStorage
        localStorage.setItem("currentDate", currentDate.toISOString().split("T")[0]);
    }, [currentDate]);
    const parseDateArray = (dateArray) => {
        const [year, month, day, hour, minute] = dateArray;
        return new Date(year, month - 1, day, hour, minute); // Month is 0-based in JS
    };

    const formatDate = (date) => {
        return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const formattedDate = formatDate(currentDate);
                const response = await fetch(
                    `${HOST.backend_monitoring_api}/api/historical-consumption/${deviceId}?date=${formattedDate}`
                );
                if (!response.ok) {
                    const errorText = await response.text(); // Read backend error message
                    throw new Error(`Error: ${response.status} - ${errorText}`);
                }
                const data = await response.json();
                setHourlyData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [deviceId, currentDate]);

    const handleNextDay = () => {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCurrentDate(nextDay);
    };

    const handlePrevDay = () => {
        const prevDay = new Date(currentDate);
        prevDay.setDate(prevDay.getDate() - 1);
        setCurrentDate(prevDay);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    const chartData = {
        labels: hourlyData.map((item) => {
            const date = parseDateArray(item.date);
            return `${date.getHours()}:00`; // Display hour as "0:00", "1:00", etc.
        }),
        datasets: [
            {
                label: "Energy Consumption (kWh)",
                data: hourlyData.map((item) => item.consumption),
                backgroundColor: "rgba(54, 162, 235, 0.8)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `Hourly Energy Consumption for ${formatDate(currentDate)}`,
            },
        },
        scales: {
            x: {
                type: "category",
                title: {
                    display: true,
                    text: "Hour",
                },
            },
            y: {
                type: "linear",
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Consumption (kWh)",
                },
            },
        },
    };

    return (
        <Box>
            <Typography variant="h4" align="center" gutterBottom>
                Hourly Energy Consumption for Device {deviceId} on {formatDate(currentDate)}
            </Typography>

            <Box display="flex" justifyContent="center" gap={2} mt={2}>
                <Button variant="contained" color="primary" onClick={handlePrevDay}>
                    Previous Day
                </Button>
                <Button variant="contained" color="primary" onClick={handleNextDay}>
                    Next Day
                </Button>
            </Box>

            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                width="100%"
                mt={4}
            >
                <Typography variant="h6" align="center">
                    Line Chart:
                </Typography>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    className="chart-container"
                    width="90%"
                    height="400px"
                >
                    <Line data={chartData} options={chartOptions} />
                </Box>
            </Box>

            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                width="100%"
                mt={4}
            >
                <Typography variant="h6" align="center">
                    Bar Chart:
                </Typography>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    className="chart-container"
                    width="90%"
                    height="400px"
                >
                    <Bar data={chartData} options={chartOptions} />
                </Box>
            </Box>
        </Box>
    );
}

export default HistoricalConsumptionPage;
