import { useEffect, useMemo } from "react";
import { Howler } from "howler";
import { useRafLoop } from "react-use";

type useHowlerFrequencyDataArgs = {
  audioNodes: AudioNode[];
};

const useHowlerFrequencyData = ({ audioNodes }: useHowlerFrequencyDataArgs) => {
  // force Howler to initialize an AudioContext
  if (!Howler.ctx) Howler.mute(false);

  // create an analyser node in the Howler WebAudio context
  const audioAnalysers = useMemo(
    () => audioNodes.map((audioNodes) => audioNodes.context.createAnalyser()),
    [audioNodes]
  );

  // set the fftSize for each analyzer
  audioAnalysers.forEach((audioAnalyser) => {
    audioAnalyser.fftSize = 32; //signifies how many data points - default 2048
    audioAnalyser.minDecibels = -100; //default -100db
    audioAnalyser.maxDecibels = 0; //default -30db
    audioAnalyser.smoothingTimeConstant = 0.8; //double between 0 & 1, smooths data  - default 0.8 - 0.9 is nice
  });

  // create frequency arrays to store the output
  const frequencyDataArrays = useMemo(
    () =>
      audioAnalysers.map(
        (audioAnalyser) => new Uint8Array(audioAnalyser.frequencyBinCount)
      ),
    [audioAnalysers]
  );

  // connect each audio node to an analyser
  useEffect(() => {
    audioNodes.forEach((node, index) => node.connect(audioAnalysers[index]));
  }, [audioAnalysers, audioNodes]);

  // on every render, grab the new byte data and throw it in frequency arrays
  useRafLoop(() => {
    audioAnalysers.forEach((audioAnalyser, index) =>
      audioAnalyser.getByteFrequencyData(frequencyDataArrays[index])
    );
  });

  return frequencyDataArrays;
};

export default useHowlerFrequencyData;
