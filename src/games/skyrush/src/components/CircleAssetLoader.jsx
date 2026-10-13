import React, { useState, useEffect, useRef } from 'react'

// All core loader assets
import loaderPlainImg from '../assets/loader/loaderplain.png'
import characterImg from '../assets/loader/character .png'
import character1Img from '../assets/loader/character1.png'
import boardingBadgeImg from '../assets/loader/boarding_passengers_badge.png'
import flightLoadingBarImg from '../assets/loader/flight_loading_bar_empty.png'
import flyingCharImg from '../assets/loader/flyingchar.png'

// All flight plane & wheel assets
import planeImg from '../assets/plane.png'
import jetImg from '../assets/jet.png'
import backWheelImg from '../assets/back-wheel.png'
import frontWheelImg from '../assets/front-wheel.png'

// World, background & space assets
import runwayImg from '../assets/runway-background.png'
import nightFrameImg from '../assets/nightframe.png'
import earthImg from '../assets/bg-parts/earth.png'
import asteroidImg from '../assets/bg-parts/aestroids.png'
import smallAsteroidImg from '../assets/bg-parts/aestroids small.png'
import blueCircleNebulaImg from '../assets/bg-parts/bluecirclenebula.png'
import dangerNebulaImg from '../assets/bg-parts/dangernumbula.png'
import roundedNebulaImg from '../assets/bg-parts/roundednumbula.png'
import blueNebulaImg from '../assets/bg-parts/blue nebula.png'
import brightStarsImg from '../assets/bg-parts/bright-stars.png'
import goldStarImg from '../assets/bg-parts/gold star.png'
import jupiterImg from '../assets/bg-parts/jupitor.png'
import moonImg from '../assets/bg-parts/moon.png'
import purplePlanetImg from '../assets/bg-parts/puple-planet.png'
import saturnImg from '../assets/bg-parts/saturn.png'
import saturnRedImg from '../assets/bg-parts/saturnred.png'
import cloudyPlanetImg from '../assets/bg-parts/cloudyplanet.png'
import pngwingImg from '../assets/bg-parts/pngwing.com.png'

const ALL_GAME_ASSETS = [
  // 1. Critical Loader Assets (plane + character + badges)
  loaderPlainImg,
  characterImg,
  character1Img,
  boardingBadgeImg,
  flightLoadingBarImg,
  flyingCharImg,

  // 2. Flight Jet & Gear
  planeImg,
  jetImg,
  backWheelImg,
  frontWheelImg,

  // 3. World & Atmosphere
  runwayImg,
  nightFrameImg,
  earthImg,
  moonImg,
  saturnImg,
  saturnRedImg,
  jupiterImg,
  purplePlanetImg,
  cloudyPlanetImg,
  dangerNebulaImg,
  roundedNebulaImg,
  blueNebulaImg,
  blueCircleNebulaImg,
  asteroidImg,
  smallAsteroidImg,
  brightStarsImg,
  goldStarImg,
  pngwingImg,
]

function preloadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    if (img.complete) {
      if (img.decode) {
        img.decode().then(resolve).catch(resolve)
      } else {
        resolve()
      }
    } else {
      img.onload = () => {
        if (img.decode) {
          img.decode().then(resolve).catch(resolve)
        } else {
          resolve()
        }
      }
      img.onerror = resolve
    }
  })
}

export default function CircleAssetLoader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const mountedRef = useRef(true)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    mountedRef.current = true
    let loadedCount = 0
    const total = ALL_GAME_ASSETS.length

    const handleOneLoaded = () => {
      if (!mountedRef.current) return
      loadedCount++
      const pct = Math.min(100, Math.round((loadedCount / total) * 100))
      setProgress(pct)
    }

    // Preload and decode all images in parallel
    const preloadPromises = ALL_GAME_ASSETS.map((src) =>
      preloadImage(src).then(handleOneLoaded)
    )

    // Complete loader when all assets are ready, or timeout safeguard after 3.5s
    const timeoutId = setTimeout(() => {
      finish()
    }, 3500)

    Promise.all(preloadPromises).then(() => {
      clearTimeout(timeoutId)
      finish()
    })

    function finish() {
      if (!mountedRef.current) return
      setProgress(100)
      setTimeout(() => {
        if (!mountedRef.current) return
        setIsFadingOut(true)
        setTimeout(() => {
          if (mountedRef.current && onCompleteRef.current) {
            onCompleteRef.current()
          }
        }, 350)
      }, 200)
    }

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div
      className={`circle-loader-backdrop ${isFadingOut ? 'fade-out' : ''}`}
      aria-hidden="true"
    >
      <div className="circle-spinner-box">
        <div className="circle-spinner-ring" />
        <svg
          className="circle-spinner-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </div>

      <div className="circle-loader-info">
        <span className="circle-loader-title">LOADING...</span>
        <div className="circle-loader-track-wrap">
          <div className="circle-loader-track">
            <div
              className="circle-loader-track-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="circle-loader-pct">{progress}%</span>
        </div>
      </div>
    </div>
  )
}
