"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
});

export default function Home() {
  const [ipAddress, setIpAddress] = useState("");
  const [position, setPosition] = useState([51.505, -0.09]); // Default position
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState(null);
  const [timezone, setTimezone] = useState(null);

  const fetchTimezone = async (latitude, longitude) => {
    // Replace with your API key
    const url = `https://api.api-ninjas.com/v1/timezone?lat=${latitude}&lon=${longitude}`;

    try {
      const response = await fetch(url, {
        headers: {
          "X-Api-Key": process.env.NEXT_PUBLIC_API_NINJAS_KEY,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setTimezone(data.timezone);
      // console.log("timezone", data.timezone);
    } catch (error) {
      console.error("Error fetching timezone data:", error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!ipAddress) return; // No IP address or domain, do nothing

    setLoading(true);
    try {
      // Create a regex to check if the input is an IP address
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(ipAddress);

      // Construct the URL for the API request
      const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${
        process.env.NEXT_PUBLIC_GEOLOCATION_API_KEY
      }&ipAddress=${isIpAddress ? ipAddress : ""}&domain=${
        isIpAddress ? "" : ipAddress
      }`;

      // Fetch the geolocation data
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setPos(data);
      // console.log("data", data);

      const { location } = data;
      if (location) {
        setPosition([location.lat, location.lng]);
        // console.log("position", [location.lat, location.lng]);
      } else {
        console.error("Location not found in the response");
      }
    } catch (err) {
      console.error("Error fetching IP geolocation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (position && position.length === 2) {
      fetchTimezone(position[0], position[1]);
    }
  }, [position]);

  useEffect(() => {
    // console.log("Updated timezone:", timezone);
  }, [timezone]);

  return (
    <div className="relative min-h-screen">
      <div className="relative">
        <img
          className="w-full hidden md:block"
          src="/images/pattern-bg-desktop.png"
          alt="Background Image"
        />
        <img
          className="w-full flex md:hidden"
          src="/images/pattern-bg-mobile.png"
          alt="Background Image"
        />
        <div className="absolute inset-0 flex space-y-5 flex-col items-center justify-center">
          <h1 className="text-white text-2xl sm:text-3xl font-bold">
            IP Address Tracker
          </h1>
          <div className="w-3/4 md:w-2/4 relative">
            <input
              className="p-4 w-full rounded-lg pr-20"
              placeholder="Search for any IP address or domain"
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
            <button
              className="absolute right-0 top-0 h-full px-6 bg-black text-white rounded-r-lg"
              type="button"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <p>Loading...</p>
              ) : (
                <img src="/images/icon-arrow.svg" alt="Search" />
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white space-y-5 md:space-y-0 p-10 md:space-x-5 rounded-lg flex md:flex-row flex-col justify-center items-center">
        <div className="flex flex-col justify-center items-center md:items-start">
          <h1>IP ADDRESS</h1>
          <p className="font-bold">{pos && pos.ip}</p>
        </div>
        <div className="flex flex-col justify-center items-center md:items-start">
          <h1>LOCATION</h1>
          {pos && (
            <p className="font-bold">
              {pos && pos.location.city}, {pos && pos.location.country}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-center items-center md:items-start">
          <h1>TIMEZONE</h1>
          {pos && (
            <p className="font-bold">
              {timezone} {pos.location.timezone}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-center items-center md:items-start">
          <h1>ISP</h1>
          {pos && <p className="font-bold">{pos.isp}</p>}
        </div>
      </div>
      <Map position={position} className="h-screen" />
    </div>
  );
}
