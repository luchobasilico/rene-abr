"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioLevelMeter() {
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasAudioSignal, setHasAudioSignal] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const meterRafRef = useRef<number | null>(null);

  const stopAudioMeter = useCallback(() => {
    if (meterRafRef.current) {
      cancelAnimationFrame(meterRafRef.current);
      meterRafRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setHasAudioSignal(false);
  }, []);

  const startAudioMeter = useCallback(
    (stream: MediaStream) => {
      stopAudioMeter();
      try {
        const AudioContextImpl =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextImpl) return;

        const ctx = new AudioContextImpl();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
        sourceNodeRef.current = source;

        const data = new Uint8Array(analyser.fftSize);
        const tick = () => {
          const node = analyserRef.current;
          if (!node) return;
          node.getByteTimeDomainData(data);
          let sumSquares = 0;
          for (let i = 0; i < data.length; i += 1) {
            const centered = (data[i] - 128) / 128;
            sumSquares += centered * centered;
          }
          const rms = Math.sqrt(sumSquares / data.length);
          const normalized = Math.min(rms * 8, 1);
          setAudioLevel(normalized);
          setHasAudioSignal(rms > 0.015);
          meterRafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setAudioLevel(0);
        setHasAudioSignal(false);
      }
    },
    [stopAudioMeter]
  );

  useEffect(() => () => stopAudioMeter(), [stopAudioMeter]);

  return { audioLevel, hasAudioSignal, startAudioMeter, stopAudioMeter };
}

