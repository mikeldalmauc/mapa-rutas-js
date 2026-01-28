var map = L.map('map').setView([43.219, -2.7], 13);

let routes;
let shapes;
let selectedRoute;


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// L.marker([43.219, -2.7]).addTo(map)
//     .bindPopup('A pretty CSS popup.<br> Easily customizable.')
//     .openPopup();



async function init() {
    try {
        // 1. Hacemos el fetch y esperamos la respuesta
        const response = await fetch("./routes.txt");
        
        // 2. IMPORTANTE: Esperamos a que la respuesta se convierta en texto
        const csvText = await response.text(); 

        // 3. Pasamos el TEXTO (string) a PapaParse
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                console.log("Datos cargados:", result.data);
                routes = result.data; // Asigna aquí tu variable global
            }
        });

        selectedRoute = routes[0]

        // 1. Hacemos el fetch y esperamos la respuesta
        const shapesResponse = await fetch("./shapes.txt");
        
        // 2. IMPORTANTE: Esperamos a que la respuesta se convierta en texto
        const shapesText = await shapesResponse.text(); 

        // 3. Pasamos el TEXTO (string) a PapaParse
        Papa.parse(shapesText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                console.log("Datos cargados:", result.data);
                shapes = result.data; // Asigna aquí tu variable global
            }
        });

        viewRoutes()
        viewShape()
    } catch (error) {
        console.error("Error cargando el CSV:", error);
    }
}

init()


function viewRoutes(){
    document.getElementById("rutas").innerHTML = `
        <ul>
        ${routes.map(ruta => `<li onClick="selectRoute('${ruta.route_short_name}')"class="${ruta.route_short_name == selectedRoute.route_short_name ? "selected" : ""}">${ruta.route_short_name}</li>`).join("")}
        </ul>
    `
}

function selectRoute(short_name){
    selectedRoute = routes.find(route => route.route_short_name === short_name)
    viewRoutes()
    viewShape()
}

function viewShape(){

    let shape = shapes.filter(shape => shape.shape_id.includes(selectedRoute.route_short_name)).map(shape => [shape.shape_pt_lat, shape.shape_pt_lon])
    
    // 3. Crear la polilínea y añadirla al mapa
    const polyline = L.polyline(shape, {
        color: 'red',       // Color de la línea
        weight: 5,          // Grosor
        opacity: 0.7,       // Transparencia
        smoothFactor: 1     // Suavizado al hacer zoom
    }).addTo(map);

    // 4. (Opcional) Ajustar el zoom para que se vea toda la línea
    map.fitBounds(polyline.getBounds());

    // let simplified = L.simplify(shape, 20)
    console.log("hoña")
}