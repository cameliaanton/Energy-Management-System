import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';
import { Client } from '@stomp/stompjs';
import { getMessages, getChatRoom } from '../../api/chat-api';
import { getAdmins } from '../../api/person-api';
import { HOST } from '../../api/hosts';

const client = new Client();
let pendingMessages = [];

function ClientChat() {
    const [admins, setAdmins] = useState([]);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatRoom, setChatRoom] = useState(null);
    const [isTyping, setIsTyping] = useState(false);

    const userId = Cookies.get('personId');
    const token = Cookies.get('jwt');

    const messagesEndRef = useRef(null); // Referință pentru ultimul mesaj

    // Scroll la ultimul mesaj
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

                client.subscribe(`/topic/messages-${userId}`, (msg) => {
                    const newMsg = JSON.parse(msg.body);
                    if (chatRoom && newMsg.chatRoomId === chatRoom.id) {
                        setMessages((prev) => [...prev, newMsg]);
                    }
                });

                client.subscribe(`/topic/typing-${userId}`, (msg) => {
                    const typingNotification = JSON.parse(msg.body);
                    if (typingNotification.chatRoomId === chatRoom?.id) {
                        setIsTyping(true);
                        setTimeout(() => setIsTyping(false), 3000);
                    }
                });

                client.subscribe(`/topic/read-${userId}`, (msg) => {
                    console.log(msg);
                    const notification = msg.body;
                    console.log("Read notification received (client):", notification);

                    if (chatRoom) {
                        getMessages(chatRoom.id, (data, status) => {
                            if (status === 200) {
                                console.log(messages);
                                setMessages(data || []);
                                console.log(messages);
                            } else {
                                console.error('Error refetching messages after read notification (ClientChat).');
                            }
                        });
                    }
                });

                pendingMessages.forEach((messagePayload) => {
                    client.publish({
                        destination: '/app/sendMessage',
                        body: JSON.stringify(messagePayload),
                    });
                    console.log('Pending message sent:', messagePayload);
                });
                pendingMessages = [];
            },
            onStompError: (frame) => {
                console.error(`Broker error: ${frame.headers['message']}`);
            },
        });

        client.activate();
        return () => client.deactivate();
    }, [token, userId, chatRoom]);

    useEffect(() => {
        getAdmins((data, status) => {
            if (status === 200) {
                const adminList = data.map((person) => ({ adminId: person.id }));
                setAdmins(adminList);
            } else {
                console.error('Error fetching admins');
            }
        });
    }, []);

    const handleSelectAdmin = (adminId) => {
        getChatRoom(userId, adminId, (data, status) => {
            if (status === 200 || status === 201) {
                setSelectedAdmin(adminId);
                setChatRoom(data);
                fetchMessages(data.id);
            } else {
                alert('Failed to create or fetch chat room.');
            }
        });
    };

    const fetchMessages = (chatRoomId) => {
        getMessages(chatRoomId, (data, status) => {
            if (status === 200) {
                setMessages(data || []);
            } else {
                alert('Failed to fetch messages.');
            }
        });
    };

    const sendMessage = (chatRoomId, senderId, content) => {
        if (!chatRoomId || !senderId || !content.trim()) return;

        const messagePayload = { chatRoomId, senderId, content };

        if (client.connected) {
            client.publish({
                destination: '/app/sendMessage',
                body: JSON.stringify(messagePayload),
            });
        } else {
            pendingMessages.push(messagePayload);
        }
    };

    const handleSendMessage = () => {
        if (chatRoom && newMessage.trim()) {
            sendMessage(chatRoom.id, userId, newMessage);
            setMessages((prev) => [
                ...prev,
                { senderId: userId, content: newMessage, timestamp: new Date().toISOString() },
            ]);
            setNewMessage('');
        } else {
            alert('Please select a chat room and type a message.');
        }
    };

    const handleTyping = () => {
        if (chatRoom) {
            client.publish({
                destination: '/app/chat.typing',
                body: JSON.stringify({ chatRoomId: chatRoom.id, senderId: userId }),
            });
        }
    };

    const markMessagesAsRead = () => {
        if (!chatRoom) return;

        const payload = {
            chatRoomId: chatRoom.id,
            senderId: userId // cine citește mesajele
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
        backgroundColor: '#ffe6e6', // pastel roz deschis
        overflowY: 'auto'
    };

    const titleStyle = {
        marginBottom: '20px',
        color: '#333',
    };

    const adminItemStyle = (adminId) => ({
        padding: '10px',
        cursor: 'pointer',
        background: selectedAdmin === adminId ? '#ffdcdc' : 'white',
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

    const messageStyle = (isCurrentUser) => ({
        textAlign: isCurrentUser ? 'right' : 'left',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
    });

    const messageBubbleStyle = (isCurrentUser) => ({
        background: isCurrentUser ? '#d1f7d1' : '#f1f1f1',
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
                <h2 style={titleStyle}>Admins</h2>
                {admins.length > 0 ? (
                    admins.map((admin) => (
                        <div
                            key={admin.adminId}
                            style={adminItemStyle(admin.adminId)}
                            onClick={() => handleSelectAdmin(admin.adminId)}
                        >
                            <p style={{ margin: 0 }}>Admin ID: {admin.adminId}</p>
                        </div>
                    ))
                ) : (
                    <p>No administrators available.</p>
                )}
            </div>
            <div style={chatAreaStyle}>
                {chatRoom ? (
                    <>
                        <h2 style={headerStyle}>Chat with Admin ID: {selectedAdmin}</h2>
                        <div style={messagesContainerStyle}
                            onClick={markMessagesAsRead}

                        >
                            {messages.map((msg, index) => {
                                const isCurrentUser = msg.senderId === userId;
                                return (
                                    <div key={index} style={messageStyle(isCurrentUser)}>
                                        <div style={messageBubbleStyle(isCurrentUser)}>
                                            <p style={{ margin: 0 }}>{msg.content}</p>
                                            <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {/* Seen icon */}
                                            {isCurrentUser && (
                                                <FontAwesomeIcon
                                                    icon={faCheck}
                                                    style={seenIconStyle(msg.read)} // Stilizează în funcție de `read`
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        {isTyping && <p style={typingStyle}>Admin is typing...</p>}
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
                    <h2 style={headerStyle}>Select an admin to start a conversation</h2>
                )}
            </div>
        </div>
    );
}

export default ClientChat;
