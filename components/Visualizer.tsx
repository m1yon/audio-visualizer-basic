import { useRef, useState, useEffect, useMemo } from "react";
import { useRafLoop } from "react-use";
import dynamic from "next/dynamic";
import { Howl } from "howler";
import useFrequencyData from "../hooks/useFrequencyData";

const Visualizer = () => {
  const frequencyData = useFrequencyData();
  const sound = new Howl({
    src: [
      "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_1MG.mp3",
    ],
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasContext, setCanvasContext] =
    useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) setCanvasContext(canvasRef.current.getContext("2d"));
  }, [canvasRef]);

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
    // @ts-expect-error
    draw(frequencyData);
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
