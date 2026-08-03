import React from 'react';
import { renderToString } from 'react-dom/server';
import { QRCodeCanvas } from 'qrcode.react';
try {
  const str = renderToString(<QRCodeCanvas value="test" size={150} />);
  console.log("Success");
} catch(e) {
  console.error("Error:", e);
}
