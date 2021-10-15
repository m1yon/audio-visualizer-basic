import { useRef, useState, useEffect, useMemo } from "react";
import { useRafLoop } from "react-use";
import dynamic from "next/dynamic";
import { Howl } from "howler";
import useHowlerFrequencyData from "../hooks/useHowlerFrequencyData";

const Visualizer = () => {
  const sounds = [
    // new Howl({
    //   src: [
    //     "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_1MG.mp3",
    //   ],
    // }),
    new Howl({
      src: ["audio/porter.mp3"],
    }),
  ];

  const frequencyData = useHowlerFrequencyData({
    // @ts-expect-error accessing hidden attributes
    audioNodes: sounds.map((audio) => audio._sounds[0]._node),
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

      canvasContext.fillRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const spaceWidth = (canvasRef.current?.width || 0) / data.length;
      const height = (canvasRef.current?.height || 0) / 2;
      // console.log(data.length);
      // console.log("width: " + canvasRef.current.width);
      // console.log("height: " + canvasRef.current.height);
      // console.log(data);
      // console.log(spaceHeight);

      data.forEach((value, i) => {
        canvasContext.beginPath();
        canvasContext.lineWidth = 10;
        canvasContext.lineCap = "round";
        canvasContext.strokeStyle = "white";

        canvasContext.moveTo(5 + i * spaceWidth, height); // x, y
        canvasContext.lineTo(
          5 + i * spaceWidth,
          height - ((value / 255) * (canvasRef.current?.height || 0)) / 2
        ); // x, y
        canvasContext.stroke();

        canvasContext.moveTo(5 + i * spaceWidth, height); // x, y
        canvasContext.lineTo(
          5 + i * spaceWidth,
          height + ((value / 255) * (canvasRef.current?.height || 0)) / 2
        ); // x, y
        canvasContext.stroke();
      });
    }
  };

  useRafLoop(() => {
    // @ts-expect-error
    draw(frequencyData[0]);
  });

  return (
    <>
      <canvas ref={canvasRef} width="250" height="100" />
      <button onClick={() => sounds.forEach((sound) => sound.play())}>
        play
      </button>
      <button onClick={() => sounds.forEach((sound) => sound.pause())}>
        pause
      </button>
      <button onClick={() => sounds.forEach((sound) => sound.mute(true))}>
        mute
      </button>
      <button onClick={() => sounds.forEach((sound) => sound.mute(false))}>
        un-mute
      </button>
    </>
  );
};

export default dynamic(() => Promise.resolve(Visualizer), { ssr: false });
