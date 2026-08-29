"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
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
  const [slowAnalyzing, setSlowAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // Foto/PDF pro Gemini pode passar de um minuto (documento grande, ou o
  // Gemini momentaneamente lento) — sem avisar, "Analisando..." parado
  // parece travado, e é fácil a pessoa sair da tela ou trocar de app
  // achando que não vai dar em nada, o que corta a análise no meio.
  useEffect(() => {
    if (!analyzing) {
      setSlowAnalyzing(false);
      return;
    }
    const timeout = setTimeout(() => setSlowAnalyzing(true), 6000);
    return () => clearTimeout(timeout);
  }, [analyzing]);

  async function analyzeDataUrl(dataUrl: string, filePdf: boolean, name: string) {
    setError("");
    setItems(null);
    setPreviewUrl(dataUrl);
    setIsPdf(filePdf);
    setFileName(name);
    setAnalyzing(true);
    try {
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

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const filePdf = file.type === "application/pdf";
    if (filePdf && file.size > MAX_PDF_SIZE) {
      setError("Esse PDF é grande demais (máximo 8MB). Tenta um arquivo menor.");
      return;
    }

    const dataUrl = filePdf ? await readFileAsDataUrl(file) : await compressImage(file);
    await analyzeDataUrl(dataUrl, filePdf, file.name);
  }

  /**
   * Mesma análise, mas a partir de um data URL que já existe (ex: uma
   * imagem recebida por "Compartilhar" de outro app) — sem passar pelo
   * input de arquivo nem pela compressão, que já não se aplica aqui.
   */
  async function loadFromDataUrl(dataUrl: string, filePdf: boolean) {
    await analyzeDataUrl(dataUrl, filePdf, filePdf ? "Compartilhado.pdf" : "Compartilhado");
  }

  return {
    fileInputRef,
    previewUrl,
    isPdf,
    fileName,
    items,
    setItems,
    analyzing,
    slowAnalyzing,
    error,
    setError,
    handleFileChange,
    loadFromDataUrl,
  };
}
