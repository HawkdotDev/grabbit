import React, { useState } from 'react'
import { X, Palette, GripHorizontal, RotateCcw, Check, Sparkles } from 'lucide-react'
import { CustomThemeColors } from '../../../../engine/types'
import { useDraggable } from '../../hooks/useDraggable'

export const PRESET_THEMES: Record<string, { label: string; colors: CustomThemeColors }> = {
  carrot: {
    label: 'Carrot 🥕 (Pastel Orange & Mint Green on Pitch Black)',
    colors: {
      bg: '#000000',
      surface: '#0a120b',
      card: '#111d13',
      border: '#1f3822',
      accent: '#ff9e43',
      bright: '#ffc085',
      tint: '#341d0b'
    }
  },
  dark: {
    label: 'Dark IDE 🌙 (Default)',
    colors: {
      bg: '#0d0e12',
      surface: '#14151c',
      card: '#1b1c26',
      border: '#272938',
      accent: '#b497ff',
      bright: '#c4b5fd',
      tint: '#2c2244'
    }
  },
  cyberpunk: {
    label: 'Cyberpunk ⚡ (Neon Yellow & Magenta on Obsidian)',
    colors: {
      bg: '#08080c',
      surface: '#10101a',
      card: '#181826',
      border: '#2a2a44',
      accent: '#ffe600',
      bright: '#ff0055',
      tint: '#332b00'
    }
  },
  emerald: {
    label: 'Emerald Forest 🌿 (Pastel Mint & Dark Sage)',
    colors: {
      bg: '#060f0c',
      surface: '#0b1915',
      card: '#11241e',
      border: '#1b3b31',
      accent: '#34d399',
      bright: '#6ee7b7',
      tint: '#0d3326'
    }
  },
  nordic: {
    label: 'Nordic Frost ❄️ (Arctic Blue & Slate)',
    colors: {
      bg: '#0b1320',
      surface: '#111c2e',
      card: '#18273e',
      border: '#263b5c',
      accent: '#38bdf8',
      bright: '#7dd3fc',
      tint: '#0e2e4a'
    }
  }
}

interface ThemeCustomizerModalProps {
  isOpen: boolean
  onClose: () => void
  currentColors?: CustomThemeColors
  onSave: (colors: CustomThemeColors) => void
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentColors,
  onSave
}) => {
  const [colors, setColors] = useState<CustomThemeColors>(
    () => currentColors || PRESET_THEMES['carrot']!.colors
  )
  const [prevPropColors, setPrevPropColors] = useState<CustomThemeColors | undefined>(currentColors)

  if (currentColors !== prevPropColors) {
    setPrevPropColors(currentColors)
    if (currentColors) {
      setColors(currentColors)
    }
  }

  const { position, isDragging, isBlinking, handleMouseDown, handleBackdropClick, modalRef } =
    useDraggable(isOpen)

  if (!isOpen) return null

  const handleColorChange = (key: keyof CustomThemeColors, val: string): void => {
    setColors((prev) => ({ ...prev, [key]: val }))
  }

  const loadPreset = (presetKey: string): void => {
    if (PRESET_THEMES[presetKey]) {
      setColors(PRESET_THEMES[presetKey].colors)
    }
  }

  const handleApply = (e: React.FormEvent): void => {
    e.preventDefault()
    onSave(colors)
    onClose()
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4 select-none font-sans text-xs"
    >
      <div
        ref={modalRef}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        className={`bg-ide-surface border border-ide-border rounded-none w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col ${
          isDragging ? 'transition-none duration-0' : ''
        } ${isBlinking ? 'animate-modal-blink' : ''}`}
      >
        {/* Title Bar */}
        <div
          onMouseDown={handleMouseDown}
          className="px-4 py-2.5 bg-linear-to-r from-ide-surface to-ide-bg border-b border-ide-border flex items-center justify-between cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <GripHorizontal className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <div className="p-1.5 bg-amber-950/40 rounded-none border border-amber-500/25">
              <Palette className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-xs block">
                Advanced Theme Customizer
              </span>
              <span className="text-[10px] text-slate-500 block">
                Fine-tune CSS color tokens or load custom presets
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-none transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleApply} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              Quick Theme Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(PRESET_THEMES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => loadPreset(key)}
                  className="px-2.5 py-1 bg-ide-bg hover:bg-white/10 border border-ide-border hover:border-amber-400/50 text-[11px] text-slate-300 hover:text-white rounded-none cursor-pointer transition flex items-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Tokens Grid */}
          <div className="grid grid-cols-2 gap-3 border-t border-ide-border/60 pt-3">
            {[
              { key: 'bg', label: 'Background Color', desc: 'Main window background' },
              { key: 'surface', label: 'Surface Color', desc: 'Panels and header bars' },
              { key: 'card', label: 'Card Color', desc: 'Table rows & cards' },
              { key: 'border', label: 'Border Color', desc: 'Dividers and outlines' },
              { key: 'accent', label: 'Primary Accent', desc: 'Buttons, highlights, badges' },
              { key: 'bright', label: 'Bright Highlight', desc: 'Hover states & active text' },
              { key: 'tint', label: 'Tint Background', desc: 'Active menu & selection tint' }
            ].map((token) => (
              <div
                key={token.key}
                className="p-2.5 bg-ide-bg/60 border border-ide-border/80 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-slate-200 text-xs block">{token.label}</span>
                  <span className="text-[10px] text-slate-500 block">{token.desc}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="color"
                    value={colors[token.key as keyof CustomThemeColors]}
                    onChange={(e) =>
                      handleColorChange(token.key as keyof CustomThemeColors, e.target.value)
                    }
                    className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded-none"
                  />
                  <span className="font-mono text-[10px] text-slate-400 uppercase w-14">
                    {colors[token.key as keyof CustomThemeColors]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Live Preview Box */}
          <div
            style={{
              backgroundColor: colors.bg,
              borderColor: colors.border
            }}
            className="p-3 border rounded-none space-y-2"
          >
            <div className="flex items-center justify-between">
              <span style={{ color: colors.bright }} className="font-bold text-xs">
                Theme Live Preview
              </span>
              <span
                style={{
                  backgroundColor: colors.tint,
                  color: colors.accent,
                  borderColor: colors.border
                }}
                className="px-2 py-0.5 text-[10px] font-mono border"
              >
                CARROT 🥕 PREVIEW
              </span>
            </div>
            <div
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              className="p-2 border flex items-center justify-between"
            >
              <span className="text-xs text-slate-300">Sample Download Task</span>
              <button
                type="button"
                style={{ backgroundColor: colors.accent, color: colors.bg }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-none"
              >
                Download
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-ide-border/60">
            <button
              type="button"
              onClick={() => setColors(PRESET_THEMES['carrot']!.colors)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Carrot 🥕</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-white/3 hover:bg-white/6 border border-ide-border/80 rounded-none transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.97] rounded-none transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-400/15"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save &amp; Apply Theme</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
