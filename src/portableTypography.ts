import fontFaces from './portable-font-faces.css?raw';
import typography from './typography.css?raw';

/** Bundled font bytes keep the downloaded documents readable with the same type offline. */
export const portableTypographyCss = `${fontFaces}\n${typography}`;
export const portableFontCsp = 'font-src data:;';
