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
    const [isCrashing, setIsCrashing] = useState(false)

    const handleAdminClick = () => {
        if (game.gameState === 'FLYING') {
            setIsCrashing(true)
            setTimeout(() => setIsCrashing(false), 1200)
            game.actions.forceCrash?.()
        }
    }

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

                    {/* Standalone Admin Game Bottom Control Bar (Image Matching) */}
                    {typeof window !== 'undefined' && window.parent === window && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '12px',
                            padding: '8px 0',
                            flexShrink: 0,
                        }}>
                            <div style={{ background: '#121316', borderRadius: '16px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>TOTAL BET</span>
                                <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace' }}>₹0.00</span>
                            </div>
                            <div style={{ background: '#121316', borderRadius: '16px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>TOTAL CASHOUT</span>
                                <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace' }}>₹0.00</span>
                            </div>
                            {/* 3. ADMIN BUTTON (RED FLYING / GREEN BETTING / CRIMSON CRASHED / AMBER CLICK) */}
                            <div
                                onClick={handleAdminClick}
                                style={{
                                    background: isCrashing
                                        ? 'linear-gradient(135deg, #f59e0b, #eab308)'
                                        : game.gameState === 'FLYING'
                                        ? 'linear-gradient(135deg, #e11d48, #dc2626)'
                                        : game.gameState === 'CRASHED'
                                        ? 'linear-gradient(135deg, #4c0519, #881337)'
                                        : 'linear-gradient(135deg, #059669, #10b981)',
                                    borderRadius: '16px',
                                    padding: '10px 8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    border: isCrashing
                                        ? '2px solid #fef08a'
                                        : game.gameState === 'FLYING'
                                        ? '2px solid #fca5a5'
                                        : game.gameState === 'CRASHED'
                                        ? '2px solid #e11d48'
                                        : '2px solid #6ee7b7',
                                    boxShadow: isCrashing
                                        ? '0 0 25px rgba(245, 158, 11, 0.95)'
                                        : game.gameState === 'FLYING'
                                        ? '0 0 20px rgba(239, 68, 68, 0.75)'
                                        : game.gameState === 'CRASHED'
                                        ? '0 0 10px rgba(225, 29, 72, 0.3)'
                                        : '0 0 15px rgba(16, 185, 129, 0.4)',
                                    transform: isCrashing ? 'scale(0.95)' : 'none',
                                    transition: 'all 0.15s ease',
                                    userSelect: 'none',
                                }}
                            >
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '900',
                                    color: isCrashing ? '#0f172a' : '#ffffff',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    marginBottom: '4px'
                                }}>
                                    ADMIN
                                </span>
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: '900',
                                    color: isCrashing ? '#0f172a' : '#ffffff',
                                    textTransform: 'uppercase'
                                }}>
                                    {isCrashing
                                        ? 'CRASHING...'
                                        : game.gameState === 'FLYING'
                                        ? 'CRASH NOW'
                                        : game.gameState === 'CRASHED'
                                        ? 'CRASHED'
                                        : 'BET TIME'}
                                </span>
                            </div>
                            <div style={{ background: '#121316', borderRadius: '16px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>MULTIPLIER</span>
                                <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace' }}>{game.gameState === 'FLYING' && game.multiplier ? `${Number(game.multiplier).toFixed(2)}x` : '₹0.00'}</span>
                            </div>
                            <div style={{ background: '#121316', borderRadius: '16px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>TOTAL PLAYER</span>
                                <span style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', fontFamily: 'monospace' }}>{game.liveBots.length}</span>
                            </div>
                        </div>
                    )}
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