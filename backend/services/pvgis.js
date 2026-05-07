const axios = require('axios');

// Pakistan cities with real coordinates
const PAKISTAN_CITIES = [
  { name: 'Islamabad', lat: 33.6844, lon: 73.0479 },
  { name: 'Lahore',    lat: 31.5204, lon: 74.3587 },
  { name: 'Karachi',   lat: 24.8607, lon: 67.0011 },
  { name: 'Peshawar',  lat: 34.0151, lon: 71.5249 },
  { name: 'Quetta',    lat: 30.1798, lon: 66.9750 },
];

// Fetch real solar data from PVGIS (FREE, no API key)
async function getSolarData(lat, lon, peakPower = 10) {
  try {
    const url = `https://re.jrc.ec.europa.eu/api/v5_2/seriescalc`;
    const params = {
      lat,
      lon,
      startyear: 2023,
      endyear: 2023,
      pvcalculation: 1,
      peakpower: peakPower,
      loss: 14,
      outputformat: 'json',
       browser: 0  
    };

    const response = await axios.get(url, { params, timeout: 15000 });
    const hourlyData = response.data.outputs.hourly;

    // Calculate daily average output
    const totalOutput = hourlyData.reduce((sum, h) => sum + (h.P || 0), 0);
    const avgHourlyOutput = totalOutput / hourlyData.length;
    const avgDailyOutput = avgHourlyOutput * 24;

    return {
      avgDailyOutput: parseFloat(avgDailyOutput.toFixed(2)),
      avgHourlyOutput: parseFloat(avgHourlyOutput.toFixed(2)),
      peakOutput: peakPower * 1000, // watts
      dataPoints: hourlyData.length
    };
  } catch (error) {
    console.error(`PVGIS error for ${lat},${lon}:`, error.message);
    // Fallback realistic values if API fails
    return {
      avgDailyOutput: peakPower * 4.5,
      avgHourlyOutput: peakPower * 0.4,
      peakOutput: peakPower * 1000,
      dataPoints: 0
    };
  }
}

module.exports = { getSolarData, PAKISTAN_CITIES };