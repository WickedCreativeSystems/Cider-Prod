#!/bin/sh
# Edit-friendly copies of the footage: originals in footage/ (not in git), copies in public/.
# Dense keyframes, so sped-up stretches don't decode hundreds of frames per output frame,
# and image flips for the wall, so it doesn't decode 45 videos at once.
set -e
cd "$(dirname "$0")"
FF="npx remotion ffmpeg"
enc="-c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -an -movflags +faststart"
mkdir -p public/shorts public/flip
for f in link store; do
  [ -f public/$f.mp4 ] || $FF -loglevel error -y -i footage/$f.mp4 -g 15 $enc public/$f.mp4
done
[ -f public/talk.mp4 ] || $FF -loglevel error -y -i footage/talk.mp4 -g 15 $enc public/talk.mp4
for f in footage/shorts/*.mp4; do
  b=$(basename "$f" .mp4)
  [ -f public/shorts/$b.mp4 ] || $FF -loglevel error -y -i "$f" -vf scale=540:960 -g 10 $enc public/shorts/$b.mp4
  if [ ! -d public/flip/$b ]; then mkdir -p public/flip/$b; $FF -loglevel error -y -ss 1 -t 5 -i "$f" -vf scale=270:480 -r 8 -q:v 5 public/flip/$b/%02d.jpg; fi
done
echo prepared
