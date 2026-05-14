// src/shared/components/SharedDropdown/SharedDropdown.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './SharedDropdown.css';

// ── Option shape ───────────────────────────────────────────────────────────────
export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  dot?: string;
  icon?: React.ReactNode;
  count?: number;
  accent?: { bg: string; text: string; iconBg?: string };
}

// ── Trigger shape ──────────────────────────────────────────────────────────────
export interface DropdownTrigger {
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  dot?: string;
  count?: number;
  accent?: { bg: string; text: string };
}

// ── Props ──────────────────────────────────────────────────────────────────────
export interface SharedDropdownProps {
  value: string;
  options: DropdownOption[];
  trigger: DropdownTrigger;
  onChange: (value: string) => void;
  variant?: 'toolbar' | 'compact';
  className?: string;
  testId?: string;
  loading?: boolean;
  disabled?: boolean;
  panelWidth?: number;
  alignRight?: boolean;
}

// ── Panel position type ───────────────────────────────────────────────────────
interface PanelPos {
  top?: number;
  bottom?: number;
  left: number;
  minWidth: number;
  openUp: boolean;
}

const PANEL_MAX_HEIGHT = 320;
const PANEL_GAP        = 7;
const VIEWPORT_MARGIN  = 8;

/** Rough estimate of rendered panel height */
const estimatePanelHeight = (options: DropdownOption[]) => {
  const h = options.reduce((acc, o) => acc + (o.description ? 54 : 40), 0) + 10;
  return Math.min(h, PANEL_MAX_HEIGHT);
};

/** Compute fixed panel position that avoids all viewport edges */
const computePanelPos = (
  rect: DOMRect,
  panelWidth: number,
  options: DropdownOption[],
): PanelPos => {
  const vw      = window.innerWidth;
  const vh      = window.innerHeight;
  const panelH  = estimatePanelHeight(options);

  // Vertical: prefer below; flip up if not enough space and more room above
  const spaceBelow = vh - rect.bottom - PANEL_GAP;
  const spaceAbove = rect.top - PANEL_GAP;
  const openUp     = spaceBelow < panelH && spaceAbove > spaceBelow;

  let top: number | undefined;
  let bottom: number | undefined;

  if (openUp) {
    bottom = vh - rect.top + PANEL_GAP;
  } else {
    top = rect.bottom + PANEL_GAP;
  }

  // Horizontal: align to trigger left, but clamp within viewport
  let left = rect.left;
  if (left + panelWidth > vw - VIEWPORT_MARGIN) {
    left = vw - panelWidth - VIEWPORT_MARGIN;
  }
  if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;

  return { top, bottom, left, minWidth: panelWidth, openUp };
};

// ── Chevron ───────────────────────────────────────────────────────────────────
const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    className={`sd-chevron ${open ? 'open' : ''}`}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── Check ─────────────────────────────────────────────────────────────────────
const Check: React.FC<{ color?: string }> = ({ color }) => (
  <svg
    width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke={color || 'currentColor'} strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round"
    className="sd-check-icon"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
export const SharedDropdown: React.FC<SharedDropdownProps> = ({
  value,
  options,
  trigger,
  onChange,
  variant = 'toolbar',
  className = '',
  testId,
  loading = false,
  disabled = false,
  panelWidth = 240,
  alignRight = false,
}) => {
  const [open, setOpen]         = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPos | null>(null);
  const wrapperRef              = useRef<HTMLDivElement>(null);
  const panelRef                = useRef<HTMLDivElement>(null);

  // Open: measure trigger rect → compute position → show panel
  const openPanel = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setPanelPos(computePanelPos(rect, panelWidth, options));
    setOpen(true);
  }, [panelWidth, options]);

  // Keep position fresh while open (scroll / resize)
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (!wrapperRef.current) return;
      setPanelPos(computePanelPos(
        wrapperRef.current.getBoundingClientRect(),
        panelWidth,
        options,
      ));
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, panelWidth, options]);

  // Close on outside click (checks both trigger wrapper and portal panel)
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!wrapperRef.current?.contains(t) && !panelRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const handleToggle = () => {
    if (disabled || loading) return;
    open ? setOpen(false) : openPanel();
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const activeOption = options.find((o) => o.value === value);

  // Portal panel style — position: fixed so it escapes every overflow/clip
  const portalStyle: React.CSSProperties = panelPos
    ? {
        position:  'fixed',
        zIndex:    99999,
        minWidth:  panelPos.minWidth,
        left:      panelPos.left,
        ...(panelPos.top    !== undefined ? { top:    panelPos.top    } : {}),
        ...(panelPos.bottom !== undefined ? { bottom: panelPos.bottom } : {}),
      }
    : {};

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      className={`sd-wrapper sd-variant-${variant} ${disabled ? 'sd-disabled' : ''} ${className}`}
      ref={wrapperRef}
    >
      {/* Trigger */}
      <button
        className={`sd-trigger ${open ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
        data-testid={testId}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {variant === 'toolbar' && trigger.icon && (
          <span
            className="sd-trigger-icon-wrap"
            style={activeOption?.accent ? { color: activeOption.accent.text } : undefined}
            aria-hidden="true"
          >
            {trigger.icon}
          </span>
        )}
        {variant === 'compact' && (
          <span
            className="sd-trigger-dot"
            style={{ background: trigger.dot ?? activeOption?.dot ?? '#94a3b8' }}
          />
        )}

        <span className="sd-trigger-text">
          <span className="sd-trigger-label">{trigger.label}</span>
          {trigger.subLabel && (
            <span className="sd-trigger-sublabel">{trigger.subLabel}</span>
          )}
        </span>

        {!loading && trigger.count !== undefined && (
          <span
            className="sd-trigger-count"
            style={
              trigger.accent
                ? { background: trigger.accent.bg, color: trigger.accent.text }
                : undefined
            }
          >
            {trigger.count}
          </span>
        )}

        <Chevron open={open} />
      </button>

      {/* Panel — portalled to document.body to escape all overflow clipping */}
      {open && panelPos && createPortal(
        <div
          ref={panelRef}
          className={`sd-panel ${panelPos.openUp ? 'open-up' : 'open-down'}`}
          style={portalStyle}
          role="listbox"
          aria-label="Select option"
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={isActive}
                className={`sd-option ${isActive ? 'active' : ''}`}
                style={isActive && opt.accent ? { background: opt.accent.bg } : undefined}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.icon && (
                  <span
                    className="sd-option-icon-wrap"
                    style={{
                      background: opt.accent?.iconBg ?? opt.accent?.bg ?? '#f1f5f9',
                      color: isActive ? opt.accent?.text ?? 'inherit' : opt.dot ?? 'inherit',
                    }}
                    aria-hidden="true"
                  >
                    {opt.icon}
                  </span>
                )}

                {!opt.icon && opt.dot && (
                  <span className="sd-option-dot" style={{ background: opt.dot }} />
                )}

                <span className="sd-option-text">
                  <span
                    className="sd-option-label"
                    style={isActive && opt.accent ? { color: opt.accent.text } : undefined}
                  >
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span className="sd-option-desc">{opt.description}</span>
                  )}
                </span>

                {!loading && opt.count !== undefined && (
                  <span
                    className="sd-option-count"
                    style={{
                      background: isActive && opt.accent ? opt.accent.bg   : '#f1f5f9',
                      color:      isActive && opt.accent ? opt.accent.text : '#64748b',
                    }}
                  >
                    {opt.count}
                  </span>
                )}

                {isActive && !opt.count && (
                  <Check color={opt.accent?.text} />
                )}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
};