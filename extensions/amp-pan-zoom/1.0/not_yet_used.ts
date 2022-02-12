import {bezierCurve} from '#core/data-structures/curve';
import {layoutRectLtwh} from '#core/dom/layout/rect';

// This file is simply almost verbatim ported work from the 0.1 version, but I either hadn't needed them yet, or won't need them, but in case they're useful to you

// State stub that would otherwise rely on the value in ./reducers but I didn't want to export this type
type State = {};
const PAN_ZOOM_CURVE = bezierCurve(0.4, 0, 0.2, 1.4);
const ANIMATION_EASE_IN = 'cubic-bezier(0,0,.21,1)';
const updateContentDimensions = (
  sourceHeight: number,
  sourceWidth: number,
  aspectRatio: number,
  containerBox: DOMRect
) => {
  // Calculate content height if we set width to amp-pan-zoom's width
  const heightToFit = containerBox.width / aspectRatio;
  // Calculate content width if we set height to be amp-pan-zoom's height
  const widthToFit = containerBox.height * aspectRatio;
  // The content should fit within amp-pan-zoom, so take the smaller value
  let height = Math.min(heightToFit, containerBox.height);
  let width = Math.min(widthToFit, containerBox.width);
  if (
    Math.abs(width - sourceWidth) <= 16 &&
    Math.abs(height - sourceHeight) <= 16
  ) {
    width = sourceWidth;
    height = sourceHeight;
  }
  return layoutRectLtwh(0, 0, Math.round(width), Math.round(height));
};

const resetContentDimensions = () => {};

const updateMaxScale = (
  maxScale: number,
  aspectRatio: number,
  containerBox: DOMRect
) => {
  const {height, width} = containerBox;
  const containerBoxRatio = width / height;
  const newMaxScale = Math.max(
    containerBoxRatio / aspectRatio,
    aspectRatio / containerBoxRatio
  );
  if (!isNaN(newMaxScale)) {
    return Math.max(maxScale, newMaxScale);
  }
  return maxScale;
};

const measure = (
  state: State,
  contentWidth: number,
  contentHeight: number,
  containerBoxRect: DOMRect
) => {
  const sourceAspectRatio = contentWidth / contentHeight;
  return {
    sourceWidth: contentWidth,
    sourceHeight: contentHeight,
    maxScale: updateMaxScale(
      state.maxScale,
      sourceAspectRatio,
      containerBoxRect
    ),
    containerBox: containerBoxRect,
    contentBox: updateContentDimensions(
      contentWidth,
      contentHeight,
      sourceAspectRatio,
      containerBoxRect
    ),
  };
};

const setContentBox = (contentBox: DOMRect, containerBox: DOMRect) => {
  return {
    ...contentBox,
    top: contentBox.top - containerBox.top,
    left: contentBox.left - containerBox.left,
  };
};
