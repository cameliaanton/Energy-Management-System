import { HOST } from './hosts'
import RestApiClient from './rest-client'
import Cookies from 'js-cookie';
const endpoint = {
    chat: '/chat'
};
const token = Cookies.get('jwt');

function getChatRoomsForUser(userId, callback) {
    if (!userId) {
        console.error("Error: 'userId' is required for getChatRoomsForUser");
        callback(null, 400, "User ID is required");
        return;
    }
    const url = `${HOST.backend_chat_api}${endpoint.chat}/rooms/user/${userId}`;
    const request = new Request(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    console.log("GET Request for user chat rooms URL:", request.url);
    RestApiClient.performRequest(request, callback);
}
function getChatRoomsForAdmin(adminId, callback) {
    if (!adminId) {
        console.error("Error: 'adminId' is required for getChatRoomsForAdmin");
        callback(null, 400, "Admin ID is required");
        return;
    }
    const url = `${HOST.backend_chat_api}${endpoint.chat}/rooms/admin/${adminId}`;
    const request = new Request(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    console.log("GET Request for admin chat rooms URL:", request.url);
    RestApiClient.performRequest(request, callback);
}

function getMessages(chatRoomId, callback) {
    if (!chatRoomId) {
        console.error("Error: 'chatRoomId' is required for getMessages");
        callback(null, 400, "Chat Room ID is required");
        return;
    }
    const url = `${HOST.backend_chat_api}${endpoint.chat}/messages/${chatRoomId}`;
    const request = new Request(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    console.log("GET Request for messages URL:", request.url);
    RestApiClient.performRequest(request, callback);
}

function getChatRoom(userId, adminId, callback) {
    if (!userId || !adminId) {
        console.error("Error: 'userId' and 'adminId' are required for createChatRoom");
        callback(null, 400, "User ID and Admin ID are required");
        return;
    }
    const url = `${HOST.backend_chat_api}${endpoint.chat}/room/${userId}/${adminId}`;
    const request = new Request(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    console.log("GET Request for geting the chat room URL:", request.url);
    RestApiClient.performRequest(request, callback);
}


// function sendMessage(chatRoomId, senderId, content, callback) {
//     if (!chatRoomId || !senderId || !content) {
//         console.error("Error: 'chatRoomId', 'senderId', and 'content' are required for sendMessage");
//         callback(null, 400, "Chat Room ID, Sender ID, and Content are required");
//         return;
//     }
//     const url = `${HOST.backend_chat_api}${endpoint.chat}/sendMessage`;
//     const request = new Request(url, {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             chatRoomId,
//             senderId,
//             content,
//         }),
//     });

//     console.log("POST Request for sending message URL:", request.url);
//     RestApiClient.performRequest(request, callback);
// }

export {
    getChatRoomsForUser,
    getChatRoomsForAdmin,
    getMessages,
    getChatRoom,
    // sendMessage,
};