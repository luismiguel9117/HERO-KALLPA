// components/ui/parallax-demo.tsx
import React from 'react';
import { ParallaxComponent } from './parallax-scrolling';

export default function ParallaxDemo() {
  return (
    <>
      <ParallaxComponent />
      <div className="osmo-credits">
        <p className="osmo-credits__p">
          KALPA Cold Brew &mdash; Parallax Intro
        </p>
      </div>
    </>
  );
}
