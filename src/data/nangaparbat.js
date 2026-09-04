// Nanga Parbat routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 35.2375, lon: 74.5892, elevation: 8126, name: 'Nanga Parbat', aka: 'Nanga Parbat · Diamir · the Naked Mountain',
  range: 'Himalaya, western anchor', countries: 'Pakistan',
  tagline: 'The ninth highest mountain on Earth, and the one that earned the name Killer Mountain before anyone had climbed it: thirty-one dead before the first ascent.',
  summitText: 'A snow crest at the end of the Bazhin Gap, with the Rupal Face falling 4,600 m on one side and the Diamir on the other. Hermann Buhl stood here alone in 1953 after seventeen hours without oxygen, and spent the night standing on a ledge on the way down.',
  summitBlurb: 'Ninth highest point on Earth and the western anchor of the Himalaya, rising 7,000 m above the Indus. About 450 ascents and 85 deaths; the Rupal Face is the highest mountain wall in the world.',
  figuresLead: 'A mountain that killed thirty-one people before it was climbed, and whose first ascent was made alone.',
  otherLines: 'Lines climbed but not modelled here: Messner’s 1978 solo on the Diamir Face, the 1985 Polish south-east pillar, the 2005 Anderson–House central pillar on the Rupal Face, and the north-west face from the Diamir side.',
  historyTitle: 'A hundred and thirty years',
  historyLead: 'From Mummery’s disappearance to the winter ascent of 2016.',
}

const routes = [
  {
    id: 'kinshofer',
    name: 'Kinshofer Route',
    aka: 'Diamir Face · the normal route',
    color: '#ff6a3d',
    firstAscent: '22 June 1962, Toni Kinshofer, Siegfried Löw & Anderl Mannhardt (German expedition led by Karl Herrligkoffer); Löw died on the descent',
    share: '≈ 90% of all ascents',
    difficulty: 'The Kinshofer Wall, a 400 m rock and ice band at 5,500-6,000 m, then long snow slopes and the traverse of the Bazhin Basin at 7,500 m',
    verticalGain: '≈ 3,900 m from Base Camp',
    summary:
      'Up the Diamir side from a base camp in a meadow at 4,200 m: an icefall, the Kinshofer Wall with its fixed ropes and ladder, the slopes to Camp 4, then a long traverse across the Bazhin Basin below the summit. Every commercial ascent, and the 2016 winter ascent, follows it.',
    waypoints: [
      [35.2590, 74.5120], // Base Camp
      [35.2585, 74.5210],
      [35.2581, 74.5298],
      [35.2547, 74.5397],
      [35.2520, 74.5470], // C1
      [35.2495, 74.5546], // Kinshofer Wall
      [35.2478, 74.5595],
      [35.2461, 74.5645], // C2
      [35.2435, 74.5720], // C3
      [35.2409, 74.5793], // C4
      [35.2400, 74.5850], // Bazhin Basin
      [35.2392, 74.5870],
      [35.2375, 74.5892], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 4200, lat: 35.2590, lon: 74.5120, blurb: 'In a meadow on the floor of the Diamir valley, two days from the Karakoram Highway. Attacked by gunmen in June 2013; eleven climbers and staff were killed.' },
      { name: 'Camp 1', alt: 4900, lat: 35.2520, lon: 74.5470, blurb: 'Above the icefall, below the wall.' },
      { name: 'Camp 2', alt: 6100, lat: 35.2461, lon: 74.5645, blurb: 'On the shelf above the Kinshofer Wall.' },
      { name: 'Camp 3', alt: 6650, lat: 35.2435, lon: 74.5720, blurb: 'Snow slopes below the upper seracs.' },
      { name: 'Camp 4', alt: 7250, lat: 35.2409, lon: 74.5793, blurb: 'At the edge of the Bazhin Basin. Summit day crosses the basin and climbs the final 800 m: twelve to eighteen hours.' },
    ],
    hazards: ['diamir-icefall', 'kinshofer-wall', 'bazhin-basin', 'summit-slopes', 'death-zone'],
  },
  {
    id: 'rakhiot',
    name: 'Rakhiot Face',
    aka: 'Buhl’s route · the 1953 first ascent',
    color: '#ffc14d',
    firstAscent: '3 July 1953, Hermann Buhl (Austria), alone from Camp 5, without oxygen, on Karl Herrligkoffer’s German-Austrian expedition',
    share: 'Historic; a handful of repeats',
    difficulty: 'A long glacier and ridge line over Rakhiot Peak, the Moor’s Head and the Silver Saddle, then the Silver Plateau and the Bazhin Gap',
    verticalGain: '≈ 4,200 m from Base Camp',
    summary:
      'The line of the German expeditions of the 1930s, which lost sixteen climbers and Sherpas to storm and avalanche in 1934 and 1937. In 1953 Buhl left Camp 5 alone at 2:30 am and reached the summit at 7 pm; he survived a standing bivouac at 8,000 m and returned after forty-one hours.',
    waypoints: [
      [35.3250, 74.6150], // Base Camp
      [35.3185, 74.6155],
      [35.3120, 74.6160],
      [35.3055, 74.6170],
      [35.2987, 74.6180], // C1
      [35.2925, 74.6225],
      [35.2863, 74.6271], // C2
      [35.2800, 74.6267], // C3
      [35.2740, 74.6262],
      [35.2675, 74.6258], // C4
      [35.2648, 74.6290],
      [35.2620, 74.6320], // ridge west of Rakhiot Peak
      [35.2600, 74.6240], // C5, Moor's Head
      [35.2605, 74.6195],
      [35.2610, 74.6150],
      [35.2598, 74.6088],
      [35.2585, 74.6025], // Silver Saddle
      [35.2550, 74.6020], // Silver Plateau
      [35.2525, 74.5985],
      [35.2500, 74.5950], // Bazhin Gap
      [35.2440, 74.5920],
      [35.2408, 74.5906],
      [35.2375, 74.5892], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 3970, lat: 35.3250, lon: 74.6150, blurb: 'On the Rakhiot Glacier below Fairy Meadows, where the 1930s expeditions camped and where their memorial stands.' },
      { name: 'Camp 1', alt: 4600, lat: 35.2987, lon: 74.6180, blurb: 'On the Rakhiot Glacier.' },
      { name: 'Camp 2', alt: 5300, lat: 35.2863, lon: 74.6271, blurb: 'Below the Rakhiot icefall.' },
      { name: 'Camp 3', alt: 5700, lat: 35.2800, lon: 74.6267, blurb: 'The upper glacier basin, in the fall line of Rakhiot Peak.' },
      { name: 'Camp 4', alt: 6150, lat: 35.2675, lon: 74.6258, blurb: 'Below Rakhiot Peak, where the 1934 retreat began; Willy Merkl and Gaylay died above here.' },
      { name: 'Camp 5', alt: 6900, lat: 35.2600, lon: 74.6240, blurb: 'The Moor’s Head, the rock bump on the ridge west of Rakhiot Peak and Buhl’s last camp. He set out from here alone with a rucksack, no rope and two Pervitin tablets.' },
    ],
    hazards: ['rakhiot-peak', 'silver-saddle', 'summit-slopes', 'death-zone'],
  },
  {
    id: 'rupal',
    name: 'Rupal Face',
    aka: 'The Messner route, 1970 · the highest wall on Earth',
    color: '#c77dff',
    firstAscent: '27 June 1970, Reinhold & Günther Messner (Tyrol), on Karl Herrligkoffer’s expedition; Günther died on the Diamir side during the traverse down',
    share: 'A handful of ascents',
    difficulty: 'Four thousand six hundred metres of face: ice fields, the Merkl Icefield and the Merkl Gully, a rock chimney at 7,800 m',
    verticalGain: '≈ 4,500 m from Base Camp',
    summary:
      'The biggest mountain wall in the world, rising 4,600 m from the Rupal valley. The Messner brothers climbed the Merkl Gully to the summit in 1970 and, unable to descend it, went down the unknown Diamir side; Günther was lost in an avalanche near the bottom, and the argument over what happened lasted thirty-five years until his body was found in 2005.',
    waypoints: [
      [35.1900, 74.6000], // Base Camp
      [35.1968, 74.5985],
      [35.2036, 74.5969], // C1
      [35.2104, 74.5954],
      [35.2137, 74.5946], // C2
      [35.2171, 74.5938],
      [35.2205, 74.5931], // C3
      [35.2239, 74.5923],
      [35.2273, 74.5915], // C4
      [35.2307, 74.5907], // C5
      [35.2341, 74.5900], // Merkl Gully
      [35.2375, 74.5892], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 3600, lat: 35.1900, lon: 74.6000, blurb: 'In the Rupal valley at Latobo, looking straight up the whole face.' },
      { name: 'Camp 1', alt: 4350, lat: 35.2036, lon: 74.5969, blurb: 'At the foot of the face.' },
      { name: 'Camp 2', alt: 4850, lat: 35.2137, lon: 74.5946, blurb: 'On the lower ice field.' },
      { name: 'Camp 3', alt: 5750, lat: 35.2205, lon: 74.5931, blurb: 'Below the Wieland rocks.' },
      { name: 'Camp 4', alt: 6700, lat: 35.2273, lon: 74.5915, blurb: 'On the Merkl Icefield.' },
      { name: 'Camp 5', alt: 7200, lat: 35.2307, lon: 74.5907, blurb: 'At the foot of the Merkl Gully, the 1970 top camp. The brothers left it before dawn on 27 June.' },
    ],
    hazards: ['rupal-face', 'merkl-gully', 'summit-slopes', 'death-zone'],
  },
  {
    id: 'schell',
    name: 'Schell Route',
    aka: 'Southwest ridge from the Rupal side, 1976',
    color: '#5fd3ff',
    firstAscent: '11 August 1976, Hanns Schell, Robert Schauer, Siegfried Gimpel & Hilmar Sturm (Austria)',
    share: 'Occasional; the second route from the Rupal side',
    difficulty: 'A long glacier and ridge to the Mazeno Gap, then the south-west ridge and the upper Diamir slopes',
    verticalGain: '≈ 3,400 m from the Rupal glacier',
    summary:
      'A four-man Austrian expedition found a way around the Rupal Face by its western edge: up to the gap at the end of the Mazeno ridge, then the south-west ridge to the summit. Less objectively dangerous than the wall, and used by several small teams since.',
    waypoints: [
      [35.1950, 74.5300], // glacier
      [35.2050, 74.5367], // C1
      [35.2150, 74.5433], // C2
      [35.2175, 74.5495],
      [35.2200, 74.5555],
      [35.2222, 74.5615],
      [35.2240, 74.5670], // C3
      [35.2275, 74.5680], // Mazeno Gap
      [35.2275, 74.5740], // C4
      [35.2290, 74.5780],
      [35.2305, 74.5790],
      [35.2344, 74.5794], // C5
      [35.2359, 74.5843],
      [35.2375, 74.5892], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5150, lat: 35.2050, lon: 74.5367, blurb: 'On the glacier at the west end of the Rupal valley.' },
      { name: 'Camp 2', alt: 5800, lat: 35.2150, lon: 74.5433, blurb: 'Below the slopes that lead up to the Mazeno Gap.' },
      { name: 'Camp 3', alt: 6500, lat: 35.2240, lon: 74.5670, blurb: 'On the Rupal-side slopes just under the gap.' },
      { name: 'Camp 4', alt: 7000, lat: 35.2275, lon: 74.5740, blurb: 'On the south-west ridge just east of the Mazeno Gap.' },
      { name: 'Camp 5', alt: 7450, lat: 35.2344, lon: 74.5794, blurb: 'The highest camp, on the upper ridge below the summit slopes.' },
    ],
    hazards: ['mazeno-gap', 'summit-slopes', 'death-zone'],
  },
  {
    id: 'mazeno',
    name: 'Mazeno Ridge',
    aka: 'The longest ridge on any 8,000 m peak, 2012',
    color: '#7dffb3',
    firstAscent: '15 July 2012, Sandy Allan & Rick Allen (UK), after eighteen days on the ridge, with Cathy O’Dowd and three Sherpas turning back at the Mazeno Gap',
    share: 'Once',
    difficulty: 'Ten kilometres of corniced crest over eight summits above 6,800 m, then the Schell route to the top',
    verticalGain: '≈ 2,750 m from the Mazeno Pass',
    summary:
      'The great ridge that runs west from the summit for ten kilometres: attempted many times since the 1970s, traversed in full only in 2012 by two Scots in their fifties, who spent eighteen days above 6,000 m and descended the Diamir side with no food left.',
    waypoints: [
      [35.2138, 74.4842], // Mazeno Pass
      [35.2159, 74.4877],
      [35.2178, 74.4970],
      [35.2198, 74.5061], // bivouac
      [35.2218, 74.5153],
      [35.2237, 74.5246],
      [35.2246, 74.5343],
      [35.2255, 74.5440], // bivouac, Mazeno Peak
      [35.2262, 74.5500],
      [35.2270, 74.5560],
      [35.2273, 74.5620],
      [35.2275, 74.5680], // Mazeno Gap
      [35.2275, 74.5740],
      [35.2290, 74.5780], // joins the Schell route
    ],
    camps: [
      { name: 'Mazeno Pass', alt: 5360, lat: 35.2138, lon: 74.4842, blurb: 'The pass at the western end of the ridge, reached from the Rupal valley.' },
      { name: 'Bivouac 1', alt: 6300, lat: 35.2198, lon: 74.5061, blurb: 'One of a string of bivouacs along the crest over the Mazeno peaks.' },
      { name: 'Bivouac 2', alt: 6900, lat: 35.2255, lon: 74.5440, blurb: 'By Mazeno Peak, the highest point of the ridge before the gap.' },
      { name: 'Mazeno Gap', alt: 6940, lat: 35.2275, lon: 74.5680, blurb: 'The col where the ridge meets the mountain proper; the 2012 team split here, two continuing to the summit.' },
    ],
    hazards: ['mazeno-crest', 'mazeno-gap', 'death-zone'],
    joins: 'schell',
  },
]

const hazards = [
  {
    id: 'diamir-icefall', name: 'Diamir icefall', lat: 35.2547, lon: 74.5397, alt: 4600, radius: 400, severity: 4,
    kind: 'Serac · avalanche',
    blurb: 'The lower Diamir Glacier, swept by ice fall from the hanging glaciers of the face; the ground where Günther Messner died in 1970.',
    incidents: ['1970, Günther Messner killed by an avalanche near the foot of the face', '22 Jun 2013, gunmen attack Base Camp and kill eleven'],
  },
  {
    id: 'kinshofer-wall', name: 'Kinshofer Wall', lat: 35.2495, lon: 74.5546, alt: 5750, radius: 260, severity: 4,
    kind: 'Technical rock and ice · rockfall',
    blurb: 'A 400 m band of rock and ice between Camps 1 and 2, fixed with rope and a ladder each season, and shedding stones once the sun reaches it.',
    incidents: [],
  },
  {
    id: 'bazhin-basin', name: 'Bazhin Basin', lat: 35.2400, lon: 74.5850, alt: 7500, radius: 320, severity: 4,
    kind: 'Length · exposure · late descents',
    blurb: 'A long rising traverse at 7,500 m across a snow basin below the summit; slow, exposed and the reason summit days run past dark.',
    incidents: ['2013 and 2017, climbers die of exhaustion returning across the basin'],
  },
  {
    id: 'summit-slopes', name: 'Summit slopes', lat: 35.2385, lon: 74.5900, alt: 7950, radius: 260, severity: 4,
    kind: 'Cornice · whiteout',
    blurb: 'The final slopes above the Bazhin Gap, corniced over the Rupal Face.',
    incidents: ['1953, Buhl bivouacs standing on a ledge at 8,000 m on the descent'],
  },
  {
    id: 'rakhiot-peak', name: 'Rakhiot Peak slopes', lat: 35.2675, lon: 74.6258, alt: 6200, radius: 400, severity: 5,
    kind: 'Avalanche · storm',
    blurb: 'The slopes where the 1937 camp was buried and the 1934 retreat disintegrated in a storm.',
    incidents: ['1934, Willy Merkl, Uli Wieland, Willo Welzenbach and six Sherpas die in a week-long storm above Camp 4', '15 Jun 1937, an avalanche buries Camp 4; sixteen die in their sleep'],
  },
  {
    id: 'silver-saddle', name: 'Silver Saddle and Plateau', lat: 35.2585, lon: 74.6025, alt: 7450, radius: 360, severity: 4,
    kind: 'Wind · distance',
    blurb: 'A high, windswept plateau between the saddle and the Bazhin Gap, kilometres long and nowhere to shelter; Buhl crossed it alone in 1953.',
    incidents: [],
  },
  {
    id: 'rupal-face', name: 'Rupal Face', lat: 35.2205, lon: 74.5931, alt: 5750, radius: 450, severity: 5,
    kind: 'Avalanche · serac · 4,600 m of wall',
    blurb: 'The highest mountain face on Earth, swept by avalanches from the ice fields above.',
    incidents: [],
  },
  {
    id: 'merkl-gully', name: 'Merkl Gully', lat: 35.2341, lon: 74.5900, alt: 7700, radius: 220, severity: 5,
    kind: 'Technical rock at 7,800 m · no descent',
    blurb: 'The chimney at the top of the Rupal Face. In 1970 the Messners climbed it without a rope and, unable to reverse it, went down the far side of the mountain.',
    incidents: [],
  },
  {
    id: 'mazeno-gap', name: 'Mazeno Gap', lat: 35.2275, lon: 74.5680, alt: 6940, radius: 300, severity: 4,
    kind: 'Wind · exposure',
    blurb: 'The col at the end of the Mazeno ridge, exposed to the wind from both valleys.',
    incidents: [],
  },
  {
    id: 'mazeno-crest', name: 'Mazeno crest', lat: 35.2237, lon: 74.5246, alt: 6600, radius: 450, severity: 4,
    kind: 'Cornice · length · commitment',
    blurb: 'Ten kilometres of corniced ridge with no descent on either side; teams have spent more than two weeks on it.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 35.2375, lon: 74.5892, alt: 8000, radius: 800, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Only the summit slopes lie above 8,000 m, but they are reached late in the day after the longest summit approaches of any normal route.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1895, title: 'Mummery', text: 'Albert Mummery, the finest climber of his day, attempts the Diamir Face and vanishes with two Gurkhas while crossing to the Rakhiot side: the first deaths on any 8,000 m peak.' },
  { year: 1934, title: 'The storm', text: 'A German expedition is caught by a storm above the Silver Saddle. Willy Merkl, Uli Wieland, Willo Welzenbach and six Sherpas die in the retreat; the Sherpa Gaylay stays with Merkl to the end.' },
  { year: 1937, title: 'Buried', text: 'An avalanche buries Camp 4 at night on 15 June; seven Germans and nine Sherpas die. The mountain becomes a German national obsession.' },
  { year: 1953, title: 'Buhl', text: 'Hermann Buhl reaches the summit alone on 3 July, without oxygen, after seventeen hours from Camp 5. He spends the night standing on a ledge and returns after forty-one hours, frostbitten and hallucinating.' },
  { year: 1962, title: 'Diamir Face', text: 'Toni Kinshofer, Siegfried Löw and Anderl Mannhardt climb the Diamir Face; Löw dies in a fall on the descent.' },
  { year: 1970, title: 'The Rupal Face', text: 'Reinhold and Günther Messner climb the highest wall in the world and descend the far side. Günther is killed by an avalanche near the bottom; Reinhold, with frostbitten feet, is found by villagers days later.' },
  { year: 1976, title: 'Schell route', text: 'Four Austrians climb a new route around the Rupal Face by the Mazeno Gap and the south-west ridge.' },
  { year: 1978, title: 'Alone', text: 'Reinhold Messner climbs a new line on the Diamir Face solo, the first solo ascent of an 8,000 m peak from base camp.' },
  { year: 2005, title: 'Central pillar, and a body', text: 'Vince Anderson and Steve House climb the central pillar of the Rupal Face in alpine style. On the Diamir side, melting ice releases Günther Messner’s remains.' },
  { year: 2012, title: 'Mazeno Ridge', text: 'Sandy Allan and Rick Allen complete the ten-kilometre Mazeno Ridge after eighteen days, the longest ridge climb on any 8,000 m peak.' },
  { year: 2013, title: 'The attack', text: 'On 22 June gunmen enter the Diamir Base Camp at night and murder ten climbers and a local cook.' },
  { year: 2016, title: 'Winter', text: 'Simone Moro, Ali Sadpara and Alex Txikon make the first winter ascent on 26 February, after more than thirty attempts over three decades.' },
  { year: 2018, title: 'Revol and Mackiewicz', text: 'Élisabeth Revol and Tomasz Mackiewicz reach the summit in winter; Mackiewicz, blind and frostbitten, is left at 7,200 m and dies. Revol is rescued by Adam Bielecki and Denis Urubko, helicoptered from K2.' },
]

const stats = [
  { label: 'Height', value: '8,126 m', note: '9th highest on Earth' },
  { label: 'First ascent', value: '1953', note: 'Hermann Buhl, alone' },
  { label: 'Summits', value: '≈ 450', note: 'nearly all by the Kinshofer route' },
  { label: 'Deaths', value: '≈ 85', note: 'thirty-one before the first ascent' },
  { label: 'Rupal Face', value: '4,600 m', note: 'the highest wall on Earth' },
  { label: 'Winter ascent', value: '2016', note: 'Moro, Sadpara & Txikon' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'nangaparbat', peak, routes, hazards, timeline, stats, sources }
