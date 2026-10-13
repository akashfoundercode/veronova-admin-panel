import React, { useState } from 'react'
import Header from './components/Header.jsx'
import HistoryBar from './components/HistoryBar.jsx'
import FlightArena from './components/FlightArena.jsx'
import LiveBetsSidebar from './components/LiveBetsSidebar.jsx'
import ProvablyFairModal from './components/ProvablyFairModal.jsx'
import ProfileModal from './components/ProfileModal.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import RotateDeviceOverlay from './components/RotateDeviceOverlay.jsx'
import CircleAssetLoader from './components/CircleAssetLoader.jsx'
import { useGameEngine } from './hooks/useGameEngine.js'

export default function App() {
    const game = useGameEngine()
    const [isAssetsLoaded, setIsAssetsLoaded] = useState(false)
    const [fairModalTab, setFairModalTab] = useState(null) // 'rules' | 'fairness' | null
    const [mobileTab, setMobileTab] = useState('game') // 'game' | 'bets'
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    return (
        <div className="aviator-app-container">
            {/* Initial Circular Asset Preloader (Preloads plane, character & all game assets) */}
            {!isAssetsLoaded && (
                <CircleAssetLoader onComplete={() => setIsAssetsLoaded(true)} />
            )}

            {/* Top Header */}
            <Header
                hideBalance={true}
                profile={game.userProfile}
                onOpenProfileModal={() => setIsProfileOpen(true)}
                onResetBalance={game.actions.resetBalance}
                soundMuted={game.soundMuted}
                onToggleSound={game.actions.toggleSound}
                onOpenFairModal={(tab) => setFairModalTab(tab)}
                socketStatus={game.socketStatus}
            />

            {/* Top History Multiplier Pills */}
            <HistoryBar
                history={game.history}
            />

            {/* Mobile Switcher (Game / Live Bets) */}
            <div className="mobile-view-tabs">
                <button
                    className={`mobile-tab-btn ${mobileTab === 'game' ? 'active' : ''}`}
                    onClick={() => setMobileTab('game')}
                >
                    <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                    </svg>
                    Aviator Flight
                </button>
                <button
                    className={`mobile-tab-btn ${mobileTab === 'bets' ? 'active' : ''}`}
                    onClick={() => setMobileTab('bets')}
                >
                    <svg className="tab-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Live Bets ({game.liveBots.length})
                </button>
            </div>

            {/* Main Game Arena + Sidebar Layout */}
            <main className="aviator-main-layout">
                {/* Left: Live Bets Sidebar */}
                <div className={`sidebar-column ${mobileTab === 'bets' ? 'show-mobile' : ''}`}>
                    <LiveBetsSidebar
                        liveBots={game.liveBots}
                        myBetsHistory={game.myBetsHistory}
                        userActiveBets={game.bets}
                        gameState={game.gameState}
                    />
                </div>

                {/* Right: Flight Stage (Continuous Flight Simulation) */}
                <div className={`game-column ${mobileTab === 'game' ? 'show-mobile' : ''}`}>
                    {/* Central Flight Stage */}
                    <div className="stage-wrapper">
                        <FlightArena
                            gameState={game.gameState}
                            multiplier={game.multiplier}
                            countdown={game.countdown}
                            crashPoint={game.crashPoint}
                            flightElapsed={game.flightElapsed}
                            winNotification={game.winNotification}
                        />
                    </div>
                </div>
            </main>

            {/* Provably Fair / Rules Modal */}
            {fairModalTab && (
                <ProvablyFairModal
                    initialTab={fairModalTab}
                    onClose={() => setFairModalTab(null)}
                />
            )}

            {/* Pilot Profile Modal */}
            {isProfileOpen && (
                <ErrorBoundary fallback={null}>
                    <ProfileModal
                        profile={game.userProfile}
                        balance={game.balance}
                        onRefresh={game.actions.refreshProfile}
                        onClose={() => setIsProfileOpen(false)}
                    />
                </ErrorBoundary>
            )}

            {/* Mobile Portrait Orientation Prompt (Strict Landscape Requirement) */}
            <RotateDeviceOverlay />
        </div>
    )
}