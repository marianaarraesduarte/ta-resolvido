/**
 * Lê um arquivo (ex: PDF) como data URL sem nenhum processamento — usado
 * pra arquivos que não são imagem raster e por isso não passam pelo
 * redimensionamento via canvas em lib/image-compress.ts.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não deu pra ler o arquivo."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}
