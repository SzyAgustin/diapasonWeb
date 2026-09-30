let activeRun = 0;
let pendingStart: number | undefined;
let keepAlive: number | undefined;

function clearTimers() {
  if (pendingStart !== undefined) {
    window.clearTimeout(pendingStart);
    pendingStart = undefined;
  }
  if (keepAlive !== undefined) {
    window.clearInterval(keepAlive);
    keepAlive = undefined;
  }
}

function spanishVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | undefined {
  const voices = synth.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('es'));
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith('es-ar')) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('es-es')) ??
    voices[0]
  );
}

/** Corta lo que se esté diciendo. */
export function stopSpeaking() {
  activeRun += 1;
  clearTimers();
  window.speechSynthesis?.cancel();
}

/**
 * Dice cada frase en español, una detrás de la otra.
 * `onEnd` se llama cuando termina la lista, no cuando se la corta.
 */
export function speakSpanishList(phrases: string[], onEnd: () => void) {
  const synth = window.speechSynthesis;
  stopSpeaking();
  if (!synth || phrases.length === 0) {
    onEnd();
    return;
  }

  const run = activeRun;
  pendingStart = window.setTimeout(() => {
    pendingStart = undefined;
    if (run !== activeRun) return;

    const voice = spanishVoice(synth);
    phrases.forEach((phrase, index) => {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = voice?.lang ?? 'es-ES';
      if (voice) utterance.voice = voice;
      utterance.rate = 0.92;
      const isLast = index === phrases.length - 1;
      utterance.onend = () => {
        if (run !== activeRun || !isLast) return;
        clearTimers();
        onEnd();
      };
      utterance.onerror = (event) => {
        if (run !== activeRun) return;
        if (event.error === 'interrupted' || event.error === 'canceled') return;
        activeRun += 1;
        clearTimers();
        synth.cancel();
        onEnd();
      };
      synth.speak(utterance);
    });

    // Chrome corta speechSynthesis a los ~15 s si nadie lo reanuda.
    keepAlive = window.setInterval(() => {
      if (run !== activeRun || !synth.speaking) {
        clearTimers();
        return;
      }
      synth.pause();
      synth.resume();
    }, 10000);
  }, 0);
}
