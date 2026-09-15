// 1. Seleccionar elementos HTML del documento
const currentTemp = document.querySelector('#current-temp');
const weatherIcon = document.querySelector('#weather-icon');
const captionDesc = document.querySelector('figcaption');

// 2. Definir la URL de la API (reemplaza apiKey con tu clave completa)
const apiKey = '870b92ccf5bf295150f40244809649e3'; 
const lat = 49.75;
const lon = 6.64;
const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

// 3. Función asíncrona para obtener los datos meteorológicos
async function apiFetch() {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log(data); // Muestra los datos en consola para verificación
      displayResults(data); // Renderiza los datos en el HTML
    } else {
      throw Error(await response.text());
    }
  } catch (error) {
    console.log(error);
  }
}

// 4. Función para mostrar los resultados en la página web
function displayResults(data) {
  // Muestra la temperatura con el símbolo de grados °F
  currentTemp.innerHTML = `${data.main.temp.toFixed(0)}&deg;F`;
  
  // Construye la URL del icono
  const iconsrc = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  
  // Obtiene la descripción del tiempo
  let desc = data.weather[0].description;
  
  // Configura los atributos de la imagen y el texto de la leyenda
  weatherIcon.setAttribute('src', iconsrc);
  weatherIcon.setAttribute('alt', desc);
  captionDesc.textContent = `${desc}`;
}

// 5. Invocación de la función principal
apiFetch();