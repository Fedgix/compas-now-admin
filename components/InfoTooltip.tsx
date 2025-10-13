'use client'

import { useState } from 'react'
import { FiInfo } from 'react-icons/fi'

interface InfoTooltipProps {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function InfoTooltip({ text, position = 'top' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div className="relative inline-block ml-1">
      <button
        type="button"
        className="text-blue-400 hover:text-blue-300 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.preventDefault()
          setIsVisible(!isVisible)
        }}
      >
        <FiInfo size={14} />
      </button>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fadeIn`}>
          <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg border border-gray-700 max-w-xs whitespace-normal">
            {text}
            <div 
              className={`absolute w-2 h-2 bg-gray-800 border-gray-700 transform rotate-45 ${
                position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b' :
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-l border-t' :
                position === 'left' ? 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2 border-t border-r' :
                'right-full top-1/2 translate-x-1/2 -translate-y-1/2 border-b border-l'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

