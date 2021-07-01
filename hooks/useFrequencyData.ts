import { useEffect, useMemo } from "react";
import { Howler } from "howler";
import { useRafLoop } from "react-use";

const useFrequencyData = () => {
  // force Howler to initialize an AudioContext
  if (!Howler.ctx) Howler.mute(false);

  // create an analyser node in the Howler WebAudio context
  const audioContext = Howler.ctx;
  const audioAnalyser = useMemo(
    () => audioContext.createAnalyser(),
    [audioContext]
  );
  audioAnalyser.fftSize = 1024;
  const frequencyData = useMemo(
    () => new Uint8Array(audioAnalyser.frequencyBinCount),
    [audioAnalyser]
  );

  useEffect(() => {
    // connect the masterGain -> analyser (disconnecting masterGain -> destination)
    Howler.masterGain.connect(audioAnalyser);
  }, [audioAnalyser, audioContext]);

  useRafLoop(() => {
    audioAnalyser.getByteFrequencyData(frequencyData);
  });

  return frequencyData;
};

export default useFrequencyData;
