import { describe, expect, it } from "vitest";
import { encodeWav } from "./audio-wav";

function readString(view: DataView, offset: number, length: number): string {
  let text = "";
  for (let i = 0; i < length; i++) text += String.fromCharCode(view.getUint8(offset + i));
  return text;
}

describe("encodeWav", () => {
  it("writes a valid RIFF/WAVE header matching the sample data", () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
    const buffer = encodeWav(samples, 16000);
    const view = new DataView(buffer);

    expect(readString(view, 0, 4)).toBe("RIFF");
    expect(readString(view, 8, 4)).toBe("WAVE");
    expect(readString(view, 12, 4)).toBe("fmt ");
    expect(readString(view, 36, 4)).toBe("data");
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16000); // sample rate
    expect(view.getUint16(34, true)).toBe(16); // bits per sample

    const dataSize = view.getUint32(40, true);
    expect(dataSize).toBe(samples.length * 2);
    expect(buffer.byteLength).toBe(44 + dataSize);
    expect(view.getUint32(4, true)).toBe(36 + dataSize);
  });

  it("clamps out-of-range samples to the int16 boundaries", () => {
    const buffer = encodeWav(new Float32Array([2, -2]), 16000);
    const view = new DataView(buffer);
    expect(view.getInt16(44, true)).toBe(0x7fff);
    expect(view.getInt16(46, true)).toBe(-0x8000);
  });

  it("round-trips a mid-range sample within one quantization step", () => {
    const buffer = encodeWav(new Float32Array([0.25]), 8000);
    const view = new DataView(buffer);
    expect(view.getInt16(44, true)).toBeCloseTo(0.25 * 0x7fff, -1);
  });
});
