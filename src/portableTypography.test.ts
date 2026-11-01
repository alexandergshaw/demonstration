import { describe, expect, it } from 'vitest';
import license from '../public/fonts/IBM-Plex-OFL.txt?raw';
import { portableTypographyCss } from './portableTypography';

describe('portable font fidelity', () => {
  it('embeds both WOFF2 payloads and their complete redistribution license', () => {
    const embedded = [...portableTypographyCss.matchAll(/data:font\/woff2;base64,([A-Za-z0-9+/=]+)/g)];
    expect(embedded).toHaveLength(2);
    embedded.forEach(match => {
      const bytes = atob(match[1]);
      expect(bytes.slice(0, 4)).toBe('wOF2');
      const declaredLength = new DataView(Uint8Array.from(bytes.slice(8, 12), character => character.charCodeAt(0)).buffer).getUint32(0);
      expect(bytes.length).toBe(declaredLength);
    });
    expect(portableTypographyCss).toContain(license.replaceAll('*/', '* /'));
  });
});
