import { getColor } from "./tailwindColors"

export const keyLetters = ['Ab', 'A', 'A#', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#']
export const majorMinorOptions = [
  { label: 'Major', value: false },
  { label: 'Minor', value: true },
]

const tempoColors = ['info', 'accent', 'success', 'warning', 'error']
export const heatColors = tempoColors.map(color => getColor(color))