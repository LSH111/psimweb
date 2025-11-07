
Parking Markers (SVG) — Quick Use
=================================

Files
-----
- marker-<color>-<size>.svg           (plain pin with white inner circle)
- marker-<color>-P-<size>.svg         (pin with 'P' text)
  Colors: red, orange, blue, green, gray
  Sizes: 24, 32, 48, 64 (pixels)

Web Map Examples
----------------

Leaflet:
  L.marker([37.5665, 126.9780], {
    icon: L.icon({
      iconUrl: 'marker-blue-48.svg',
      iconSize: [48, 48],
      iconAnchor: [24, 44], // tip at bottom center
      popupAnchor: [0, -40]
    })
  }).addTo(map);

Kakao Maps:
  const imageSrc = 'marker-orange-48.svg';
  const imageSize = new kakao.maps.Size(48, 48);
  const imageOption = { offset: new kakao.maps.Point(24, 44) };
  const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
  const marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(37.5665, 126.9780),
    image: markerImage
  });
  marker.setMap(map);

CSS-Tintable (Sprite)
---------------------
Inline 'marker-sprite.svg' in your HTML and tint via CSS:

  <svg width="48" height="48" class="pin pin--red">
    <use href="#pin"></use>
  </svg>

  .pin { filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); }
  .pin use path { fill: #3B82F6; } // set pin color
  .pin use circle { fill: #fff; }

Notes
-----
- All files have a 24×24 viewBox and scale crisply to the target pixel size.
- The iconAnchor/popup offsets above fit the provided geometry.
- The 'P' variant uses a basic web-safe font; if you need a path-based 'P' for pixel-perfect consistency, let me know.
