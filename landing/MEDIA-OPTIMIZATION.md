# Local media optimization inventory

Prepared 2026-11-02. All processing was local. No supplied original was edited,
renamed, deleted, or uploaded. The 45 photo masters, five MP4s, and one WEBA
were SHA-256 hashed before processing and rehashed afterward: **51/51 match**.
Full original hashes are recorded per file in
`public/images/stories/inventory.json` and `public/media/inventory.json`.

## Measured asset sizes

All sizes below are exact bytes, not compressed HTTP transfer measurements.
These are whole-library totals, **not one guest's page weight**.

| Asset set | Before | After | Change |
| --- | ---: | ---: | --- |
| Photo responsive derivatives | 8,786,730, 115 WebPs | 6,076,896, 119 WebPs | 30.8% smaller |
| Five videos | 67,488,629 | 13,275,096 | 80.3% smaller |
| Music | 5,376,355 | 3,848,204 | 28.4% smaller |
| Five new matching video posters | None as a complete per-video set | 121,810 | Additional assets |

Photo masters total 8,152,275 bytes. Selecting just the largest derivative of
each photo totals 3,837,430 bytes, 52.9% below the masters. The largest individual
photo derivative is 216,682 bytes. Some low-resolution sources acquire an
additional smaller responsive choice, so their aggregate variant bytes can
increase even though their largest delivered image is smaller. All original
photo masters and existing video/audio masters remain available.

## Tools, settings, and regeneration

- Existing Sharp 0.35.5, libvips 8.18.7, libwebp 1.6.0; no package changes.
- Photos: EXIF auto-orientation, natural aspect ratio, no crop, no enlargement;
  WebP quality 80, effort 6; widths 360/720/1280, clamped to native width and
  deduplicated. Previously: 480/960/1440, WebP quality 84. Existing treatment,
  focal-point overrides, original oriented dimensions, and catalog field shape
  are preserved. No additional AVIF payload is necessary.
- FFmpeg/FFprobe 9.0.2 essentials, locally downloaded from Gyan's Windows build
  distribution over HTTPS; not an application/runtime dependency.
  Archive: `https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip`.
  Publisher checksum fetched from the same URL with `.sha256` appended:
  `60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba`.
  The downloaded archive matched exactly. This is a publisher checksum check,
  not an independently signed provenance attestation.
- Videos: libx264, CRF 22, slow preset, High profile, level 3.1, `avc1`,
  `yuv420p`; longest edge capped at 960, even dimensions, square pixels,
  native frame rate retained. All actual masters are 720×1280 portrait at
  24000/1001 fps; all derivatives are 540×960. No landscape assumption, crop,
  frame interpolation, sharpening, or color grading.
- Video audio: AAC-LC, 128 kbit/s stereo, 48 kHz. Music: AAC-LC, 96 kbit/s
  stereo, 48 kHz, M4A. No gain, normalization, or content trimming applied.
  Container metadata/chapters are omitted. MP4 and M4A have fast-start `moov`
  before `mdat`.
- Each video has its **own** WebP poster extracted from that original at 1.0 s,
  resized without cropping to 540×960, quality 82, effort 6. This includes both
  second videos, not merely the first video in each guest's sequence.
- Filenames fingerprint original SHA-256 plus transformation settings.
  Output SHA-256 hashes for MP4/M4A are also in the AV inventory. Matching
  versions of FFmpeg/Sharp are needed for byte-for-byte regeneration across
  machines. AV preparation reuses existing fingerprinted derivatives, probes
  their codecs/durations, and rechecks original hashes.

Run from `landing` in PowerShell:

```powershell
node scripts\prepare-story-photos.mjs
$env:FFMPEG_PATH = 'C:\path\to\ffmpeg.exe'
$env:FFPROBE_PATH = 'C:\path\to\ffprobe.exe'
node scripts\prepare-story-av.mjs
```

The AV script also accepts `ffmpeg`/`ffprobe` installed on PATH. The local
downloaded executables are under the ignored
`.cache\media-tools\ffmpeg-9.0.2-essentials_build\bin` directory. They are
preparation-only tools: do not add them, the archive, or a runtime npm FFmpeg
dependency to the application. No build command was changed or run for this
task. Ordinary builds must read the prepared catalog/derivatives without
requiring FFmpeg.

## Integration contract

`public/media/catalog.json` has precisely:

```text
{
  videos: [{original, originalSha256, source, poster, originalBytes, bytes, duration, width, height}],
  music: {original, originalSha256, source, originalBytes, bytes, duration}
}
```

`original` preserves exact supplied public paths, including spaces/case;
`originalSha256` is the full 64-character lowercase hexadecimal SHA-256 of that
original, emitted for every video and the music entry. The server can compare
it with the current original and refuse stale derivatives after same-named
source replacement. This field was added without re-encoding any derivative.
`source` and `poster` use `/media/<hash>.mp4`, `.m4a`, and `.webp`.
Resolve only the current guest's selected originals to their corresponding
entries. Keep original WEBA as an optional compatibility fallback. This asset
task does not change application selection, eager loading, or fallback logic.

Photo preparation still writes `.cache/story-photos.json` with the unchanged
`source`/`variants` contract. The separate persistent photo inventory contains
each variant's exact path, dimensions, and bytes. The existing
`public/images/stories/` ignore rule remains unchanged; force-add its generated
WebPs and inventory when committing prepared assets. Commit `public/media/`
alongside the preparation scripts and this report. No commits were made here.

Photo filename fingerprints hash the original bytes **plus** the serialized
encoding policy `{widths:[360,720,1280],quality:80,effort:6}`; each filename
also includes its individual output width. Changing source bytes, candidate
widths, quality, or effort therefore changes derivative URLs, avoiding stale
same-source caches across preparation-policy changes.

## Every photo: original and derivatives

Dimensions are oriented width×height. Each variant entry is
`width×height: bytes`, in ascending source width; the final variant is `source`.
The last column compares the sum of all variants for that file, not a single
download. Exact hashed filenames and full original SHA-256 values are in
`public/images/stories/inventory.json`.

| Original file in `public/posters` | Native dimensions | Original bytes | New WebP dimensions: bytes | Variant bytes before → after |
| --- | --- | ---: | --- | --- |
| `absalon y flor.jpg` | 1219×914 | 133713 | 360×270: 8562; 720×540: 21592; 1219×914: 59980 | 149366 → 90134 |
| `absalon y flor 01.jpg` | 914×914 | 122279 | 360×360: 16094; 720×720: 40820; 914×914: 56050 | 95448 → 112964 |
| `absalon y floris.jpg` | 894×914 | 96560 | 360×368: 11438; 720×736: 31414; 894×914: 45334 | 82126 → 88186 |
| `absalon y floris 02.jpg` | 514×914 | 114969 | 360×640: 33034; 514×914: 56754 | 134038 → 89788 |
| `absalon y floris 3.jpg` | 347×374 | 49010 | 347×374: 23522 | 28812 → 23522 |
| `absalon y floris 4.jpeg` | 1625×914 | 140410 | 360×203: 7468; 720×405: 16164; 1280×720: 34310 | 97896 → 57942 |
| `absalon y floris 5.jpg` | 609×914 | 169734 | 360×540: 41638; 609×914: 99246 | 198514 → 140884 |
| `absalon y floris 6.jpg` | 1048×786 | 109673 | 360×270: 13636; 720×540: 32200; 1048×786: 53196 | 147170 → 99032 |
| `absalon y floris 7.jpg` | 1233×914 | 200055 | 360×267: 17756; 720×534: 48488; 1233×914: 99422 | 248288 → 165666 |
| `amparoyeduardo.jpg` | 686×914 | 145901 | 360×480: 29616; 686×914: 77782 | 158370 → 107398 |
| `floris y absalon.jpg` | 1233×914 | 202853 | 360×267: 12710; 720×534: 37688; 1233×914: 102740 | 260058 → 153138 |
| `giovanna.jpg` | 1220×914 | 166412 | 360×270: 17716; 720×539: 42410; 1220×914: 83156 | 211840 → 143282 |
| `giovanna 02.jpg` | 1219×914 | 256974 | 360×270: 20170; 720×540: 57290; 1219×914: 133504 | 315226 → 210964 |
| `giovanna 2.jpg` | 1219×914 | 164236 | 360×270: 12368; 720×540: 32672; 1219×914: 71342 | 176520 → 116382 |
| `giovanna 3.jpg` | 1219×914 | 291308 | 360×270: 24452; 720×540: 78436; 1219×914: 174054 | 411534 → 276942 |
| `giovanna 4.jpg` | 1219×914 | 156878 | 360×270: 11338; 720×540: 31664; 1219×914: 71392 | 176034 → 114394 |
| `giovanna 5.jpg` | 1048×786 | 175646 | 360×270: 20760; 720×540: 53098; 1048×786: 89202 | 256906 → 163060 |
| `giovanna 6.jpg` | 686×914 | 149209 | 360×480: 26668; 686×914: 77898 | 144026 → 104566 |
| `giovanna 7.jpg` | 686×914 | 105607 | 360×480: 20074; 686×914: 49596 | 98634 → 69670 |
| `giovanna 8.jpg` | 686×914 | 90223 | 360×480: 15706; 686×914: 41988 | 84928 → 57694 |
| `giovanna 9.jpg` | 1219×914 | 166227 | 360×270: 18092; 720×540: 44788; 1219×914: 83408 | 211082 → 146288 |
| `giovanna 10.jpg` | 1219×914 | 187595 | 360×270: 13814; 720×540: 38496; 1219×914: 88750 | 218752 → 141060 |
| `giovanna 11.jpg` | 1552×873 | 240567 | 360×202: 15860; 720×405: 43166; 1280×720: 91364 | 237522 → 150390 |
| `giovanna 13.jpg` | 1219×914 | 186013 | 360×270: 16086; 720×540: 43732; 1219×914: 93478 | 227452 → 153296 |
| `luis y marie.jpg` | 887×914 | 164641 | 360×371: 25234; 720×742: 67256; 887×914: 90644 | 154618 → 183134 |
| `luis y marie 2.JPG` | 1219×914 | 198475 | 360×270: 15082; 720×540: 43234; 1219×914: 94194 | 230282 → 152510 |
| `roberto.jpg` | 1220×914 | 123321 | 360×270: 12446; 720×539: 28078; 1220×914: 52686 | 134502 → 93210 |
| `roberto 02.jpg` | 1219×914 | 293583 | 360×270: 21602; 720×540: 68450; 1219×914: 167798 | 394328 → 257850 |
| `roberto 2.jpg` | 686×914 | 211376 | 360×480: 39810; 686×914: 137728 | 252318 → 177538 |
| `roberto 03.jpg` | 586×914 | 117433 | 360×562: 28262; 586×914: 59122 | 134608 → 87384 |
| `roberto 3.jpg` | 686×914 | 125617 | 360×480: 23894; 686×914: 59084 | 115878 → 82978 |
| `roberto 4.jpg` | 1040×780 | 98626 | 360×270: 15016; 720×540: 35296; 1040×780: 56002 | 156206 → 106314 |
| `roberto 5.jpg` | 686×914 | 137917 | 360×480: 24444; 686×914: 69014 | 132758 → 93458 |
| `roberto 12.JPG` | 1219×914 | 358244 | 360×270: 22276; 720×540: 80300; 1219×914: 216682 | 477934 → 319258 |
| `roberto y maria 1.jpg` | 678×914 | 142938 | 360×485: 24056; 678×914: 73200 | 142370 → 97256 |
| `roberto y maria 2.jpg` | 1233×914 | 175582 | 360×267: 13600; 720×534: 37804; 1233×914: 79924 | 199476 → 131328 |
| `roberto y maria 3.png` | 411×914 | 682529 | 360×801: 60996; 411×914: 72650 | 87360 → 133646 |
| `roberto y maria 5.jpg` | 1219×914 | 224892 | 360×270: 18360; 720×540: 54732; 1219×914: 121448 | 300068 → 194540 |
| `roberto y maria 6.jpg` | 1233×914 | 162914 | 360×267: 13780; 720×534: 31536; 1233×914: 71562 | 184600 → 116878 |
| `roberto y maria 7.jpg` | 514×914 | 105438 | 360×640: 30262; 514×914: 49402 | 114948 → 79664 |
| `roberto y maria 8.JPG` | 1219×914 | 125007 | 360×270: 8842; 720×540: 24484; 1219×914: 51680 | 133354 → 85006 |
| `roberto y maria 9.JPG` | 1219×914 | 218485 | 360×270: 12738; 720×540: 39718; 1219×914: 105940 | 241622 → 158396 |
| `roberto  y maria 10.jpg` | 514×914 | 123948 | 360×640: 39958; 514×914: 70216 | 158722 → 110174 |
| `roberto y maria 10.jpg` | 1219×914 | 293117 | 360×270: 21030; 720×540: 67236; 1219×914: 163672 | 392130 → 251938 |
| `roberto y maria 11.jpg` | 1219×914 | 246140 | 360×270: 18478; 720×540: 52002; 1219×914: 117314 | 278106 → 187794 |

## Every video, poster, and music file

Every original video is 720×1280; every optimized video/poster is 540×960.
All video durations below are unchanged to the reported precision.

| Original in `public/videos` | Original bytes | MP4 bytes | Duration (s) | Poster bytes | Full-video SSIM |
| --- | ---: | ---: | ---: | ---: | ---: |
| `GIOVANNA 2.mp4` | 13144344 | 2603109 | 32.704000 | 24028 | 0.992508 |
| `GIOVANNA.mp4` | 6973910 | 1451424 | 18.538667 | 24316 | 0.992508 |
| `ROBERTO 2.mp4` | 20837296 | 3980329 | 50.730667 | 24844 | 0.992410 |
| `ROBERTO Y MARIA.mp4` | 12721165 | 2527603 | 32.213333 | 24460 | 0.992368 |
| `ROBERTO.mp4` | 13811914 | 2712631 | 35.754667 | 24162 | 0.992689 |

Hashed output paths, relative to `public/media`:

| Original video | MP4 filename | Matching WebP filename |
| --- | --- | --- |
| `GIOVANNA 2.mp4` | `d743e97ab1a82b5749817256.mp4` | `77dbb6593a7ea322719d2c3e.webp` |
| `GIOVANNA.mp4` | `135f4e2cfea88414e1b246f3.mp4` | `eee44857d9733eb505bf80c0.webp` |
| `ROBERTO 2.mp4` | `76a9f7f2c4f17ca71e63e86c.mp4` | `bad1d2e829aaf990441b5543.webp` |
| `ROBERTO Y MARIA.mp4` | `5d4106fb15235f2f47e02fc2.mp4` | `857af8c3fae46740dc356d04.webp` |
| `ROBERTO.mp4` | `8b9240e49bb6d081012dad1f.mp4` | `d8640a29db822dd07241f59c.webp` |

Music original: `public/audio/videoplayback.weba`, Opus stereo 48 kHz,
5,376,355 bytes, 320.761 s. Derivative:
`public/media/5e6fe023df9a3b3f7ffa9808.m4a`, AAC-LC stereo 48 kHz,
3,848,204 bytes, 320.737250 s. The 0.023750 s container-duration difference
is a container/codec timing difference; no intentional trim was applied.

## Individual 540×960 versus native 720×1280 evaluation

The initial 960-pixel longest-edge cap produced 540×960 for every file because
all five actual masters are 720×1280, not because landscape/portrait orientation
was ignored. A follow-up encoded **each complete original separately** at native
720×1280, CRF 22, slow preset, with exactly the same 128 kbit/s AAC settings and
fast-start as its 540×960 counterpart. Native 720 was not upscaled. Candidates
were kept outside public assets while comparing; no running build/export was
changed.

Each video was compared against its own original and both candidate resolutions
at 1 s, 50%, and 80% of its duration: complete frames at 390-pixel phone-card
width, facial detail at a 540-pixel desktop-card width, and native 720-pixel
detail crops. These raster-width comparisons are not claims about the
application's exact CSS width or physical-device pixel density. The shots all
use the same room, two faces, fixed portrait composition, soft original focus,
bright background screen, and similar clothing; nevertheless every file was
encoded, measured, and visually inspected independently.

| File | 540×960 bytes, selected | 720×1280 candidate bytes | Individual assessment and decision |
| --- | ---: | ---: | --- |
| `GIOVANNA 2.mp4` | 2,603,109 | 4,162,411 | Faces and hand gestures remain clear at phone/card sizes. Native 720 slightly improves beard/hair boundaries in enlarged crops, not a material expression/face-detail improvement in the cards. Retain 540; avoid 1,559,302 additional bytes. |
| `GIOVANNA.mp4` | 1,451,424 | 2,307,275 | Faces, smile, microphone, and moving hand remain recognizable. Both candidates retain the master's soft focus; 720 has only a small texture advantage. Retain 540; avoid 855,851 additional bytes. |
| `ROBERTO 2.mp4` | 3,980,329 | 6,461,157 | Checked the longest clip independently at 1/25.37/40.58 s. Both faces and gestures survive at card sizes; 720's modest fine-detail advantage does not justify 2,480,828 extra bytes. Retain 540. |
| `ROBERTO Y MARIA.mp4` | 2,527,603 | 4,063,808 | Head tilts and both faces retain their original framing. Native 720 slightly sharpens beard/screen lettering at enlarged size, without restoring detail absent in the master. Retain 540; avoid 1,536,205 additional bytes. |
| `ROBERTO.mp4` | 2,712,631 | 4,358,065 | Faces, expressions, and foreground gesture remain clear; 720's advantage is chiefly fine hair/edge texture at enlarged size. Retain 540; avoid 1,645,434 additional bytes. |

Combined native-720 candidates are 21,352,716 bytes, **60.8% larger** than the
selected 13,275,096-byte set. No file showed a sufficiently different shot,
smaller faces, or materially improved card-size facial detail to warrant a
resolution exception. All five selections remain 540×960 **after** individual
evaluation, rather than a blanket assertion that every video should be low
resolution. Native 720 does retain more fine detail at larger/fullscreen or
high-density viewing; this is an explicit mobile/data tradeoff, not a claim of
equivalence at every output size. If larger/fullscreen fidelity becomes the
priority, reconsider native 720 rather than upscaling the 540 derivatives.

Full-duration SSIM compares each candidate with its own original, scaling
**both** to the named raster width and preserving aspect ratio. Values are
`540 candidate / 720 candidate`; a higher value is better. These objective
differences support comparison but do not define a perceptual pass threshold.

| File | 390px width | 540px width | 720px width |
| --- | --- | --- | --- |
| `GIOVANNA 2.mp4` | 0.993785 / 0.995969 | 0.992508 / 0.994796 | 0.989469 / 0.993783 |
| `GIOVANNA.mp4` | 0.993771 / 0.995950 | 0.992508 / 0.994792 | 0.989501 / 0.993797 |
| `ROBERTO 2.mp4` | 0.993695 / 0.995862 | 0.992410 / 0.994675 | 0.989439 / 0.993666 |
| `ROBERTO Y MARIA.mp4` | 0.993689 / 0.995904 | 0.992368 / 0.994718 | 0.989358 / 0.993689 |
| `ROBERTO.mp4` | 0.993933 / 0.996061 | 0.992689 / 0.994918 | 0.989647 / 0.993928 |

Example PowerShell reproduction commands (substitute each exact original and
its selected catalog source; repeat SSIM at widths 390, 540, and 720):

```powershell
New-Item -ItemType Directory -Force .cache\media-review | Out-Null
& $env:FFMPEG_PATH -hide_banner -loglevel error -nostdin -y `
  -i 'public\videos\GIOVANNA 2.mp4' -map 0:v:0 -map '0:a:0?' `
  -map_metadata -1 -map_chapters -1 -vf 'scale=720:1280:reset_sar=1' `
  -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p `
  -profile:v high -level:v 3.1 -tag:v avc1 `
  -c:a aac -b:a 128k -ar 48000 -ac 2 -movflags +faststart `
  '.cache\media-review\giovanna-2-720.mp4'
& $env:FFMPEG_PATH -hide_banner -xerror `
  -i 'public\videos\GIOVANNA 2.mp4' `
  -i 'public\media\d743e97ab1a82b5749817256.mp4' `
  -filter_complex '[0:v]scale=540:-2,setsar=1[ref];[1:v]scale=540:-2,setsar=1[enc];[ref][enc]ssim' `
  -an -f null -
```

Final catalog, prepared video/poster bytes, photo bytes, and music bytes are
unchanged by this follow-up. Music was **already** AAC-LC 96 kbit/s stereo,
48 kHz, 320.737250 s; the 128 kbit/s setting is for spoken video soundtracks,
not the background M4A. No further music re-encode or audible-quality claim
was made.

## Validation and visual review

- Both preparation scripts pass `node --check`.
- Repeated preparation produced byte-identical assets and catalogs; photo
  variants were actually regenerated, while existing AV outputs were reused.
- Every one of the 119 WebP photo variants was fully decoded with Sharp.
  Dimensions, no enlargement, and native aspect ratio within integer-pixel
  rounding were checked for every variant. All 51 originals still match
  their pre-processing SHA-256 and byte counts.
- All five MP4s and the M4A fully decoded with FFmpeg using `-xerror`.
  FFprobe checked H264/yuv420p, AAC, dimensions, and durations. MP4/M4A
  top-level atom parsing confirmed `moov` precedes `mdat` in all six outputs.
- Full-video SSIM used original frames scaled to the derivative's 540×960
  dimensions, square pixels, and FFmpeg's `ssim` filter. Scores above compare
  compression after equalizing size; they do not measure information lost
  through downscaling or guarantee perceptual quality.
- Reviewed all 45 original/optimized contact-sheet images for framing,
  orientation, and visible people. Also compared 200% face/detail crops from
  `absalon y flor.jpg`, `giovanna 3.jpg`, `giovanna 11.jpg`, `roberto 12.JPG`,
  `roberto y maria 3.png`, `roberto y maria 7.jpg`,
  `roberto y maria 11.jpg`, and `luis y marie.jpg`.
  Facial features, hair, glasses, group faces, collage borders, and patterned
  clothing remain recognizable; slight smoothing/texture loss is visible
  under enlargement. Quality 80 was retained as a reasonable mobile-oriented
  tradeoff rather than claiming visually lossless output.
- Compared each video's original and derivative at 1 s and its midpoint,
  plus 150% facial detail at each midpoint. Faces and original framing remain
  intact, with mild expected softness in hair/beard detail. The woman's
  partial framing at the left edge already exists in the masters; no extra
  cropping or attempt to fabricate missing content was applied. Each poster
  comes from the correct original, including both second videos.

### Remaining uncertainty

Visual checks are sampled still-frame comparisons, not exhaustive inspection
of every frame, every photo variant at every screen density, or human listening
tests. AAC music at 96 kbit/s is a lossy compatibility/size tradeoff; the
original WEBA is retained for comparison/fallback. Real-device Safari,
WhatsApp in-app playback, subjective speech/music listening, captions,
guest-selection/network isolation, and integrated mobile page measurements
remain integration checks. No Core Web Vitals improvement or browser playback
result is claimed from these asset-only byte/codec measurements.
