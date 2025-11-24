import fs from 'fs';
import { createCanvas } from 'canvas';

// Icon sizes we need
const sizes = [192, 512];

// Draw cassette logo
function drawCassette(ctx, size) {
  const scale = size / 500;
  
  ctx.save();
  ctx.scale(scale, scale);
  
  // Cassette body (purple)
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(50, 80, 400, 240);
  
  // Label (gold)
  ctx.fillStyle = '#fcd34d';
  ctx.fillRect(80, 110, 340, 100);
  
  // Text
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('M', 250, 165);
  ctx.font = 'bold 40px Arial';
  ctx.fillText('π', 250, 200);
  
  // Reels (pink)
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.arc(150, 260, 35, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(350, 260, 35, 0, Math.PI * 2);
  ctx.fill();
  
  // Reel centers (dark)
  ctx.fillStyle = '#1f2937';
  ctx.beginPath();
  ctx.arc(150, 260, 15, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(350, 260, 15, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

// Generate icons
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  ctx.clearRect(0, 0, size, size);
  drawCassette(ctx, size);
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/icon-${size}.png`, buffer);
  
  console.log(`Generated icon-${size}.png`);
});

console.log('Icons generated successfully!');