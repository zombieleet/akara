
# settings
1. fullscreen settings
2. playback speed settings
3. howmany seconds to wait before turning off akara-control in fullscreen mode
4. stying cues
5. automatically playing converted media
6. play other media when conversion is taking place
7. ask for where to save subtitle
8. install superagent for api calls on youtube, fb, twiter and others, instead of using the built in http/https module
9. support for plugin on playlist ( get, set , remove , delete )
10. fix repeat bug once and for all
ffmpeg -i input.mp4 <video options> -filter split rtmp://server[:port][/app] out.mp4

ffmpeg -i original.mp4 -c:v libvpx -preset slow -s 1024x576 -qmin 0 -qmax 50 -an -b:v 400K -pass 1 homepage.webm
ffmpeg -i original.mp4 -c:v libx264 -preset slow -s 1024x576 -an -b:v 370K homepage.mp4
11. put function specific to a section to it's on section instead of util.js
12. fork m3u8-reader and use the forked repo as the default
ffmpeg -i Videos/gulps/part15/15-01-softbodies-part1-vertexweight-mobile.mp4 -c copy -f rtp_mpegts rtp://localhost:4000 -c copy -f flv - | ffmpeg -f flv -i - -c copy -f mp4 tt.mp4

