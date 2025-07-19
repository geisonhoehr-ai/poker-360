"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudRain, Sun, Snowflake, CloudLightning, Wind } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Coordinates for Santa Maria, RS
const LATITUDE = -29.6842
const LONGITUDE = -53.8069

export function WeatherForecast() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError(null)
      try {
        // Using Open-Meteo for a simple, free, no-API-key-needed forecast
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current_weather=true&timezone=America%2FSao_Paulo`,
        )
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setWeather(data.current_weather)
      } catch (e: any) {
        console.error("Failed to fetch weather:", e)
        setError("Não foi possível carregar a previsão do tempo.")
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (weatherCode: number) => {
    // Open-Meteo WMO Weather interpretation codes (WW)
    // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
    if (weatherCode >= 0 && weatherCode <= 3) return <Sun className="h-8 w-8 text-yellow-500" /> // Clear sky, mainly clear, partly cloudy, overcast
    if (weatherCode >= 45 && weatherCode <= 48) return <Cloud className="h-8 w-8 text-gray-400" /> // Fog, depositing rime fog
    if (weatherCode >= 51 && weatherCode <= 67) return <CloudRain className="h-8 w-8 text-blue-500" /> // Drizzle, Rain
    if (weatherCode >= 71 && weatherCode <= 75) return <Snowflake className="h-8 w-8 text-blue-300" /> // Snow fall
    if (weatherCode >= 80 && weatherCode <= 82) return <CloudRain className="h-8 w-8 text-blue-600" /> // Rain showers
    if (weatherCode >= 85 && weatherCode <= 86) return <Snowflake className="h-8 w-8 text-blue-400" /> // Snow showers
    if (weatherCode >= 95 && weatherCode <= 96) return <CloudLightning className="h-8 w-8 text-gray-600" /> // Thunderstorm
    if (weatherCode === 99) return <CloudLightning className="h-8 w-8 text-gray-700" /> // Thunderstorm with hail
    return <Cloud className="h-8 w-8 text-gray-500" /> // Default to cloudy
  }

  const getWeatherDescription = (weatherCode: number) => {
    if (weatherCode === 0) return "Céu limpo"
    if (weatherCode === 1) return "Principalmente limpo"
    if (weatherCode === 2) return "Parcialmente nublado"
    if (weatherCode === 3) return "Nublado"
    if (weatherCode === 45 || weatherCode === 48) return "Nevoeiro"
    if (weatherCode >= 51 && weatherCode <= 55) return "Chuvisco"
    if (weatherCode >= 56 && weatherCode <= 57) return "Chuvisco congelante"
    if (weatherCode >= 61 && weatherCode <= 65) return "Chuva"
    if (weatherCode >= 66 && weatherCode <= 67) return "Chuva congelante"
    if (weatherCode >= 71 && weatherCode <= 75) return "Neve"
    if (weatherCode >= 77) return "Grãos de neve"
    if (weatherCode >= 80 && weatherCode <= 82) return "Pancadas de chuva"
    if (weatherCode >= 85 && weatherCode <= 86) return "Pancadas de neve"
    if (weatherCode >= 95 && weatherCode <= 96) return "Tempestade"
    if (weatherCode === 99) return "Tempestade com granizo"
    return "Condição desconhecida"
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      {" "}
      {/* Ajustado para ser mais largo */}
      <CardHeader>
        <CardTitle className="text-center">Mapa do Tempo</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center p-0">
        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : weather ? (
          <>
            <div className="flex items-center gap-2">
              {getWeatherIcon(weather.weathercode)}
              <span className="text-4xl font-bold text-foreground">{Math.round(weather.temperature)}°C</span>
            </div>
            <p className="text-sm text-muted-foreground">{getWeatherDescription(weather.weathercode)}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wind className="h-4 w-4" />
              <span>Vento: {Math.round(weather.windspeed)} km/h</span>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Dados de clima não disponíveis.</p>
        )}
        {/* Incorporar o mapa do Windy.com */}
        <iframe
          width="100%" // Ocupa a largura total do Card
          height="600" // Altura fixa para o mapa
          src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=default&zoom=5&overlay=wind&product=ecmwf&level=surface&lat=-33.064&lon=-53.877&detailLat=-29.701&detailLon=-53.874&detail=true&pressure=true&message=true"
          frameBorder="0"
          title="Windy.com Weather Map"
          className="rounded-b-lg" // Borda arredondada na parte inferior
        ></iframe>
      </CardContent>
    </Card>
  )
}
