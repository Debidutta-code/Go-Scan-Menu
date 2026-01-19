// src/components/QRTemplateRenderer.tsx
import React, { useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { TemplateConfig } from '../config/qrTemplates.config';
import { Table } from '../types/table.types';

interface QRTemplateRendererProps {
  template: TemplateConfig;
  table: Table;
  qrUrl: string;
  qrSettings: {
    fgColor: string;
    bgColor: string;
    level: 'L' | 'M' | 'Q' | 'H';
  };
  logoSrc?: string;
  logoDimensions?: { width: number; height: number };
}

export const QRTemplateRenderer: React.FC<QRTemplateRendererProps> = ({
  template,
  table,
  qrUrl,
  qrSettings,
  logoSrc,
  logoDimensions,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    renderTemplate();
  }, [template, table, qrSettings, logoSrc]);

  const renderTemplate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Set canvas size (4" x 6" at 300 DPI = 1200 x 1800 pixels)
    const dpi = 300;
    const widthInches = 4;
    const heightInches = 6;
    canvas.width = widthInches * dpi;
    canvas.height = heightInches * dpi;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (template.bgImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!ctx || !canvas) return;
        
        // Draw dimmed background image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Add overlay if specified
        if (template.decorativeElements?.includes('overlay-dark')) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        drawContent(ctx, canvas);
      };
      img.src = template.bgImage;
    } else if (template.bgGradient) {
      // Parse and draw gradient (simplified - using solid color)
      const color1 = template.bgGradient.match(/#[0-9a-fA-F]{6}/g)?.[0] || '#ffffff';
      const color2 = template.bgGradient.match(/#[0-9a-fA-F]{6}/g)?.[1] || color1;
      
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawContent(ctx, canvas);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawContent(ctx, canvas);
    }
  };

  const drawContent = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const margin = 120;

    // Draw decorative border
    if (template.decorativeElements?.includes('border-ornate')) {
      ctx.strokeStyle = template.textColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);
      
      ctx.lineWidth = 3;
      ctx.strokeRect(margin + 20, margin + 20, canvas.width - (margin + 20) * 2, canvas.height - (margin + 20) * 2);
    }

    if (template.decorativeElements?.includes('gold-border')) {
      ctx.strokeStyle = template.textColor;
      ctx.lineWidth = 12;
      ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);
      
      // Corner decorations
      const cornerSize = 80;
      ctx.lineWidth = 4;
      // Top-left
      ctx.beginPath();
      ctx.moveTo(margin + cornerSize, margin);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin, margin + cornerSize);
      ctx.stroke();
      // Top-right
      ctx.beginPath();
      ctx.moveTo(canvas.width - margin - cornerSize, margin);
      ctx.lineTo(canvas.width - margin, margin);
      ctx.lineTo(canvas.width - margin, margin + cornerSize);
      ctx.stroke();
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(margin + cornerSize, canvas.height - margin);
      ctx.lineTo(margin, canvas.height - margin);
      ctx.lineTo(margin, canvas.height - margin - cornerSize);
      ctx.stroke();
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(canvas.width - margin - cornerSize, canvas.height - margin);
      ctx.lineTo(canvas.width - margin, canvas.height - margin);
      ctx.lineTo(canvas.width - margin, canvas.height - margin - cornerSize);
      ctx.stroke();
    }

    // Draw heading based on layout
    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'center';

    if (template.layout === 'top') {
      ctx.font = `bold 120px ${template.headingFont}`;
      ctx.fillText('VIEW OUR', centerX, 320);
      ctx.font = `bold 140px ${template.headingFont}`;
      ctx.fillText('MENU', centerX, 480);
    } else if (template.layout === 'centered') {
      ctx.font = `60px ${template.headingFont}`;
      ctx.fillText('Scan to view our', centerX, 280);
      ctx.font = `bold 120px ${template.headingFont}`;
      ctx.fillText('MENU', centerX, 420);
    } else if (template.layout === 'split') {
      ctx.font = `bold 100px ${template.headingFont}`;
      ctx.fillText('ORDER NOW', centerX, 300);
    }

    // Draw decorative elements
    if (template.decorativeElements?.includes('leaf-corner')) {
      ctx.font = '100px Arial';
      ctx.fillText('🌿', margin + 80, margin + 120);
      ctx.fillText('🌿', canvas.width - margin - 80, margin + 120);
    }

    if (template.decorativeElements?.includes('chef-hat')) {
      ctx.font = '80px Arial';
      ctx.fillText('👨‍🍳', centerX, 220);
    }

    // QR Code position
    const qrSize = 600;
    const qrX = centerX - qrSize / 2;
    const qrY = template.layout === 'top' ? 550 : 500;

    // Draw QR code background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
    
    ctx.strokeStyle = template.textColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);

    // Get QR code from DOM and draw it
    const qrCanvas = qrCanvasRef.current?.querySelector('canvas');
    if (qrCanvas) {
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    }

    // Draw restaurant information
    ctx.font = `bold 70px ${template.bodyFont}`;
    ctx.fillStyle = template.textColor;
    ctx.textAlign = 'center';
    
    const infoY = qrY + qrSize + 100;
    
    // Safely access restaurant name
    const restaurantName = typeof table.restaurantId === 'string' 
      ? 'Restaurant' 
      : (table.restaurantId as any)?.name || 'Restaurant';
    
    const branchName = typeof table.branchId === 'string'
      ? restaurantName
      : (table.branchId as any)?.name || restaurantName;
    
    ctx.fillText(branchName, centerX, infoY);
    
    ctx.font = `50px ${template.bodyFont}`;
    ctx.fillText(`Table ${table.tableNumber}`, centerX, infoY + 80);

    // Draw footer text
    ctx.font = `italic 40px ${template.bodyFont}`;
    ctx.fillText('Scan QR Code to Order', centerX, canvas.height - 200);

    // Draw decorative bottom elements
    if (template.decorativeElements?.includes('wave-pattern')) {
      ctx.strokeStyle = template.textColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x += 40) {
        const y = canvas.height - 140 + Math.sin(x / 60) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (template.decorativeElements?.includes('bamboo')) {
      // Simple bamboo lines
      ctx.strokeStyle = template.textColor;
      ctx.lineWidth = 6;
      const bambooX1 = margin + 60;
      const bambooX2 = canvas.width - margin - 60;
      [bambooX1, bambooX2].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - 400);
        ctx.lineTo(x, canvas.height - margin - 60);
        ctx.stroke();
        
        // Nodes
        [canvas.height - 350, canvas.height - 250, canvas.height - margin - 100].forEach(y => {
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }
  };

  const imageSettings = logoSrc && logoDimensions
    ? {
        src: logoSrc,
        width: logoDimensions.width,
        height: logoDimensions.height,
        excavate: true,
      }
    : undefined;

  return (
    <div style={{ position: 'relative' }}>
      {/* Hidden QR Code for extraction */}
      <div ref={qrCanvasRef} style={{ position: 'absolute', left: '-9999px' }}>
        <QRCodeCanvas
          value={qrUrl}
          size={600}
          fgColor={qrSettings.fgColor}
          bgColor={qrSettings.bgColor}
          level={qrSettings.level}
          imageSettings={imageSettings}
        />
      </div>

      {/* Rendered template canvas */}
      <canvas 
        ref={canvasRef}
        className="qr-template-canvas"
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          height: 'auto',
          border: '2px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
};

export default QRTemplateRenderer;