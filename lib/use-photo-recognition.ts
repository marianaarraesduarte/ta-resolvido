"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { compressImage } from "@/lib/image-compress";
import { readFileAsDataUrl } from "@/lib/read-file";

const MAX_PDF_SIZE = 8 * 1024 * 1024; // 8mb, mesmo limite do body das server actions

/**
 * Orquestra upload + preparo (compressão de imagem, ou leitura direta pra
 * PDF) + chamada de reconhecimento de uma foto ou PDF. Compartilhado entre
 * as revisões de extrato bancário e fatura de cartão — cada uma passa sua
 * própria função de reconhecimento e formato de item.
 */
export function usePhotoRecognition<T>(recognize: (dataUrl: string) => Promise<T[]>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [fileName, setFileName] = useState("");
  const [items, setItems] = useState<T[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setItems(null);
    setPreviewUrl(null);
    setIsPdf(false);
    setFileName(file.name);

    const filePdf = file.type === "application/pdf";

    if (filePdf && file.size > MAX_PDF_SIZE) {
      setError("Esse PDF é grande demais (máximo 8MB). Tenta um arquivo menor.");
      return;
    }

    try {
      const dataUrl = filePdf ? await readFileAsDataUrl(file) : await compressImage(file);
      setPreviewUrl(dataUrl);
      setIsPdf(filePdf);
      setAnalyzing(true);
      const recognized = await recognize(dataUrl);
      setItems(recognized);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não deu pra analisar esse arquivo agora. Tenta de novo.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return {
    fileInputRef,
    previewUrl,
    isPdf,
    fileName,
    items,
    setItems,
    analyzing,
    error,
    setError,
    handleFileChange,
  };
}
