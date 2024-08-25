import React, { useEffect, useRef } from "react";

interface CaptchaProps {
  width?: number;
  height?: number;
  length?: number;
  fontSize?: number;
  bgColor?: string;
  textColor?: string;
  noise?: boolean;
  lines?: boolean;
  distortion?: boolean;
  onChange?: (captcha: string) => void;
  regenerate?: boolean; // Trigger regeneration when true
}

const Captcha: React.FC<CaptchaProps> = ({
  width = 200,
  height = 50,
  length = 6,
  fontSize = 30,
  bgColor = "#ffffff",
  textColor = "#000000",
  noise = true,
  lines = true,
  distortion = true,
  onChange,
  regenerate = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateCaptcha();
  }, [regenerate]);

  const generateCaptcha = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captchaText = "";
    for (let i = 0; i < length; i++) {
      captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    drawCaptcha(captchaText);
    if (onChange) onChange(captchaText);
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear previous content
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw distorted text
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    text.split("").forEach((char, i) => {
      const x = (width / length) * i + fontSize / 2;
      const y = height / 2 + (Math.random() - 0.5) * 10;
      const angle = (Math.random() - 0.5) * 0.5; // Random angle for each letter
      const scale = 0.8 + Math.random() * 0.4; // Random scale for each letter
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    // Add noise
    if (noise) {
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random()})`;
        ctx.fillRect(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 2,
          Math.random() * 2
        );
      }
    }

    // Add lines
    if (lines) {
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(0,0,0,${0.3 + Math.random() * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
      }
    }

    // Apply distortion
    if (distortion) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const tempData = new Uint8ClampedArray(data.length);

      // Apply distortion
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;

          // Calculate distortion offsets
          const offsetX = Math.sin(y / 10) * 5; // Sinusoidal distortion effect
          const offsetY = Math.cos(x / 10) * 5;

          // Calculate new coordinates
          const newX = Math.min(Math.max(x + offsetX, 0), width - 1);
          const newY = Math.min(Math.max(y + offsetY, 0), height - 1);

          const newIdx = (Math.floor(newY) * width + Math.floor(newX)) * 4;

          // Copy the pixel color from the distorted position
          tempData[idx] = data[newIdx];
          tempData[idx + 1] = data[newIdx + 1];
          tempData[idx + 2] = data[newIdx + 2];
          tempData[idx + 3] = data[newIdx + 3];
        }
      }

      // Put distorted image data back to canvas
      ctx.putImageData(new ImageData(tempData, width, height), 0, 0);
    }
  };

  return <canvas ref={canvasRef} width={width} height={height}></canvas>;
};

export default Captcha;
