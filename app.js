
// Inicializa el mapa centrado en las coordenadas dadas y con zoom 13
var map = L.map('map').setView([43.219, -2.7], 13);


// Variables globales para almacenar rutas, shapes y la ruta seleccionada
let routes;
let shapes;
let selectedRoute;



// Añade la capa de tiles de OpenStreetMap al mapa
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// Grupo de capas para las rutas dibujadas
const rutasCapa = L.layerGroup().addTo(map);


// Función principal de inicialización
async function init() {
    try {
        // 1. Carga el archivo de rutas (routes.txt)
        const response = await fetch("./routes.txt");
        // 2. Convierte la respuesta a texto
        const csvText = await response.text(); 
        // 3. Parsea el texto CSV usando PapaParse
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                console.log("Datos cargados:", result.data);
                routes = result.data; // Guarda las rutas en la variable global
            }
        });

        // Selecciona la primera ruta por defecto
        selectedRoute = routes[0]

        // 4. Carga el archivo de shapes (shapes.txt)
        const shapesResponse = await fetch("./shapes.txt");
        // 5. Convierte la respuesta a texto
        const shapesText = await shapesResponse.text(); 
        // 6. Parsea el texto CSV usando PapaParse
        Papa.parse(shapesText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                console.log("Datos cargados:", result.data);
                shapes = result.data; // Guarda los shapes en la variable global
            }
        });

        // Muestra las rutas y la shape seleccionada
        viewRoutes()
        viewShape()
    } catch (error) {
        // Manejo de errores en la carga de archivos
        console.error("Error cargando el CSV:", error);
    }
}


// Llama a la función de inicialización al cargar el script
init()



// Muestra la lista de rutas en el elemento con id "rutas"
function viewRoutes(){
    document.getElementById("rutas").innerHTML = `
        <ul>
        ${routes.map(ruta => `<li onClick="selectRoute('${ruta.route_short_name}')"class="${ruta.route_short_name == selectedRoute.route_short_name ? "selected" : ""}">${ruta.route_short_name}</li>`).join("")}
        </ul>
    `
}


// Cambia la ruta seleccionada y actualiza la vista
function selectRoute(short_name){
    selectedRoute = routes.find(route => route.route_short_name === short_name)
    viewRoutes()
    viewShape()
}


// Dibuja la shape de la ruta seleccionada en el mapa
function viewShape(){
    // Borra todas las líneas del grupo antes de dibujar la nueva
    rutasCapa.clearLayers();
    
    // Filtra los puntos de la shape que corresponden a la ruta seleccionada
    let shape = shapes.filter(shape => shape.shape_id.includes(selectedRoute.route_short_name))
        .map(shape => [shape.shape_pt_lat, shape.shape_pt_lon])
    
    // Crea la polilínea y la añade al mapa
    const polyline = L.polyline(shape, {
        color: 'red',       // Color de la línea
        weight: 5,          // Grosor de la línea
        opacity: 0.7,       // Transparencia
        smoothFactor: 1,    // Suavizado al hacer zoom
        fill: false,        // Evita que se comporte como polígono
        fillOpacity: 0      // Seguridad adicional
    }).addTo(rutasCapa);

    // Ajusta el zoom para que se vea toda la línea dibujada
    map.fitBounds(polyline.getBounds());

    // let simplified = L.simplify(shape, 20) // Ejemplo de simplificación (comentado)
    console.log("hoña") // Mensaje de depuración
}