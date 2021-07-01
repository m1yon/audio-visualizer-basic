import { useEffect, useMemo } from "react";
import { Howler } from "howler";
import { useRafLoop } from "react-use";

type useFrequencyDataArgs = {
  audioNodes: AudioNode[];
};

const useFrequencyData = ({ audioNodes }: useFrequencyDataArgs) => {
  // force Howler to initialize an AudioContext
  if (!Howler.ctx) Howler.mute(false);

  // create an analyser node in the Howler WebAudio context
  const audioAnalysers = useMemo(
    () => audioNodes.map((audioNodes) => audioNodes.context.createAnalyser()),
    [audioNodes]
  );

  // set the fftSize for each analyzer
  audioAnalysers.forEach((audioAnalyser) => {
    audioAnalyser.fftSize = 1024;
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

export default useFrequencyData;
