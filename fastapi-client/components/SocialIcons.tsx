import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export function GoogleIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* A compact multicolor-like Google 'G' glyph approximation */}
      <path fill="#EA4335" d="M12 10.8v3.6h5.2c-.22 1.4-1.4 4.1-5.2 4.1-3.1 0-5.6-2.5-5.6-5.6S8.9 7.4 12 7.4c1.8 0 3 .8 3.8 1.6l2.6-2.5C17.6 4 14.9 3 12 3 7.5 3 3.9 6.6 3.9 11S7.5 19 12 19c4.2 0 7-2.7 7-6.5 0-.4 0-.7-.1-1H12z"/>
    </SvgIcon>
  );
}

export function MicrosoftIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      {/* Four-color Microsoft window */}
      <rect x="2" y="3" width="8" height="8" fill="#F35325" />
      <rect x="14" y="3" width="8" height="8" fill="#81BC06" />
      <rect x="2" y="13" width="8" height="8" fill="#00A4EF" />
      <rect x="14" y="13" width="8" height="8" fill="#FFB900" />
    </SvgIcon>
  );
}
