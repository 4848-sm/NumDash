'use client'

import { useState, useCallback, useEffect } from 'react'

// ゲームモードの定義
type GameMode = {
  name: string
  description: string
  numbers: number[]
}

// スコア記録の型定義
type ScoreRecord = {
  mode: string
  time: number
  date: string
}

const GAME_MODES: GameMode[] = [
  {
    name: '初級（1-9）',
    description: '1から9まで順番にタップ',
    numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9]
  },
  {
    name: '2の倍数',
    description: '2の倍数を順番にタップ',
    numbers: [] // 後で設定
  },
  {
    name: '3の倍数',
    description: '3の倍数を順番にタップ',
    numbers: [] // 後で設定
  },
  {
    name: '4の倍数',
    description: '4の倍数を順番にタップ',
    numbers: [] // 後で設定
  },
  {
    name: '5の倍数',
    description: '5の倍数を順番にタップ',
    numbers: [] // 後で設定
  },
  {
    name: '6の倍数',
    description: '6の倍数を順番にタップ',
    numbers: [] // 後で設定
  },
  {
    name: '7の倍数',
    description: '7の倍数を順番にタップ',
    numbers: [] // 後で設定
  },
  {
    name: '8の倍数',
    description: '8の倍数を順番にタップ',
    numbers: [] // 後で設定
  },
  {
    name: '9の倍数',
    description: '9の倍数を順番にタップ',
    numbers: [] // 後で設定
  }
]

// 数字ボタンの位置情報
type NumberPosition = {
  number: number
  x: number
  y: number
  isCompleted: boolean
}

export default function NumberTapGame() {
  // ゲーム状態管理
  const [gameState, setGameState] = useState<'menu' | 'difficulty' | 'playing' | 'finished'>('menu')
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'3x3' | '4x4' | null>(null)
  const [numberPositions, setNumberPositions] = useState<NumberPosition[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [isShaking, setIsShaking] = useState(false)
  const [errorBackground, setErrorBackground] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [scores, setScores] = useState<ScoreRecord[]>([])
  const [showScores, setShowScores] = useState(false)

  // デバイス判定
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // スコア読み込み
  useEffect(() => {
    const savedScores = localStorage.getItem('numberTapGameScores')
    if (savedScores) {
      setScores(JSON.parse(savedScores))
    }
  }, [])

  // スコア保存
  const saveScore = useCallback((mode: string, time: number) => {
    const newScore: ScoreRecord = {
      mode,
      time,
      date: new Date().toLocaleDateString('ja-JP')
    }
    const updatedScores = [...scores, newScore]
      .sort((a, b) => a.time - b.time)
      .slice(0, 50)
    
    setScores(updatedScores)
    localStorage.setItem('numberTapGameScores', JSON.stringify(updatedScores))
  }, [scores])

  // ベストスコア取得
  const getBestScore = useCallback((mode: string) => {
    const modeScores = scores.filter(score => score.mode === mode)
    return modeScores.length > 0 ? modeScores[0].time : null
  }, [scores])

  // 倍数の数字を生成する関数
  const generateMultiples = (multiplier: number, difficulty: '3x3' | '4x4') => {
    const count = difficulty === '3x3' ? 9 : 16
    return Array.from({ length: count }, (_, i) => (i + 1) * multiplier)
  }

  // 数字をグリッド配置する関数
  const shuffleNumbers = useCallback((numbers: number[]) => {
    // 3×3グリッドの場合
    if (numbers.length === 9) {
      const gridPositions = [
        { x: 25, y: 30 }, { x: 50, y: 30 }, { x: 75, y: 30 },
        { x: 25, y: 50 }, { x: 50, y: 50 }, { x: 75, y: 50 },
        { x: 25, y: 70 }, { x: 50, y: 70 }, { x: 75, y: 70 }
      ]
      
      // 数字をシャッフル
      const shuffledNumbers = [...numbers].sort(() => Math.random() - 0.5)
      
      return shuffledNumbers.map((number, index) => ({
        number,
        x: gridPositions[index].x,
        y: gridPositions[index].y,
        isCompleted: false
      }))
    }
    
    // 4×4グリッドの場合
    if (numbers.length === 16) {
      const gridPositions = [
        { x: 20, y: 30 }, { x: 40, y: 30 }, { x: 60, y: 30 }, { x: 80, y: 30 },
        { x: 20, y: 45 }, { x: 40, y: 45 }, { x: 60, y: 45 }, { x: 80, y: 45 },
        { x: 20, y: 60 }, { x: 40, y: 60 }, { x: 60, y: 60 }, { x: 80, y: 60 },
        { x: 20, y: 75 }, { x: 40, y: 75 }, { x: 60, y: 75 }, { x: 80, y: 75 }
      ]
      
      // 数字をシャッフル
      const shuffledNumbers = [...numbers].sort(() => Math.random() - 0.5)
      
      return shuffledNumbers.map((number, index) => ({
        number,
        x: gridPositions[index].x,
        y: gridPositions[index].y,
        isCompleted: false
      }))
    }
    
    // その他の場合はランダム配置（フォールバック）
    const positions: NumberPosition[] = numbers.map((number) => {
      const margin = isMobile ? 10 : 15
      return {
        number,
        x: margin + Math.random() * (100 - margin * 2),
        y: margin + Math.random() * (100 - margin * 2),
        isCompleted: false
      }
    })
    return positions
  }, [isMobile])

  // キーボード操作対応（PC用）
  useEffect(() => {
    if (gameState !== 'playing' || !selectedMode || isMobile) return

    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key
      if (key >= '0' && key <= '9') {
        const number = parseInt(key)
        handleNumberClick(number)
      } else if (key === 'Enter' || key === ' ') {
        const expectedNumber = selectedMode.numbers[currentIndex]
        handleNumberClick(expectedNumber)
      } else if (key === 'Escape') {
        backToMenu()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, selectedMode, currentIndex, isMobile])

  // モード選択（初級は直接ゲーム開始、倍数は難易度選択へ）
  const selectMode = (mode: GameMode) => {
    setSelectedMode(mode)
    if (mode.name === '初級（1-9）') {
      // 初級は直接ゲーム開始
      startGame(mode, '3x3')
    } else {
      // 倍数は難易度選択画面へ
      setGameState('difficulty')
    }
  }

  // ゲーム開始
  const startGame = (mode: GameMode, difficulty: '3x3' | '4x4') => {
    setSelectedDifficulty(difficulty)
    
    let numbers: number[]
    if (mode.name === '初級（1-9）') {
      numbers = mode.numbers
    } else {
      // 倍数を抽出（例：「2の倍数」→ 2）
      const multiplier = parseInt(mode.name.charAt(0))
      numbers = generateMultiples(multiplier, difficulty)
    }
    
    const updatedMode = { ...mode, numbers }
    setSelectedMode(updatedMode)
    setNumberPositions(shuffleNumbers(numbers))
    setCurrentIndex(0)
    setStartTime(null)
    setEndTime(null)
    setGameState('playing')
  }

  // 数字ボタンクリック処理
  const handleNumberClick = (clickedNumber: number) => {
    if (!selectedMode || gameState !== 'playing') return

    const expectedNumber = selectedMode.numbers[currentIndex]

    // 最初のクリックでタイマー開始
    if (currentIndex === 0 && startTime === null) {
      setStartTime(Date.now())
    }

    if (clickedNumber === expectedNumber) {
      // 正解の場合
      setNumberPositions(prev => 
        prev.map(pos => 
          pos.number === clickedNumber 
            ? { ...pos, isCompleted: true }
            : pos
        )
      )
      
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)

      // ゲーム完了チェック
      if (nextIndex >= selectedMode.numbers.length) {
        const completionTime = Date.now()
        setEndTime(completionTime)
        setGameState('finished')
        
        // スコアを保存（難易度も含める）
        if (startTime) {
          const finalTime = (completionTime - startTime) / 1000
          const modeWithDifficulty = selectedDifficulty ? 
            `${selectedMode.name}（${selectedDifficulty}）` : selectedMode.name
          saveScore(modeWithDifficulty, finalTime)
        }
      }
    } else {
      // 不正解の場合 - 視覚的フィードバック
      setIsShaking(true)
      setErrorBackground(true)
      
      setTimeout(() => {
        setIsShaking(false)
        setErrorBackground(false)
      }, 500)
    }
  }

  // メニューに戻る
  const backToMenu = () => {
    setGameState('menu')
    setSelectedMode(null)
    setSelectedDifficulty(null)
    setNumberPositions([])
    setCurrentIndex(0)
    setStartTime(null)
    setEndTime(null)
  }

  // 経過時間の計算
  const getElapsedTime = () => {
    if (!startTime) return 0
    const end = endTime || Date.now()
    return ((end - startTime) / 1000).toFixed(2)
  }

  // メニュー画面
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-4 relative overflow-hidden">
        {/* 散りばめられた絵文字 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s'}}>🍭</div>
          <div className="absolute top-20 right-20 text-2xl animate-bounce" style={{animationDelay: '0.5s'}}>🍩</div>
          <div className="absolute top-40 left-1/4 text-2xl animate-bounce" style={{animationDelay: '1s'}}>🍓</div>
          <div className="absolute top-60 right-1/3 text-2xl animate-bounce" style={{animationDelay: '1.5s'}}>🍪</div>
          <div className="absolute bottom-40 left-20 text-2xl animate-bounce" style={{animationDelay: '2s'}}>🌷</div>
          <div className="absolute bottom-60 right-10 text-2xl animate-bounce" style={{animationDelay: '2.5s'}}>🍀</div>
          <div className="absolute top-1/3 left-10 text-2xl animate-bounce" style={{animationDelay: '3s'}}>🐰</div>
          <div className="absolute bottom-20 right-1/4 text-2xl animate-bounce" style={{animationDelay: '3.5s'}}>🐿️</div>
          <div className="absolute top-80 right-40 text-2xl animate-bounce" style={{animationDelay: '4s'}}>🦋</div>
          <div className="absolute bottom-80 left-1/3 text-2xl animate-bounce" style={{animationDelay: '4.5s'}}>🐬</div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold text-purple-600 text-center mb-4 mt-8">
            数字早押しゲーム
          </h1>
          <p className="text-purple-500 text-center mb-8 text-lg font-medium">
            {isMobile ? 'タップして数字を順番に押そう！' : 'クリックして数字を順番に押そう！'}
          </p>
          
          {/* スコア表示ボタン */}
          <div className="text-center mb-6">
            <button
              onClick={() => setShowScores(!showScores)}
              className="bg-gradient-to-r from-blue-300 to-purple-300 hover:from-blue-400 hover:to-purple-400 text-purple-700 font-bold py-2 px-6 rounded-full transition-all duration-200 shadow-lg"
            >
              {showScores ? 'スコアを隠す' : 'ベストスコアを見る'}
            </button>
          </div>

          {/* スコア表示 */}
          {showScores && (
            <div className="bg-white bg-opacity-80 rounded-xl p-4 mb-6 border-2 border-purple-200">
              <h3 className="text-lg font-bold text-purple-700 mb-3 text-center">ベストスコア</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                {GAME_MODES.map((mode) => {
                  if (mode.name === '初級（1-9）') {
                    const bestScore = getBestScore(mode.name)
                    return (
                      <div key={mode.name} className="flex justify-between items-center bg-purple-50 rounded-lg p-2">
                        <span className="font-medium text-purple-600">{mode.name}</span>
                        <span className="font-bold text-purple-800">
                          {bestScore ? `${bestScore.toFixed(2)}秒` : '未プレイ'}
                        </span>
                      </div>
                    )
                  } else {
                    const bestScore3x3 = getBestScore(`${mode.name}（3x3）`)
                    const bestScore4x4 = getBestScore(`${mode.name}（4x4）`)
                    return (
                      <div key={mode.name} className="bg-purple-50 rounded-lg p-2">
                        <div className="font-medium text-purple-600 mb-1">{mode.name}</div>
                        <div className="text-xs">
                          <div className="flex justify-between">
                            <span>3×3:</span>
                            <span className="font-bold text-purple-800">
                              {bestScore3x3 ? `${bestScore3x3.toFixed(2)}秒` : '未プレイ'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>4×4:</span>
                            <span className="font-bold text-purple-800">
                              {bestScore4x4 ? `${bestScore4x4.toFixed(2)}秒` : '未プレイ'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {GAME_MODES.map((mode, index) => {
              const bestScore3x3 = mode.name !== '初級（1-9）' ? getBestScore(`${mode.name}（3x3）`) : null
              const bestScore4x4 = mode.name !== '初級（1-9）' ? getBestScore(`${mode.name}（4x4）`) : null
              const bestScoreInitial = mode.name === '初級（1-9）' ? getBestScore(mode.name) : null
              
              return (
                <button
                  key={index}
                  onClick={() => selectMode(mode)}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left group border-2 border-purple-100 hover:border-pink-200"
                >
                  <h3 className="text-xl font-bold text-purple-700 mb-2 group-hover:text-pink-600 transition-colors">
                    {mode.name}
                  </h3>
                  <p className="text-purple-500 text-sm font-medium mb-2">
                    {mode.description}
                  </p>
                  {mode.name === '初級（1-9）' && bestScoreInitial && (
                    <p className="text-xs text-green-600 font-bold">
                      ベスト: {bestScoreInitial.toFixed(2)}秒
                    </p>
                  )}
                  {mode.name !== '初級（1-9）' && (bestScore3x3 || bestScore4x4) && (
                    <div className="text-xs text-green-600 font-bold">
                      {bestScore3x3 && <div>3×3: {bestScore3x3.toFixed(2)}秒</div>}
                      {bestScore4x4 && <div>4×4: {bestScore4x4.toFixed(2)}秒</div>}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          {!isMobile && (
            <div className="mt-8 text-center text-purple-600 bg-white bg-opacity-60 rounded-xl p-4 max-w-2xl mx-auto border-2 border-purple-100">
              <h3 className="font-bold mb-2 text-lg">PC操作方法</h3>
              <p className="text-sm font-medium">
                マウスクリックで数字を選択<br/>
                Escキーでメニューに戻る
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 難易度選択画面
  if (gameState === 'difficulty') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-100 to-purple-100 p-4 flex items-center justify-center relative overflow-hidden">
        {/* 散りばめられた絵文字 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-16 text-2xl animate-bounce" style={{animationDelay: '0s'}}>�</div>
          <div className="absolute top-32 right-32 text-2xl animate-bounce" style={{animationDelay: '1s'}}>🍩</div>
          <div className="absolute bottom-32 left-32 text-2xl animate-bounce" style={{animationDelay: '2s'}}>�</div>
          <div className="absolute bottom-16 right-16 text-2xl animate-bounce" style={{animationDelay: '3s'}}>🍀</div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-lg w-full border-2 border-purple-200 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mb-4">
            {selectedMode?.name}
          </h2>
          <p className="text-purple-600 mb-8 text-lg font-medium">
            難易度を選択してください
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => selectedMode && startGame(selectedMode, '3x3')}
              className="w-full bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-colors text-xl shadow-lg"
            >
              🍓 3×3マス（簡単）🍪
              <div className="text-sm mt-1 opacity-90">9個の数字</div>
            </button>
            
            <button
              onClick={() => selectedMode && startGame(selectedMode, '4x4')}
              className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-colors text-xl shadow-lg"
            >
              🌷 4×4マス（難しい）🍀
              <div className="text-sm mt-1 opacity-90">16個の数字</div>
            </button>
          </div>
          
          <button
            onClick={backToMenu}
            className="mt-6 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-xl transition-colors"
          >
            🐰 戻る 🐿️
          </button>
        </div>
      </div>
    )
  }

  // ゲーム完了画面
  if (gameState === 'finished') {
    const currentTime = parseFloat(getElapsedTime())
    const modeWithDifficulty = selectedDifficulty ? 
      `${selectedMode?.name}（${selectedDifficulty}）` : selectedMode?.name || ''
    const bestScore = getBestScore(modeWithDifficulty)
    const isNewRecord = !bestScore || currentTime < bestScore
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-green-200 to-blue-200 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-xl text-center max-w-lg w-full border-2 border-green-200">
          <div className="text-3xl mb-4">🎉 🍭 🎉</div>
          <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
            ゲーム完了！
          </h2>
          {isNewRecord && (
            <div className="text-2xl font-bold text-red-500 mb-2 animate-bounce">
              🏆 🌟 新記録！ 🌟 🏆
            </div>
          )}
          <div className="text-6xl md:text-7xl font-bold text-green-600 mb-4">
            {getElapsedTime()}秒
          </div>
          <div className="text-2xl mb-4">🍓 🍪 🍩</div>
          <p className="text-green-600 mb-4 text-lg font-semibold">
            {modeWithDifficulty}をクリアしました！
          </p>
          {bestScore && !isNewRecord && (
            <p className="text-sm text-purple-600 mb-4">
              ベスト記録: {bestScore.toFixed(2)}秒
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => selectedMode && selectedDifficulty && startGame(selectedMode, selectedDifficulty)}
              className="w-full bg-gradient-to-r from-blue-400 to-purple-400 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-colors text-lg shadow-lg"
            >
              🔄 🐰 もう一度プレイ 🐿️
            </button>
            <button
              onClick={backToMenu}
              className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl transition-colors text-lg shadow-lg"
            >
              🏠 🌷 メニューに戻る 🍀
            </button>
          </div>
          {!isMobile && (
            <p className="text-sm text-purple-500 mt-4 font-medium">
              🦋 Escキーでメニューに戻ることもできます 🐬
            </p>
          )}
          <div className="text-xl mt-4">🍀 🌷 🍓 🍭</div>
        </div>
      </div>
    )
  }

  // ゲームプレイ画面
  return (
    <div 
      className={`min-h-screen relative overflow-hidden transition-all duration-300 ${
        errorBackground ? 'bg-red-200' : 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100'
      } ${isShaking ? 'shake' : ''}`}
    >
      {/* ヘッダー */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white bg-opacity-80 text-purple-700 p-4 border-b-2 border-purple-200">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <button
            onClick={backToMenu}
            className="bg-purple-200 hover:bg-purple-300 px-4 py-2 rounded-xl transition-all text-sm md:text-base font-semibold text-purple-700"
          >
            🏠 🌷 メニュー
          </button>
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-bold">
              🍭 {selectedMode?.name}{selectedDifficulty ? `（${selectedDifficulty}）` : ''} 🍩
            </h2>
            <div className="text-sm md:text-base font-semibold">
              🍓 {currentIndex + 1} / {selectedMode?.numbers.length} 🍪
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg md:text-xl font-bold">
              ⏱️ {startTime ? getElapsedTime() : '0.00'}秒
            </div>
            <div className="text-sm md:text-base font-semibold">
              🎯 次: {selectedMode?.numbers[currentIndex] || '完了'}
            </div>
          </div>
        </div>
        {!isMobile && (
          <div className="text-center mt-2 text-sm bg-purple-100 rounded-lg px-4 py-1 max-w-md mx-auto font-medium text-purple-600">
            🐰 マウスクリック、Escキーが使えます 🐿️
          </div>
        )}
        <div className="text-center mt-2">
          <span className="text-lg">🍀 🌷 🦋 🐬</span>
        </div>
      </div>

      {/* 数字ボタン */}
      <div className="absolute inset-0 pt-32 pb-4">
        {numberPositions.map((pos, index) => {
          // 3×3と4×4でサイズを調整
          const is3x3Mode = selectedMode?.numbers.length === 9
          const buttonSize = is3x3Mode 
            ? (isMobile ? 'w-20 h-20 text-2xl' : 'w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-3xl md:text-4xl lg:text-5xl')
            : (isMobile ? 'w-16 h-16 text-lg' : 'w-18 h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 text-xl md:text-2xl lg:text-3xl')
          
          return (
            <button
              key={index}
              onClick={() => handleNumberClick(pos.number)}
              disabled={pos.isCompleted}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${buttonSize} 
                rounded-full font-bold transition-all duration-200 select-none border-2 ${
                pos.isCompleted
                  ? 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed border-gray-300'
                  : 'bg-white hover:bg-pink-50 text-purple-700 shadow-lg hover:shadow-xl hover:scale-105 border-purple-200 hover:border-pink-300'
              }`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
              }}
            >
              {pos.number}
            </button>
          )
        })}
      </div>
    </div>
  )
}