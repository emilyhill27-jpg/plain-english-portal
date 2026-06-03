export default function ListenControls({
  label, isPlaying, speak, pauseResume, stopSpeech, speechDisabled,
  groupedVoices, voiceName, setVoiceName, voiceRegions, formatVoiceName,
  audioSpeed, setAudioSpeed,
}) {
  return (
    <>
      <div className="listen-inline no-print" aria-label="Listen controls">
        <span className="listen-inline-label">{label}</span>
        <button className="play-btn" onClick={isPlaying ? pauseResume : speak} disabled={speechDisabled}>
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2" y="1" width="3" height="10" rx="1" fill="#fff"/><rect x="7" y="1" width="3" height="10" rx="1" fill="#fff"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polygon points="2,1 11,6 2,11" fill="#fff"/></svg>
          )}
        </button>
        <button className="stop-btn" onClick={stopSpeech}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1.5" fill="currentColor"/></svg>
        </button>
        {groupedVoices.length > 0 && (
          <select className="voice-sel" value={voiceName} onChange={e => setVoiceName(e.target.value)}>
            {groupedVoices.map(g => (
              <optgroup key={g.region} label={(voiceRegions[g.region]?.flag || "\u{1F310}") + " " + (voiceRegions[g.region]?.label || "English")}>
                {g.voices.map(v => <option key={v.name} value={v.name}>{formatVoiceName(v)}</option>)}
              </optgroup>
            ))}
          </select>
        )}
      </div>
      <div className="listen-inline no-print" style={{ marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginRight: 6 }}>Speed</span>
        {[0.5, 0.75, 1, 1.25].map(spd => (
          <button key={spd} className={`rs-option${audioSpeed === spd ? ' active' : ''}`}
            style={{ padding: '2px 8px', fontSize: 11, height: 24, minWidth: 0 }}
            onClick={() => setAudioSpeed(spd)}>
            {spd === 1 ? '1x' : spd + 'x'}
          </button>
        ))}
      </div>
    </>
  );
}
