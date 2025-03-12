import { HOST } from './hosts'
import RestApiClient from './rest-client'
import Cookies from 'js-cookie';
const endpoint = {
    person: '/person'
};

function register(personRegister, callback) {
    if (!personRegister || Object.keys(personRegister).length === 0) {
        console.error("Error: Registration data is required.");
        callback(null, 400, "Registration data is required");
        return;
    }
    console.log("imd facem request")
    let request = new Request(`${HOST.backend_user_api}${endpoint.person}/register`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(personRegister)
    });
    console.log(request.url);
    console.log("bjsnmdjadsk");
    RestApiClient.performRequest(request, callback);
}

function login(personLogin, callback) {
    if (!personLogin || Object.keys(personLogin).length === 0) {
        console.error("Error: Login data is required.");
        callback(null, 400, "Login data is required");
        return;
    }
    let request = new Request(`${HOST.backend_user_api}${endpoint.person}/login`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(personLogin)
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}


function getPersons(callback) {
    const token = Cookies.get('jwt');
    let request = new Request(`${HOST.backend_user_api}${endpoint.person}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function getPersonById(id, callback) {
    const token = Cookies.get('jwt');
    if (!id) {
        console.error("Error: 'id' parameter is required for getPersonById");
        callback(null, 400, "ID is required");
        return;
    }
    let request = new Request(`${HOST.backend_user_api}${endpoint.person}/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Set Authorization header with token
            'Content-Type': 'application/json',
        }
    });

    console.log("GET Request by ID URL:", request.url);
    RestApiClient.performRequest(request, callback);
}

function postPerson(user, callback) {
    const token = Cookies.get('jwt');
    if (!user || Object.keys(user).length === 0) {
        console.error("Error: User data is required for postPerson.");
        callback(null, 400, "User data is required");
        return;
    }
    let request = new Request(`${HOST.backend_user_api}${endpoint.person}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Set Authorization header with token
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    });

    console.log("POST Person URL:", request.url);

    RestApiClient.performRequest(request, callback);
}
function updatePerson(id, personData, callback) {
    if (!personData || Object.keys(personData).length === 0) {
        console.error("Error: Person data is required for updatePerson.");
        callback(null, 400, "Person data is required");
        return;
    }

    const token = Cookies.get('jwt');
    const url = `${HOST.backend_user_api}${endpoint.person}/${id}`;

    let request = new Request(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData)
    });

    RestApiClient.performRequest(request, callback);
}

function deletePerson(id, callback) {
    const token = Cookies.get('jwt');
    const url = `${HOST.backend_user_api}${endpoint.person}/${id}`;

    let request = new Request(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    RestApiClient.performRequest(request, callback);
}

function addDevice(id, deviceData, callback) {
    if (!deviceData || Object.keys(deviceData).length === 0) {
        console.error("Error: Device data is required for addDevice.");
        callback(null, 400, "Device data is required");
        return;
    }

    const token = Cookies.get('jwt');
    const url = `${HOST.backend_user_api}/person/devices/${id}`;

    let request = new Request(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData)
    });

    RestApiClient.performRequest(request, callback);
}

function getDevices(id, callback) {
    const token = Cookies.get('jwt');
    const url = `${HOST.backend_user_api}/person/${id}/devices`;

    let request = new Request(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    RestApiClient.performRequest(request, callback);
}

function getAdmins(callback) {
    const token = Cookies.get('jwt');
    const url = `${HOST.backend_user_api}/person/admins`;

    let request = new Request(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    RestApiClient.performRequest(request, callback);
}

function getUsers(callback) {
    const token = Cookies.get('jwt');
    const url = `${HOST.backend_user_api}/person/users`;

    let request = new Request(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    RestApiClient.performRequest(request, callback);
}

export { register, login, getPersons, getPersonById, postPerson, updatePerson, getDevices, addDevice, deletePerson, getAdmins, getUsers };
