async function performRequest(request, callback) {
    try {
        const response = await fetch(request);

        // Verificăm dacă răspunsul a fost de succes
        if (response.ok || response.status === 201) {
            let json;
            try {
                json = await response.json(); // În cazul în care există un corp de răspuns JSON
            } catch (error) {
                json = null; // Dacă răspunsul nu are corp, setăm `json` la null
            }
            callback(json, response.status, null);
        } else {
            // În caz de eroare, încercăm să extragem detaliile din răspuns
            const errorDetails = await response.json().catch(() => "Unknown error");
            callback(null, response.status, errorDetails);
        }
    } catch (err) {
        // În caz de eroare de rețea sau alt tip de eroare neașteptată
        callback(null, 1, err.message || "Unexpected error");
    }
}

export default {
    performRequest
};
