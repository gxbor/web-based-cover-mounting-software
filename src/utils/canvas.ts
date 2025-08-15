export function drawElement(
  ctx: CanvasRenderingContext2D,
  element: CoverElement,
  isSelected: boolean,
  dimensions: { coverWidth: number; coverHeight: number; spineWidth: number },
  isHardcover: boolean,
  showGuides = true
): void {
  if (!element.image) return;

  ctx.save();

  // Draw the image
  ctx.drawImage(
    element.image,
    element.x,
    element.y,
    element.width,
    element.height
  );

  if (showGuides) {
    // Draw width measurements for each part (placed inside the element)
    const scale = element.scale || 1;
    drawMeasurementLabel(
      ctx,
      `${Math.round(element.width * scale)}mm`,
      element.x + element.width / 2,
      element.y + element.height / 2
    );

    // Draw height measurement only once on the left side (placed inside)
    if (element.type === 'back') {
      drawMeasurementLabel(
        ctx,
        `${Math.round(element.height * scale)}mm`,
        element.x + 12,
        element.y + element.height / 2,
        -Math.PI / 2
      );
    }

    // Draw guidelines
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // Draw trim lines
    ctx.beginPath();
    ctx.rect(element.x, element.y, element.width, element.height);
    ctx.stroke();

    // Draw spine separator lines if this is not the spine element
    if (element.type !== 'spine') {
      const spineX = dimensions.coverWidth / 2;
      ctx.beginPath();
      ctx.moveTo(spineX - dimensions.spineWidth / 2, 0);
      ctx.lineTo(spineX - dimensions.spineWidth / 2, dimensions.coverHeight);
      ctx.moveTo(spineX + dimensions.spineWidth / 2, 0);
      ctx.lineTo(spineX + dimensions.spineWidth / 2, dimensions.coverHeight);
      ctx.stroke();

      // Draw spine width measurement
      if (element.type === 'front') {
        drawMeasurementLabel(
          ctx,
          `${Math.round(dimensions.spineWidth)}mm`,
          spineX,
          element.y + 20
        );
      }
    }

    // Draw center guides
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(element.x + element.width / 2, element.y);
    ctx.lineTo(element.x + element.width / 2, element.y + element.height);
    ctx.moveTo(element.x, element.y + element.height / 2);
    ctx.lineTo(element.x + element.width, element.y + element.height / 2);
    ctx.stroke();
  }

  ctx.restore();
}

function drawMeasurementLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  rotation = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  
  // Text settings
  ctx.font = '2mm Arial';
  ctx.fillStyle = '#2563eb';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw text
  ctx.fillText(text, 0, 0);
  
  ctx.restore();
}