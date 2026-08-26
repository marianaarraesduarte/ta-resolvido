"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { encodeWav } from "./audio-wav";

const MAX_DURATION_MS = 60_000;

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState("");
  const [autoStopResult, setAutoStopResult] = useState<{
    dataUrl: string;
    durationMs: number;
  } | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const sampleRateRef = useRef(16000);
  const startedAtRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRef = useRef<() => Promise<{ dataUrl: string; durationMs: number } | null>>(
    async () => null,
  );

  const stop = useCallback(async () => {
    if (!isRecording) return null;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;

    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    const context = contextRef.current;
    contextRef.current = null;

    const durationMs = Date.now() - startedAtRef.current;
    setIsRecording(false);

    const totalLength = chunksRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of chunksRef.current) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    chunksRef.current = [];

    if (context) await context.close();

    if (totalLength === 0) return null;

    const wavBuffer = encodeWav(merged, sampleRateRef.current);
    const blob = new Blob([wavBuffer], { type: "audio/wav" });
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });

    return { dataUrl, durationMs };
  }, [isRecording]);

  stopRef.current = stop;

  // Quando o tempo máximo de gravação é atingido, o corte precisa terminar
  // do mesmo jeito que apertar "parar e enviar" manualmente — senão o áudio
  // gravado até ali simplesmente some sem nunca ser reconhecido.
  const autoStop = useCallback(async () => {
    const result = await stopRef.current();
    if (result) setAutoStopResult(result);
  }, []);

  const start = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextCtor();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      chunksRef.current = [];
      sampleRateRef.current = context.sampleRate;

      processor.onaudioprocess = (e) => {
        chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      };

      source.connect(processor);
      processor.connect(context.destination);

      streamRef.current = stream;
      contextRef.current = context;
      processorRef.current = processor;
      sourceRef.current = source;
      startedAtRef.current = Date.now();
      setElapsedMs(0);
      setIsRecording(true);

      tickRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAtRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= MAX_DURATION_MS) autoStop();
      }, 200);
    } catch {
      setError("Não consegui acessar o microfone. Verifica a permissão do navegador.");
    }
  }, [autoStop]);

  const clearAutoStopResult = useCallback(() => setAutoStopResult(null), []);

  // Se a pessoa trocar de aba (foto/chat/manual) no meio de uma gravação, o
  // componente desmonta — sem isso o microfone ficaria ligado em segundo
  // plano, sem ninguém pra parar ele.
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      contextRef.current?.close();
    };
  }, []);

  return { isRecording, elapsedMs, error, start, stop, autoStopResult, clearAutoStopResult };
}
