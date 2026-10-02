import React from 'react';

// This published count is updated manually after stickers have been delivered.
// Opening WhatsApp or copying payment details never changes it.
const STICKER_COUNT = 72;

export default function StickerMeter() {
  return <p className="mb-8 text-center text-sm sm:text-base font-medium text-slate-700">
    Al <span className="font-bold text-emerald-700">{STICKER_COUNT} kustzaken</span> dragen de HondAanZee-sticker 🐾
  </p>;
}
