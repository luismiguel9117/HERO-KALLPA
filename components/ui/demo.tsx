// components/ui/demo.tsx
'use client';

import React from 'react';
import { ParallaxComponent } from './parallax-scrolling';

export default function ParallaxDemo() {
  return (
    <>
      <ParallaxComponent />
      <div className="osmo-credits">
        <p className="osmo-credits__p">
          Resource by <a target="_blank" href="https://www.osmo.supply/" className="osmo-credits__p-a" rel="noreferrer">Osmo</a>
        </p>
      </div>
    </>
  );
}
