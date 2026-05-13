// src/shared/components/SharedDropdown/SharedDropdown.tsx
import React, { useRef, useEffect, useState } from 'react';
import './SharedDropdown.css';

// ── Option shape ───────────────────────────────────────────────────────────────
export interface DropdownOption {
  /** Unique identifier returned in onChange */
  value: string;
  /** Main option label */
  label: string;
  /** Optional secondary line shown below the label */
  description?: string;
  /** Small coloured circle dot (pass a CSS colour string) */
  dot?: string;
  /** Icon node rendered in a coloured box left of the label */
  icon?: React.ReactNode;
  /** Badge count shown on the right */
  count?: number;
  /** Accent colours when this option is active.
   *  bg   → active row background
   *  text → active label / count text
   *  iconBg → coloured icon-box background (defaults to bg) */
  accent?: { bg: string; text: string; iconBg?: string };
}

// ── Trigger shape ──────────────────────────────────────────────────────────────
export interface DropdownTrigger {
  /** Main label shown on the button */
  label: string;
  /** Smaller text shown next to / below the label (optional) */
  subLabel?: string;
  /** Icon or image rendered left of the label */
  icon?: React.ReactNode;
  /** Coloured dot indicator (compact variant) — CSS colour string */
  dot?: string;
  /** Coloured badge count on the trigger button (optional) */
  count?: number;
  /** Accent colours used for the count badge on the trigger */
  accent?: { bg: string; text: string };
}

// ── Props ──────────────────────────────────────────────────────────────────────
export interface SharedDropdownProps {
  /** Current selected value — used to derive active state */
  value: string;
  /** Options list */
  options: DropdownOption[];
  /** Trigger button configuration */
  trigger: DropdownTrigger;
  /** Called when the user picks an option */
  onChange: (value: string) => void;
  /** Visual variant
   *  - `toolbar`   → wider trigger with icon box + label + count badge + desc row
   *  - `compact`   → narrower trigger with dot indicator, used inside cards / panels
   */
  variant?: 'toolbar' | 'compact';
  /** Extra className on the root wrapper */
  className?: string;
  /** data-testid forwarded to the trigger button */
  testId?: string;
  /** Whether counts are loading — hides count badges while true */
  loading?: boolean;
  /** Minimum pixel width of the dropdown panel (default: 240) */
  panelWidth?: number;
  /** Align panel to the right edge of the trigger (default: left) */
  alignRight?: boolean;
}

// ── Chevron SVG ───────────────────────────────────────────────────────────────
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

// ── Checkmark SVG ─────────────────────────────────────────────────────────────
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
  panelWidth = 240,
  alignRight = false,
}) => {
  const [open, setOpen]   = useState(false);
  const wrapperRef        = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const activeOption = options.find((o) => o.value === value);

  // ── Render ───────────────────────────────────────────────
  return (
    <div
      className={`sd-wrapper sd-variant-${variant} ${className}`}
      ref={wrapperRef}
    >

      {/* ── Trigger button ── */}
      <button
        className={`sd-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        data-testid={testId}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/* Icon box (toolbar) or dot (compact) */}
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

        {/* Label block */}
        <span className="sd-trigger-text">
          <span className="sd-trigger-label">{trigger.label}</span>
          {trigger.subLabel && (
            <span className="sd-trigger-sublabel">{trigger.subLabel}</span>
          )}
        </span>

        {/* Count badge */}
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

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className={`sd-panel ${alignRight ? 'align-right' : 'align-left'}`}
          style={{ minWidth: panelWidth }}
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
                {/* Icon box */}
                {opt.icon && (
                  <span
                    className="sd-option-icon-wrap"
                    style={{
                      background: opt.accent?.iconBg ?? opt.accent?.bg ?? '#f1f5f9',
                      color:      isActive
                        ? opt.accent?.text ?? 'inherit'
                        : opt.dot ?? 'inherit',
                    }}
                    aria-hidden="true"
                  >
                    {opt.icon}
                  </span>
                )}

                {/* Dot */}
                {!opt.icon && opt.dot && (
                  <span
                    className="sd-option-dot"
                    style={{ background: opt.dot }}
                  />
                )}

                {/* Label + description */}
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

                {/* Count badge */}
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

                {/* Active checkmark */}
                {isActive && !opt.count && (
                  <Check color={opt.accent?.text} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};