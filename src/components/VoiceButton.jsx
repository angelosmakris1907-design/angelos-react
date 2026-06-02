function VoiceButton({ onVoiceInput }) {
  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IE";
    recognition.continuous = false;

    recognition.start();

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      onVoiceInput(spokenText);
    };

    recognition.onerror = (event) => {
      alert("Speech recognition error: " + event.error);
    };
  }

  return <button className="voice-button" onClick={startListening}>
     🎤 Speak
    </button>;
}

export default VoiceButton;
