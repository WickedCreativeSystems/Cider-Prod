# Recording the VibeCider bot's own record (for docent's raw clips)

Used on 12 Nov 2026 for site/media/vibecider-bot-capture.mp4. It records three
live pages at phone width: the studio's page for this bot and one day of its
log, Round Robin, and the sales page. Nothing is signed in to, nothing is
paid, and the visit counter is blocked so a take counts no visit.

1. A scratch folder with `footage/`, `shots/` and `out/`, and `node_modules`
   holding playwright-core and ffmpeg-static. Copy `rec-bot.mjs` into it.
2. `Xvfb :97 -screen 0 1200x2400x24 -nolisten tcp`
3. `S=<scratch> CHROME=<chrome for testing> DISPLAY=:97 node rec-bot.mjs probe`
   prints the layout and saves `shots/probe.png`. The page starts 261 pixels
   down the screen (the browser's own bars), so takes use `OY=261`.
4. One take per page, each about 45 s of wall time or less:
   `S=<scratch> CHROME=<chrome> DISPLAY=:97 OY=261 node rec-bot.mjs zoo t1`
   then `rr t1`, then `sales t1`. Each take and its times land in `footage/`
   as `<take>-<mode>.mp4` and `<take>-<mode>.marks.json`.
5. Join them with hard cuts and trim to under 60 s (docent's limit):
   `ffmpeg -i footage/t1-zoo.mp4 -i footage/t1-rr.mp4 -i footage/t1-sales.mp4
   -filter_complex "[0:v]trim=0:31.0,setpts=PTS-STARTPTS[a];[1:v]trim=1.2:14.5,setpts=PTS-STARTPTS[b];[2:v]trim=0.6:15.0,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0,fps=30[v]"
   -map "[v]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart out/vibecider-bot-capture.mp4`
   Look at a frame either side of each cut and at the last second before it
   goes anywhere.
6. The scroll runs inside the page on the page's own clock. A scroll driven
   one step at a time from the script ran four times too slow on the studio's
   page (118 s for a 32 s take).
7. After the press on a day card the studio's site shows the new page at the
   old scroll position and then scrolls itself to the top. That is left in.
8. The clip's JSON must say: where the cuts are; that no bot has been sold;
   that Round Robin is a demo no client paid for; that the names typed are
   made up; which seconds show a date, a count or a price; and that the price
   is the page's on the day of the shot.
9. Read every day card that passes through the frame before publishing. The
   cards are this bot's own plan headings; none may name a client or prospect.

## Round Robin on its own (`rec-rr.mjs`, 13 Nov 2026)

Used for site/media/roundrobin-capture-2.mp4: one take, no cuts, 21.4 s.

1. Same scratch folder, same Xvfb line and same `OY` as above (run
   `rec-bot.mjs probe` first if the browser or the screen has changed).
2. `S=<scratch> CHROME=<chrome> DISPLAY=:97 node rec-rr.mjs measure` prints
   where the headline, the form, the schedule and the table sit at each stop
   and saves a picture of each in `shots/`. Read them before a take: docent
   needs the first type in a held frame at least 80 px down a 1920 frame
   (27 px at phone width), because an address bar covers what is higher.
3. `S=<scratch> CHROME=<chrome> DISPLAY=:97 OY=261 node rec-rr.mjs take t1`
   writes `footage/t1-rr.mp4` and its marks. Encode it whole:
   `ffmpeg -i footage/t1-rr.mp4 -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r 30 -movflags +faststart out/roundrobin-capture-2.mp4`
4. The tail holds all seven rounds whole. Seven rows are 602 px of a 640 px
   screen, so the table's heading row is cut by the top edge there; the
   clip's JSON says so.
5. "Shuffle again" is never pressed. The first shuffle is fixed (seed 1), so a
   stranger who types the same names gets the schedule in the clip; a second
   shuffle is random and cannot be checked.
6. Start Xvfb as its own long-running command. Started with `nohup … &` inside
   another command it was gone by the next one, and Chrome then says
   "Missing X server or $DISPLAY".
