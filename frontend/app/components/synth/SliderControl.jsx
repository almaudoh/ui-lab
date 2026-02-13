'use client';

export default function SliderControl({ label, id, min, max, step, value, onChange }) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block mb-2 font-bold text-gray-700">
        {label} <span className="font-normal text-gray-600 ml-2">{value.toFixed(1)}</span>
      </label>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}
