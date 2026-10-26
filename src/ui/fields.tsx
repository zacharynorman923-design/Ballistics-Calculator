import { useEffect, useId, useState } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  step?: number;
  marker?: string;
}

/**
 * Numeric input that keeps the typed text locally, so partial entries like
 * "0." or "-" don't get clobbered, and commits whenever the text parses.
 */
export function NumberField({ label, value, onChange, unit, step, marker }: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useState(String(value));
  useEffect(() => {
    if (Number(text) !== value) setText(String(value));
  }, [value]);
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">
        {label}
        {marker && <span className="field-marker" title={marker}> ●</span>}
      </span>
      <span className="field-input">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          step={step}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = Number(e.target.value);
            if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(n);
          }}
          onBlur={() => setText(String(value))}
        />
        {unit && <span className="field-unit">{unit}</span>}
      </span>
    </label>
  );
}

interface SegmentedProps<T extends string | number> {
  label?: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (v: T) => void;
}

export function Segmented<T extends string | number>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="field">
      {label && <span className="field-label">{label}</span>}
      <div className="segmented" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={o.value === value}
            className={o.value === value ? 'on' : ''}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
