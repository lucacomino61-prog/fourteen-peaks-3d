// Gasherbrum II routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 35.7583, lon: 76.6533, elevation: 8035, name: 'Gasherbrum II', aka: 'Gasherbrum II · K4',
  range: 'Karakoram, Gasherbrum group', countries: 'Pakistan / China',
  tagline: 'The thirteenth highest mountain on Earth, and the gentlest of the Karakoram giants: the peak where most people first climb to 8,000 m in Pakistan.',
  summitText: 'A small rocky pyramid on top of a snow mountain, with K2 and Broad Peak to the north-west and Hidden Peak across the Gasherbrum La. Three Austrians reached it in 1956 in a single push from 7,150 m; in 2011 three men reached it in February, the first winter ascent in the Karakoram.',
  summitBlurb: 'Thirteenth highest point on Earth, on the Pakistan–China border at the head of the Baltoro. About 1,000 ascents and 25 deaths, the safest record among the Karakoram 8,000ers.',
  figuresLead: 'A Karakoram giant that is climbed by hundreds and kills few, though its neighbours do not share the courtesy.',
  otherLines: 'Lines climbed but not modelled here: the 1982 French south-west face, the north face from the Chinese side, and the 1979 Chilean variation on the south-west ridge.',
  historyTitle: 'Seventy years',
  historyLead: 'From the Austrian first ascent to the first winter ascent in the Karakoram.',
}

const routes = [
  {
    id: 'normal',
    name: 'Southwest Ridge',
    aka: 'The Banana Ridge · the normal route',
    color: '#ff6a3d',
    firstAscent: '7 July 1956, Fritz Moravec, Josef Larch & Hans Willenpart (Austrian expedition), after a bivouac at 7,150 m without tents or sleeping bags',
    share: '≈ 95% of all ascents',
    difficulty: 'The Gasherbrum icefall, a curving snow ridge at 35-45°, and a rocky summit pyramid; fixed rope throughout',
    verticalGain: '≈ 3,000 m from Base Camp',
    summary:
      'Up the shared icefall to Camp 1, then the curving crest the guides call the Banana Ridge to the shoulder below the summit pyramid, and up its rocks to the top. The 1956 Austrians, storm-bound low on the mountain, made a single push from 7,150 m; today it is the most climbed route in the Karakoram.',
    waypoints: [
      [35.7450, 76.5800], // Base Camp
      [35.7400, 76.6400],
      [35.7306, 76.6581], // C1
      [35.7375, 76.6569],
      [35.7421, 76.6561],
      [35.7445, 76.6557], // C2
      [35.7480, 76.6551], // C3
      [35.7514, 76.6545], // C4
      [35.7537, 76.6541],
      [35.7560, 76.6537], // summit pyramid
      [35.7583, 76.6533], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 5050, lat: 35.7450, lon: 76.5800, blurb: 'On the Abruzzi Glacier, shared with Gasherbrum I expeditions; a week up the Baltoro from Askole.' },
      { name: 'Camp 1', alt: 5900, lat: 35.7306, lon: 76.6581, blurb: 'Above the icefall, where the Gasherbrum I and II routes divide.' },
      { name: 'Camp 2', alt: 6500, lat: 35.7445, lon: 76.6557, blurb: 'On the crest of the Banana Ridge.' },
      { name: 'Camp 3', alt: 6950, lat: 35.7480, lon: 76.6551, blurb: 'Below the shoulder, the last camp for most teams.' },
      { name: 'Camp 4', alt: 7400, lat: 35.7514, lon: 76.6545, blurb: 'On the shoulder below the summit pyramid, used by slower teams; summit day from here is six to eight hours.' },
    ],
    hazards: ['gasherbrum-icefall', 'banana-ridge', 'upper-slopes', 'summit-pyramid', 'death-zone'],
  },
  {
    id: 'east',
    name: 'Southeast Spur',
    aka: 'Kukuczka–Kurtyka, 1983 · over Gasherbrum II East',
    color: '#c77dff',
    firstAscent: '1 July 1983, Jerzy Kukuczka & Wojciech Kurtyka (Poland), alpine style, traversing Gasherbrum II East on the way',
    share: 'One ascent',
    difficulty: 'A spur from the Gasherbrum La basin to the east ridge, then the long crest over the east summit to the main top',
    verticalGain: '≈ 2,100 m from the Gasherbrum La',
    summary:
      'The first of the Polish pair’s two new routes in a fortnight: from the basin below the Gasherbrum La up a spur to the ridge, over the 7,772 m east summit and along the crest to the top, then down the normal route. A week later they climbed the south-west face of Hidden Peak.',
    waypoints: [
      [35.7306, 76.6581], // C1
      [35.7400, 76.6750],
      [35.7450, 76.6800], // La camp
      [35.7500, 76.6820],
      [35.7540, 76.6790],
      [35.7569, 76.6723], // east ridge
      [35.7574, 76.6660],
      [35.7578, 76.6596],
      [35.7581, 76.6565],
      [35.7583, 76.6533], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5900, lat: 35.7306, lon: 76.6581, blurb: 'The shared camp above the icefall.' },
      { name: 'La camp', alt: 6450, lat: 35.7450, lon: 76.6800, blurb: 'In the basin below the Gasherbrum La, at the foot of the spur.' },
      { name: 'East ridge', alt: 7300, lat: 35.7569, lon: 76.6723, blurb: 'The bivouac on the ridge below Gasherbrum II East.' },
    ],
    hazards: ['gasherbrum-icefall', 'la-basin', 'east-ridge', 'summit-pyramid', 'death-zone'],
  },
  {
    id: 'traverse',
    name: 'Gasherbrum traverse',
    aka: 'Messner–Kammerlander, 1984 · two 8,000ers without returning to base',
    color: '#7dffb3',
    firstAscent: '24–28 June 1984, Reinhold Messner & Hans Kammerlander, from the summit of Gasherbrum II down to the Gasherbrum La and up Hidden Peak',
    share: 'Once',
    difficulty: 'Two summits and a 1,500 m descent between them, carried in one push with a single tent',
    verticalGain: '≈ 2,900 m of ascent above Camp 3',
    summary:
      'The first traverse of two 8,000 m peaks: up the normal route on Gasherbrum II, down its south-east side to the Gasherbrum La, then straight up the north-west face of Hidden Peak and down its normal route, without touching base camp between the two summits.',
    waypoints: [
      [35.7480, 76.6551], // C3
      [35.7514, 76.6545],
      [35.7560, 76.6537],
      [35.7583, 76.6533], // Gasherbrum II summit
      [35.7543, 76.6613],
      [35.7503, 76.6693],
      [35.7450, 76.6800], // Gasherbrum La
      [35.7400, 76.6750],
      [35.7353, 76.6814],
      [35.7321, 76.6857], // couloir
      [35.7305, 76.6878],
      [35.7274, 76.6921],
      [35.7242, 76.6964], // Gasherbrum I summit
    ],
    camps: [
      { name: 'Gasherbrum II summit', alt: 8035, lat: 35.7583, lon: 76.6533, blurb: 'The first summit, reached on the second day from base camp.' },
      { name: 'Gasherbrum La', alt: 6500, lat: 35.7450, lon: 76.6800, blurb: 'The col between the two mountains, where the pair bivouacked between summits.' },
      { name: 'Couloir top', alt: 7100, lat: 35.7305, lon: 76.6878, blurb: 'The last bivouac, on Hidden Peak’s north-west ridge.' },
    ],
    hazards: ['la-basin', 'summit-pyramid', 'death-zone'],
    finish: { title: 'Gasherbrum I', alt: 8080, body: 'The second summit of the traverse, reached on the fifth day. From here the pair descended Hidden Peak’s normal route to the shared base camp.' },
  },
  {
    id: 'winter',
    name: 'The winter line',
    aka: 'Moro–Urubko–Richards, February 2011',
    color: '#5fd3ff',
    firstAscent: '2 February 2011, Simone Moro, Denis Urubko & Cory Richards, the first winter ascent of any 8,000 m peak in the Karakoram',
    share: 'Historic; the normal route in winter conditions',
    difficulty: 'The normal route at −50 °C in the jet stream, climbed alpine style with a single tent',
    verticalGain: '≈ 3,000 m from Base Camp',
    summary:
      'A three-man team climbed the normal route in a four-day window between storms, with winds above 100 km/h on the summit. On the descent an avalanche swept all three; they dug themselves out and reached base camp the same night. Richards’ film of the climb won at Banff.',
    waypoints: [
      [35.7450, 76.5800], // Base Camp
      [35.7400, 76.6400],
      [35.7306, 76.6581], // C1
      [35.7421, 76.6561],
      [35.7445, 76.6557], // C2
      [35.7491, 76.6549], // C3
      [35.7537, 76.6541],
      [35.7560, 76.6537],
      [35.7583, 76.6533], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5900, lat: 35.7306, lon: 76.6581, blurb: 'The first night, in the icefall wind.' },
      { name: 'Camp 2', alt: 6500, lat: 35.7445, lon: 76.6557, blurb: 'Dug into the ridge.' },
      { name: 'Camp 3', alt: 7100, lat: 35.7491, lon: 76.6549, blurb: 'The last camp before the summit push on 2 February.' },
    ],
    hazards: ['gasherbrum-icefall', 'upper-slopes', 'summit-pyramid', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'gasherbrum-icefall', name: 'Gasherbrum icefall', lat: 35.7400, lon: 76.6400, alt: 5600, radius: 420, severity: 4,
    kind: 'Serac · crevasses',
    blurb: 'The broken South Gasherbrum Glacier between Base Camp and Camp 1, shared with Gasherbrum I and crossed many times each season.',
    incidents: ['2006, a serac collapse in the icefall kills a climber and a high-altitude porter'],
  },
  {
    id: 'banana-ridge', name: 'Banana Ridge', lat: 35.7445, lon: 76.6557, alt: 6500, radius: 300, severity: 3,
    kind: 'Crevasses · exposure',
    blurb: 'The curving snow crest between Camps 1 and 2, corniced on its eastern side.',
    incidents: [],
  },
  {
    id: 'upper-slopes', name: 'Upper slopes', lat: 35.7491, lon: 76.6549, alt: 7100, radius: 300, severity: 4,
    kind: 'Windslab · avalanche',
    blurb: 'The snow slopes between Camp 3 and the shoulder, which load with windslab and have avalanched onto descending parties.',
    incidents: ['2 Feb 2011, the winter team is swept by an avalanche on the descent and survives'],
  },
  {
    id: 'summit-pyramid', name: 'Summit pyramid', lat: 35.7560, lon: 76.6537, alt: 7750, radius: 250, severity: 4,
    kind: 'Rockfall · queues · late descents',
    blurb: 'The rocky pyramid and short summit ridge, where parties bunch up on the fixed lines and descend in the afternoon.',
    incidents: [],
  },
  {
    id: 'la-basin', name: 'Gasherbrum La basin', lat: 35.7450, lon: 76.6800, alt: 6450, radius: 350, severity: 4,
    kind: 'Serac · storm',
    blurb: 'The high basin between the two Gasherbrums, threatened by seracs from both and a trap in storm.',
    incidents: [],
  },
  {
    id: 'east-ridge', name: 'East ridge', lat: 35.7569, lon: 76.6723, alt: 7300, radius: 320, severity: 4,
    kind: 'Cornice · exposure',
    blurb: 'The corniced crest between Gasherbrum II East and the main summit, climbed once.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 35.7583, lon: 76.6533, alt: 8000, radius: 500, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Only the last 35 m lie above 8,000 m; on Gasherbrum II the danger is the weather, not the altitude.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1956, title: 'First ascent', text: 'Fritz Moravec, Josef Larch and Hans Willenpart reach the summit on 7 July after an open bivouac at 7,150 m, having lost their high camp to an avalanche.' },
  { year: 1975, title: 'The women’s rope', text: 'Halina Krüger-Syrokomska and Anna Okopińska summit on 12 August, the first all-female rope team on an 8,000 m peak.' },
  { year: 1982, title: 'Messner', text: 'Reinhold Messner climbs the mountain with the Pakistanis Sher Khan and Nazir Sabir.' },
  { year: 1983, title: 'The Polish fortnight', text: 'Jerzy Kukuczka and Wojciech Kurtyka climb a new route over Gasherbrum II East on 1 July, then a new route on Hidden Peak a week later.' },
  { year: 1984, title: 'The traverse', text: 'Messner and Hans Kammerlander climb Gasherbrum II and Hidden Peak in one push without returning to base camp, the first traverse of two 8,000 m peaks.' },
  { year: 1996, title: 'The commercial peak', text: 'With a straightforward line and a shared base camp, Gasherbrum II becomes the standard first 8,000 m peak of the Karakoram; dozens summit each July.' },
  { year: 2011, title: 'Winter', text: 'Simone Moro, Denis Urubko and Cory Richards make the first winter ascent of a Karakoram 8,000 m peak on 2 February and survive an avalanche on the descent.' },
  { year: 2023, title: 'Record season', text: 'More than a hundred summits in one summer as the Karakoram catches up with Nepal’s commercial model.' },
]

const stats = [
  { label: 'Height', value: '8,035 m', note: '13th highest on Earth' },
  { label: 'First ascent', value: '1956', note: 'Moravec, Larch & Willenpart' },
  { label: 'Summits', value: '≈ 1,000', note: 'the most climbed Karakoram 8,000er' },
  { label: 'Deaths', value: '≈ 25', note: 'about one per forty summits' },
  { label: 'Winter ascent', value: '2011', note: 'first in the Karakoram' },
  { label: 'Above 8,000 m', value: '35 m', note: 'the shortest Death Zone of the fourteen' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'gasherbrum2', peak, routes, hazards, timeline, stats, sources }
