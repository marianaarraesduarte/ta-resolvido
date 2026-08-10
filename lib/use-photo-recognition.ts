"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { compressImage } from "@/lib/image-compress";

/**
 * Orquestra upload + compressão + chamada de reconhecimento de uma foto.
 * Compartilhado entre as revisões de extrato bancário e fatura de cartão —
 * cada uma passa sua própria função de reconhecimento e formato de item.
 */
export function usePhotoRecognition<T>(recognize: (dataUrl: string) => Promise<T[]>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [items, setItems] = useState<T[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setItems(null);
    setPreviewUrl(null);
    try {
      const dataUrl = await compressImage(file);
      setPreviewUrl(dataUrl);
      setAnalyzing(true);
      const recognized = await recognize(dataUrl);
      setItems(recognized);
    } catch {
      setError("Não deu pra analisar essa imagem agora. Tenta de novo.");
    } finally {
      setAnalyzing(false);
    }
  }

  return {
    fileInputRef,
    previewUrl,
    items,
    setItems,
    analyzing,
    error,
    setError,
    handleFileChange,
  };
}
