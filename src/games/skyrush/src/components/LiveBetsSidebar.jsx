import React, { useState, useMemo } from 'react'
import { soundManager } from '../utils/audio'
import { getMultiplierColor } from '../utils/crash'
import { getFirstName } from '../utils/playerPool'

function LiveBetsSidebar({
  liveBots = [],
  myBetsHistory = [],
  userActiveBets = [],
  gameState,
}) {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'my' | 'top'

  // Calculate stats for current round - memoized to prevent recomputing on every frame
  const totalBets = useMemo(
    () => liveBots.length + userActiveBets.length,
    [liveBots.length, userActiveBets.length]
  )

  const totalAmount = useMemo(() => {
    return liveBots.reduce((sum, b) => sum + b.amount, 0) +
      userActiveBets.reduce((sum, b) => sum + (b.status !== 'IDLE' ? b.amount : 0), 0)
  }, [liveBots, userActiveBets])

  // Filter top wins for top tab - memoized to prevent re-sorting on every frame
  const topWins = useMemo(() => {
    return [...myBetsHistory, ...liveBots]
      .filter((b) => (b.payout || 0) > 0)
      .sort((a, b) => (b.payout || 0) - (a.payout || 0))
      .slice(0, 25)
  }, [myBetsHistory, liveBots])

  return (
    <aside className="aviator-sidebar">
      {/* Sidebar Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => {
            soundManager.playClick()
            setActiveTab('all')
          }}
        >
          All Bets
        </button>
        <button
          className={`sidebar-tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => {
            soundManager.playClick()
            setActiveTab('my')
          }}
        >
          My Bets
        </button>
        <button
          className={`sidebar-tab-btn ${activeTab === 'top' ? 'active' : ''}`}
          onClick={() => {
            soundManager.playClick()
            setActiveTab('top')
          }}
        >
          Top
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="sidebar-stats-bar">
        <div className="stats-item">
          <span className="stats-label">ALL BETS:</span>
          <span className="stats-val">{totalBets}</span>
        </div>
        <div className="stats-item">
          <span className="stats-label">TOTAL:</span>
          <span className="stats-val">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Bets Table Header */}
      <div className="bets-table-header">
        <span>User</span>
        <span>Bet (₹)</span>
        <span>X</span>
        <span>Win (₹)</span>
      </div>

      {/* Bets List Content */}
      <div className="bets-list-scroll">
        {/* ALL BETS TAB */}
        {activeTab === 'all' && (
          <div className="bets-table-body">
            {/* User's own active bets at top */}
            {userActiveBets.map((ub, idx) => {
              if (ub.status === 'IDLE') return null
              return (
                <div key={`my-active-${idx}`} className="bet-row user-own-bet-row">
                  <div className="user-col">
                    <div className="user-avatar-frame">
                      <span className="user-avatar-dot user-avatar-me">YOU</span>
                    </div>
                    <span className="username">You</span>
                  </div>
                  <div className="amount-col">₹{ub.amount}</div>
                  <div className="mult-col">
                    {ub.status === 'CASHED_OUT' ? (
                      <span className="mult-pill cashed-pill">
                        {ub.cashedAt?.toFixed(2)}x
                      </span>
                    ) : ub.status === 'ACTIVE' ? (
                      <span className="mult-pill active-pill">In flight</span>
                    ) : ub.status === 'PENDING' ? (
                      <span className="mult-pill pending-pill">Pending</span>
                    ) : (
                      <span className="mult-pill lost-pill">-</span>
                    )}
                  </div>
                  <div className="payout-col">
                    {ub.status === 'CASHED_OUT' ? (
                      <span className="payout-win">
                        ₹{ub.payout?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
              )
            })}

            {/* Simulated Live Players */}
            {liveBots.map((bot) => (
              <div
                key={bot.id}
                className={`bet-row ${bot.cashedOut ? 'row-cashed-out' : ''}`}
              >
                <div className="user-col">
                  <div className="user-avatar-frame">
                    {bot.avatarUrl ? (
                      <img
                        src={bot.avatarUrl}
                        alt=""
                        className="user-avatar-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          if (e.currentTarget.nextSibling) {
                            e.currentTarget.nextSibling.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <span
                      className="user-avatar-dot"
                      style={{
                        backgroundColor: bot.avatarColor || '#e53935',
                        display: bot.avatarUrl ? 'none' : 'flex',
                      }}
                    >
                      {getFirstName(bot.user || 'P').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="username">{getFirstName(bot.user)}</span>
                </div>
                <div className="amount-col">₹{bot.amount}</div>
                <div className="mult-col">
                  {bot.cashedOut ? (
                    <span className="mult-pill cashed-pill">
                      {bot.cashedAt?.toFixed(2)}x
                    </span>
                  ) : (
                    <span className="mult-pill in-play-pill">-</span>
                  )}
                </div>
                <div className="payout-col">
                  {bot.cashedOut ? (
                    <span className="payout-win">
                      ₹{bot.payout?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MY BETS TAB */}
        {activeTab === 'my' && (
          <div className="bets-table-body">
            {myBetsHistory.length === 0 ? (
              <div className="sidebar-empty">
                <p>No bets placed yet.</p>
                <span>Place a bet to see your history!</span>
              </div>
            ) : (
              myBetsHistory.map((item, idx) => (
                <div key={`history-bet-${idx}`} className="bet-row">
                  <div className="user-col">
                    <span className="user-avatar-dot user-avatar-me">★</span>
                    <span className="username">Round #{item.roundId}</span>
                  </div>
                  <div className="amount-col">₹{item.amount}</div>
                  <div className="mult-col">
                    {item.cashedOut ? (
                      <span
                        className="mult-pill cashed-pill"
                        style={{ color: getMultiplierColor(item.multiplier) }}
                      >
                        {item.multiplier.toFixed(2)}x
                      </span>
                    ) : (
                      <span className="mult-pill lost-pill">Lost</span>
                    )}
                  </div>
                  <div className="payout-col">
                    {item.cashedOut ? (
                      <span className="payout-win">
                        ₹{item.payout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="payout-lost">-₹{item.amount}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TOP TAB */}
        {activeTab === 'top' && (
          <div className="bets-table-body">
            {topWins.length === 0 ? (
              <div className="sidebar-empty">
                <p>No big wins recorded yet.</p>
              </div>
            ) : (
              topWins.map((item, idx) => (
                <div key={`top-${idx}`} className="bet-row">
                  <div className="user-col">
                    <div className="user-avatar-frame">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt=""
                          className="user-avatar-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            if (e.currentTarget.nextSibling) {
                              e.currentTarget.nextSibling.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <span
                        className="user-avatar-dot top-rank-dot"
                        style={{
                          display: item.avatarUrl ? 'none' : 'flex',
                        }}
                      >
                        #{idx + 1}
                      </span>
                    </div>
                    <span className="username">{getFirstName(item.user || 'You')}</span>
                  </div>
                  <div className="amount-col">₹{item.amount}</div>
                  <div className="mult-col">
                    <span
                      className="mult-pill cashed-pill"
                      style={{ color: getMultiplierColor(item.cashedAt || item.multiplier || 2) }}
                    >
                      {(item.cashedAt || item.multiplier)?.toFixed(2)}x
                    </span>
                  </div>
                  <div className="payout-col">
                    <span className="payout-win">
                      ₹{item.payout?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

export default React.memo(LiveBetsSidebar)

