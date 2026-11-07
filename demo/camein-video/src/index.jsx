import { registerRoot, Composition } from "remotion";
import { Demo } from "./Demo.jsx";
import { FPS, DURATION } from "./timeline.js";
registerRoot(() => <Composition id="Demo" component={Demo} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />);
