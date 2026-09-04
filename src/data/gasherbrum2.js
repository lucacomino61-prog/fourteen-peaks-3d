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
    difficulty: 'The Gasherbrum icefall, a curving snow ridge at 35-45°, a rising traverse right under the summit pyramid to the east ridge, and the ridge to the top; fixed rope throughout',
    verticalGain: '≈ 3,000 m from Base Camp',
    summary:
      'Up the shared icefall to Camp 1, then the curving crest the guides call the Banana Ridge to the shoulder below the summit pyramid; from there a rising traverse right under the pyramid to a saddle on the east ridge, and up the ridge to the top. The 1956 Austrians, storm-bound low on the mountain, made a single push from 7,150 m; today it is the most climbed route in the Karakoram.',
    waypoints: [
      [35.7450, 76.5800], // Base Camp
      [35.7400, 76.6400],
      [35.7306, 76.6581], // C1
      [35.7360, 76.6585],
      [35.7390, 76.6587],
      [35.7418, 76.6588], // C2
      [35.7465, 76.6585], // C3
      [35.7505, 76.6575], // C4
      [35.7530, 76.6590], // diagonal traverse under the pyramid
      [35.7555, 76.6605], // saddle on the east ridge
      [35.7577, 76.6550], // east ridge
      [35.7583, 76.6533], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 5050, lat: 35.7450, lon: 76.5800, blurb: 'On the Abruzzi Glacier, shared with Gasherbrum I expeditions; a week up the Baltoro from Askole.' },
      { name: 'Camp 1', alt: 5900, lat: 35.7306, lon: 76.6581, blurb: 'Above the icefall, where the Gasherbrum I and II routes divide.' },
      { name: 'Camp 2', alt: 6500, lat: 35.7418, lon: 76.6588, blurb: 'On the crest of the Banana Ridge.' },
      { name: 'Camp 3', alt: 6950, lat: 35.7465, lon: 76.6585, blurb: 'Below the shoulder, the last camp for most teams.' },
      { name: 'Camp 4', alt: 7350, lat: 35.7505, lon: 76.6575, blurb: 'On the shoulder below the summit pyramid, used by slower teams; summit day from here is six to eight hours, starting with the traverse under the pyramid.' },
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
    difficulty: 'From the Gasherbrum La up a spur to the east ridge, then the long crest over the east summit to the main top',
    verticalGain: '≈ 1,550 m from the Gasherbrum La',
    summary:
      'The first of the Polish pair’s two new routes in a fortnight: from a camp on the Gasherbrum La up a spur to the ridge, over the 7,772 m east summit and along the crest to the top, then down the normal route. A week later they climbed the south-west face of Hidden Peak.',
    waypoints: [
      [35.7306, 76.6581], // C1
      [35.7340, 76.6640],
      [35.7370, 76.6695],
      [35.7400, 76.6750], // basin
      [35.7420, 76.6810],
      [35.7440, 76.6870],
      [35.7460, 76.6930], // Gasherbrum La camp
      [35.7500, 76.6890],
      [35.7540, 76.6848], // spur to the east ridge
      [35.7546, 76.6800],
      [35.7549, 76.6750], // bivouac on the ridge
      [35.7543, 76.6690], // Gasherbrum II East
      [35.7548, 76.6650],
      [35.7553, 76.6610],
      [35.7567, 76.6570],
      [35.7577, 76.6550],
      [35.7583, 76.6533], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5900, lat: 35.7306, lon: 76.6581, blurb: 'The shared camp above the icefall.' },
      { name: 'La camp', alt: 6500, lat: 35.7460, lon: 76.6930, blurb: 'On the Gasherbrum La, the col between the two mountains, at the foot of the long east ridge.' },
      { name: 'East ridge', alt: 7300, lat: 35.7549, lon: 76.6750, blurb: 'The bivouac on the ridge below Gasherbrum II East.' },
      { name: 'Gasherbrum II East', alt: 7772, lat: 35.7543, lon: 76.6690, blurb: 'The east summit, crossed on the way to the main top.' },
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
    difficulty: 'Two summits and a 1,400 m descent between them, carried in one push with a single tent',
    verticalGain: '≈ 2,900 m of ascent above Camp 3',
    summary:
      'The first traverse of two 8,000 m peaks: up the normal route on Gasherbrum II, down the south side of its east ridge to the Gasherbrum La, then straight up the north face of Hidden Peak and down its south-west ridge, without touching base camp between the two summits.',
    waypoints: [
      [35.7465, 76.6585], // C3
      [35.7505, 76.6575], // C4
      [35.7530, 76.6590],
      [35.7555, 76.6605], // saddle on the east ridge
      [35.7577, 76.6550],
      [35.7583, 76.6533], // Gasherbrum II summit
      [35.7567, 76.6570],
      [35.7553, 76.6610],
      [35.7548, 76.6650],
      [35.7543, 76.6690], // Gasherbrum II East
      [35.7549, 76.6750],
      [35.7540, 76.6848],
      [35.7500, 76.6890],
      [35.7460, 76.6930], // Gasherbrum La
      [35.7440, 76.6870],
      [35.7420, 76.6810],
      [35.7400, 76.6750], // basin
      [35.7353, 76.6814],
      [35.7321, 76.6857], // couloir
      [35.7305, 76.6878],
      [35.7274, 76.6921],
      [35.7242, 76.6964], // Gasherbrum I summit
    ],
    camps: [
      { name: 'Gasherbrum II summit', alt: 8035, lat: 35.7583, lon: 76.6533, blurb: 'The first summit, reached on the second day from base camp.' },
      { name: 'Gasherbrum La', alt: 6600, lat: 35.7460, lon: 76.6930, blurb: 'The col between the two mountains, where the pair bivouacked between summits.' },
      { name: 'Couloir top', alt: 7100, lat: 35.7305, lon: 76.6878, blurb: 'The last bivouac, on Hidden Peak’s north-west ridge.' },
    ],
    hazards: ['la-basin', 'summit-pyramid', 'death-zone'],
    finish: { title: 'Gasherbrum I', alt: 8080, body: 'The second summit of the traverse, reached on the fifth day. From here the pair descended the south-west ridge, bivouacking at 7,500 m and at the foot of the ridge, and reached the shared base camp on 30 June.' },
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
      [35.7360, 76.6585],
      [35.7390, 76.6587],
      [35.7418, 76.6588], // C2
      [35.7465, 76.6585], // C3
      [35.7505, 76.6575],
      [35.7530, 76.6590],
      [35.7555, 76.6605], // saddle on the east ridge
      [35.7577, 76.6550],
      [35.7583, 76.6533], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5900, lat: 35.7306, lon: 76.6581, blurb: 'The first night, in the icefall wind.' },
      { name: 'Camp 2', alt: 6500, lat: 35.7418, lon: 76.6588, blurb: 'Dug into the ridge.' },
      { name: 'Camp 3', alt: 6900, lat: 35.7465, lon: 76.6585, blurb: 'The last camp; the summit push of 2 February left here at 3 am.' },
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
    id: 'banana-ridge', name: 'Banana Ridge', lat: 35.7418, lon: 76.6588, alt: 6500, radius: 300, severity: 3,
    kind: 'Crevasses · exposure',
    blurb: 'The curving snow crest between Camps 1 and 2, corniced on its eastern side.',
    incidents: [],
  },
  {
    id: 'upper-slopes', name: 'Upper slopes', lat: 35.7485, lon: 76.6580, alt: 7150, radius: 300, severity: 4,
    kind: 'Windslab · avalanche',
    blurb: 'The snow slopes between Camp 3 and the shoulder, which load with windslab and have avalanched onto descending parties.',
    incidents: ['2 Feb 2011, the winter team is swept by an avalanche on the descent and survives'],
  },
  {
    id: 'summit-pyramid', name: 'Summit pyramid', lat: 35.7565, lon: 76.6580, alt: 7750, radius: 250, severity: 4,
    kind: 'Rockfall · queues · late descents',
    blurb: 'The traverse under the pyramid and the east ridge, where parties bunch up on the fixed lines and descend in the afternoon.',
    incidents: [],
  },
  {
    id: 'la-basin', name: 'Gasherbrum La basin', lat: 35.7450, lon: 76.6800, alt: 6450, radius: 350, severity: 4,
    kind: 'Serac · storm',
    blurb: 'The high basin between the two Gasherbrums, threatened by seracs from both and a trap in storm.',
    incidents: [],
  },
  {
    id: 'east-ridge', name: 'East ridge', lat: 35.7553, lon: 76.6610, alt: 7600, radius: 320, severity: 4,
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
