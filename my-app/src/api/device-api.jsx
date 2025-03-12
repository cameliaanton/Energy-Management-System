import { HOST } from './hosts'
import RestApiClient from './rest-client'
import Cookies from 'js-cookie';
const endpoint = {
    device: '/devices'
};


function getAllDevices(callback) {
    const token = Cookies.get('jwt');
    let request = new Request(`${HOST.backend_device_api}${endpoint.device}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });
    console.log(request.url);
    RestApiClient.performRequest(request, callback);
}

function getDevicesById(id, callback) {
    const token = Cookies.get('jwt');
    if (!id) {
        console.error("Error: 'id' parameter is required for getDevicesById");
        callback(null, 400, "ID is required");
        return;
    }
    let request = new Request(`${HOST.backend_device_api}${endpoint.device}/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });

    console.log("GET Request by ID URL:", request.url);
    RestApiClient.performRequest(request, callback);
}

function updateDevice(deviceId, deviceData, callback) {
    const token = Cookies.get('jwt');
    if (!deviceData || Object.keys(deviceData).length === 0) {
        console.error("Error: Person data is required for updateDevice.");
        callback(null, 400, "Person data is required");
        return;
    }
    const url = `${HOST.backend_device_api}${endpoint.device}/${deviceId}`;
    console.log("deivce data:", deviceData);
    let request = new Request(url, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(deviceData)
    });

    RestApiClient.performRequest(request, callback);
}

function deleteDevices(id, callback) {
    const token = Cookies.get('jwt');
    const url = `${HOST.backend_device_api}${endpoint.device}/${id}`;

    let request = new Request(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    RestApiClient.performRequest(request, callback);
}

export { getAllDevices, getDevicesById, updateDevice, deleteDevices }