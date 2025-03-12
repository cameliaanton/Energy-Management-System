import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';
import { getChatRoomsForAdmin, getMessages } from '../../api/chat-api';
import { HOST } from '../../api/hosts';
const client = new Client();

function AdminChat() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const adminId = Cookies.get('personId');
    const token = Cookies.get('jwt');

    const messagesEndRef = useRef(null);
    const selectedRoomRef = useRef(selectedRoom);

    useEffect(() => {
        selectedRoomRef.current = selectedRoom;
    }, [selectedRoom]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        client.configure({
            webSocketFactory: () => new SockJS(`${HOST.backend_chat_api}/ws?token=${token}`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => console.log(`WebSocket debug: ${str}`),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket');

                client.subscribe(`/topic/messages-${adminId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    if (selectedRoomRef.current && receivedMessage.chatRoomId === selectedRoomRef.current.id) {
                        setMessages((prev) => [...prev, receivedMessage]);
                    }

                    setRooms((prevRooms) =>
                        prevRooms.map((room) =>
                            room.id === receivedMessage.chatRoomId
                                ? { ...room, lastMessage: receivedMessage.content }
                                : room
                        )
                    );
                });

                client.subscribe(`/topic/typing-${adminId}`, (msg) => {
                    const typingNotification = JSON.parse(msg.body);
                    if (selectedRoomRef.current && typingNotification.chatRoomId === selectedRoomRef.current.id) {
                        setIsTyping(true);
                        setTimeout(() => setIsTyping(false), 3000);
                    }
                });

                // Abonare la notificarea de read
                client.subscribe(`/topic/read-${adminId}`, (msg) => {
                    const notification = msg.body; // "All messages read"
                    console.log("Read notification received:", notification);

                    // Dacă avem o cameră selectată, refă fetch la mesaje
                    if (selectedRoomRef.current) {
                        getMessages(selectedRoomRef.current.id, (data, status) => {
                            if (status === 200) {
                                console.log("Fetched messages after read notification:", data);
                                setMessages(data || []);
                            } else {
                                console.error('Error refetching messages after read notification (AdminChat).');
                            }
                        });
                    }
                });
            },
            onStompError: (frame) => {
                console.error(`Broker error: ${frame.headers['message']}`);
            },
        });

        client.activate();
        return () => client.deactivate();
    }, [adminId, token]);

    useEffect(() => {
        getChatRoomsForAdmin(adminId, (data, status) => {
            if (status === 200) {
                setRooms(data || []);
            } else {
                console.error('Error fetching chat rooms.');
            }
        });
    }, [adminId]);

    useEffect(() => {
        if (selectedRoom) {
            getMessages(selectedRoom.id, (data, status) => {
                if (status === 200) {
                    setMessages(data || []);
                } else {
                    console.error('Error fetching messages.');
                }
            });
        }
    }, [selectedRoom]);

    const handleSendMessage = () => {
        if (selectedRoom && newMessage.trim()) {
            const messagePayload = {
                chatRoomId: selectedRoom.id,
                senderId: adminId,
                content: newMessage,
            };

            client.publish({
                destination: '/app/sendMessage',
                body: JSON.stringify(messagePayload),
            });

            setMessages((prev) => [
                ...prev,
                {
                    senderId: adminId,
                    chatRoomId: selectedRoom.id,
                    content: newMessage,
                    timestamp: new Date().toISOString(),
                },
            ]);
            setNewMessage('');
        } else {
            alert('Select a user and type a message.');
        }
    };

    const handleTyping = () => {
        if (selectedRoom) {
            client.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({ chatRoomId: selectedRoom.id, senderId: adminId }),
            });
        }
    };

    const markMessagesAsRead = () => {
        if (!selectedRoom) return;
        const payload = {
            chatRoomId: selectedRoom.id,
            senderId: adminId // cine citește mesajele
        };

        client.publish({
            destination: '/app/chat.read',
            body: JSON.stringify(payload),
        });
    };

    // Stiluri pastel
    const containerStyle = {
        display: 'flex',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f7f7f7',
    };

    const sidebarStyle = {
        flex: 1,
        borderRight: '1px solid #ccc',
        padding: '10px',
        backgroundColor: '#ffe6e6',
        overflowY: 'auto'
    };

    const titleStyle = {
        marginBottom: '20px',
        color: '#333',
    };

    const roomItemStyle = (roomId) => ({
        padding: '10px',
        cursor: 'pointer',
        background: selectedRoom?.id === roomId ? '#ffdcdc' : 'white',
        marginBottom: '10px',
        borderRadius: '5px',
    });

    const chatAreaStyle = {
        flex: 3,
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
    };

    const headerStyle = {
        marginBottom: '10px',
        color: '#333',
    };

    const messagesContainerStyle = {
        flex: 1,
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        overflowY: 'auto',
        backgroundColor: '#fff9f9',
    };

    const typingStyle = {
        fontStyle: 'italic',
        color: '#888',
        marginBottom: '10px',
    };

    const inputContainerStyle = {
        display: 'flex',
        marginTop: '10px',
    };

    const inputStyle = {
        flex: 1,
        marginRight: '10px',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    };

    const buttonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#ccf2cc', // pastel verde
        cursor: 'pointer',
        fontWeight: 'bold',
    };

    const messageStyle = (isAdmin) => ({
        textAlign: isAdmin ? 'right' : 'left',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: isAdmin ? 'row-reverse' : 'row',
    });

    const messageBubbleStyle = (isAdmin) => ({
        background: isAdmin ? '#d1f7d1' : '#f1f1f1',
        padding: '10px',
        borderRadius: '5px',
        maxWidth: '60%',
        wordWrap: 'break-word',
    });

    const seenIconStyle = (isRead) => ({
        color: isRead ? '#28a745' : '#888', // Verde pentru citit, gri pentru necitit
        fontSize: '12px',
        marginLeft: '5px',
    });

    return (
        <div style={containerStyle}>
            <div style={sidebarStyle}>
                <h2 style={titleStyle}>Conversations</h2>
                {rooms.length > 0 ? (
                    rooms.map((room) => (
                        <div
                            key={room.id}
                            style={roomItemStyle(room.id)}
                            onClick={() => setSelectedRoom(room)}
                        >
                            <p style={{ margin: 0 }}><strong>User ID:</strong> {room.userId}</p>
                            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                                {room.lastMessage || 'No recent messages'}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No conversations available.</p>
                )}
            </div>
            <div style={chatAreaStyle}>
                {selectedRoom ? (
                    <>
                        <h2 style={headerStyle}>Chat with User ID: {selectedRoom.userId}</h2>
                        <div style={messagesContainerStyle}
                            onClick={markMessagesAsRead}
                        >
                            {messages.map((msg, index) => {
                                const isAdminUser = msg.senderId === adminId;
                                const timeString = msg.timestamp
                                    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : '';

                                return (
                                    <div key={index} style={messageStyle(isAdminUser)}>
                                        <div style={messageBubbleStyle(isAdminUser)}>
                                            <p style={{ margin: 0 }}>{msg.content}</p>
                                            <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                                                {timeString}
                                            </div>
                                            {/* Seen icon pentru mesajele trimise de admin */}
                                            {isAdminUser && (
                                                <FontAwesomeIcon
                                                    icon={faCheck}
                                                    style={seenIconStyle(msg.read)} // Gri sau verde în funcție de "read"
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        {isTyping && (
                            <p style={typingStyle}>User is typing...</p>
                        )}
                        <div style={inputContainerStyle}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onFocus={markMessagesAsRead}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSendMessage(); // Trimite mesajul la apăsarea Enter
                                    } else {
                                        handleTyping(); // Apelează funcția de typing pentru alte taste
                                    }
                                }}
                                placeholder="Type a message..."
                                style={inputStyle}
                            />
                            <button onClick={handleSendMessage} style={buttonStyle}>Send</button>
                        </div>
                    </>
                ) : (
                    <h2 style={headerStyle}>Select a conversation to start</h2>
                )}
            </div>
        </div>
    );
}

export default AdminChat;
