'use client';

import SliderControl from './SliderControl';

export default function AudioControls({ pitch, rate, volume, onPitchChange, onRateChange, onVolumeChange }) {
  return (
    <>
      <SliderControl
        label="Pitch:"
        id="pitchSlider"
        min={0}
        max={2}
        step={0.1}
        value={pitch}
        onChange={onPitchChange}
      />
      <SliderControl
        label="Rate (Speed):"
        id="rateSlider"
        min={0.1}
        max={2}
        step={0.1}
        value={rate}
        onChange={onRateChange}
      />
      <SliderControl
        label="Volume:"
        id="volumeSlider"
        min={0}
        max={1}
        step={0.1}
        value={volume}
        onChange={onVolumeChange}
      />
    </>
  );
}
