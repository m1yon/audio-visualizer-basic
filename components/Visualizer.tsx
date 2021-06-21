import { useRef, useState, useEffect, useMemo } from "react";
import { useRafLoop } from "react-use";
import dynamic from "next/dynamic";
import { Howl, Howler } from "howler";

const Visualizer = () => {
  const sound = new Howl({
    src: [
      "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_1MG.mp3",
    ],
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);

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
    if (canvasRef.current) setCanvasContext(canvasRef.current.getContext("2d"));
  }, [canvasRef]);

  useEffect(() => {
    // connect the masterGain -> analyser (disconnecting masterGain -> destination)
    Howler.masterGain.connect(audioAnalyser);
  }, [audioAnalyser, audioContext]);

  const draw = (data: any[]) => {
    if (canvasContext && canvasRef.current) {
      canvasContext.clearRect(
        0, // x
        0, // y
        canvasRef.current.width, // width
        canvasRef.current.height // height
      );

      const space = canvasRef.current.width / data.length;

      data.forEach((value, i) => {
        canvasContext.beginPath();
        canvasContext.moveTo(space * i, canvasRef.current?.height || 0); // x, y
        canvasContext.lineTo(
          space * i,
          (canvasRef.current?.height || 0) - value
        ); // x, y
        canvasContext.stroke();
      });
    }
  };

  useRafLoop(() => {
    audioAnalyser.getByteFrequencyData(frequencyData);
    // console.log("frequencyData", frequencyData);

    // @ts-expect-error
    draw([...frequencyData]);
  });

  return (
    <>
      <canvas ref={canvasRef} width="500" height="500"></canvas>
      <button onClick={() => sound.play()}>play</button>
      <button onClick={() => sound.pause()}>pause</button>
    </>
  );
};

export default dynamic(() => Promise.resolve(Visualizer), { ssr: false });
