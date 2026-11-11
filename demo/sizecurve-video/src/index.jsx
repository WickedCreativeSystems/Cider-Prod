import { registerRoot, Composition } from "remotion";
import { Explainer } from "./Explainer.jsx";
import { FPS, DURATION } from "./timeline.js";
registerRoot(() => <Composition id="Explainer" component={Explainer} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />);
