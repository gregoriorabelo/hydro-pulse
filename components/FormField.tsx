"use client";

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
};

export function Field({ label, value, onChange, required, type = "text" }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-brand-deep px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
      />
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
};

export function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">{label}</label>
      <input
        type="number"
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : Number(event.target.value))
        }
        className="w-full rounded-2xl border border-white/10 bg-brand-deep px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-brand-deep px-4 py-3 text-white outline-none focus:border-brand-cyan/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
