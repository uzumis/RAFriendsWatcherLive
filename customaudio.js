// customaudio.js
// Gerencia os áudios customizados via localStorage

const AUDIO_KEYS = [
  'achievement',
  'specialAchievement',
  'superAchievement',
  'platinum'
];

export function getCustomAudios() {
  const audios = {};
  AUDIO_KEYS.forEach(key => {
    const value = localStorage.getItem('customaudio_' + key);
    if (value) audios[key] = value;
  });
  return audios;
}

export function setCustomAudio(key, url) {
  if (AUDIO_KEYS.includes(key)) {
    localStorage.setItem('customaudio_' + key, url);
  }
}

export function removeCustomAudio(key) {
  if (AUDIO_KEYS.includes(key)) {
    localStorage.removeItem('customaudio_' + key);
  }
}

export function clearAllCustomAudios() {
  AUDIO_KEYS.forEach(key => localStorage.removeItem('customaudio_' + key));
}

// Para uso em scripts não-modules:
window.customAudioAPI = {
  getCustomAudios,
  setCustomAudio,
  removeCustomAudio,
  clearAllCustomAudios
};
