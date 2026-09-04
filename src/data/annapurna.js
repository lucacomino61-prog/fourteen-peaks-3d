// Annapurna I routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 28.5961, lon: 83.8203, elevation: 8091, name: 'Annapurna', aka: 'Annapurna I · the first eight-thousander climbed',
  range: 'Himalaya, Annapurna Massif', countries: 'Nepal',
  tagline: 'The first 8,000 m peak ever climbed, and for seventy years the one most likely to kill you.',
  summitText: 'A long corniced ridge with three 8,000 m tops. Herzog lost his gloves here in 1950 and his hands to frostbite on the way down; most of the mountain’s dead were killed by avalanches on the descent below.',
  summitBlurb: 'Tenth highest mountain on Earth and the first 8,000 m peak climbed, in 1950. Roughly 400 ascents and 75 deaths: the worst ratio of any of the fourteen.',
  figuresLead: 'Fewer people have climbed Annapurna in seventy-five years than summit Everest in a single week of May.',
  otherLines: 'Lines climbed but not modelled here: the Polish South Pillar (1981), the Japanese and Spanish south face routes, and the 1992 Béghin–Lafaille direct on the south face, soloed by Ueli Steck in 2013.',
  historyTitle: 'Seventy-five years',
  historyLead: 'From the first eight-thousander to the deadliest ratio in the Himalaya.',
}

const routes = [
  {
    id: 'french',
    name: 'North Face',
    aka: 'French route · Sickle Glacier · the 1950 line',
    color: '#ff6a3d',
    firstAscent: '3 June 1950, Maurice Herzog & Louis Lachenal (France), the first ascent of any 8,000 m peak',
    share: 'The classic line; most ascents use its upper half',
    difficulty: 'Glaciated face at 35-50°, all of it beneath the Sickle serac; technically moderate, objectively lethal',
    verticalGain: '≈ 3,900 m from Base Camp',
    summary:
      'Herzog’s team found the mountain in 1950 with no map worth the name, and climbed the north face in a fortnight, racing the monsoon. The line runs up the gully west of the Dutch Rib and under the Sickle, a hanging glacier the width of the face, then the summit slopes. Herzog and Lachenal lost fingers and toes; the book sold eleven million copies.',
    waypoints: [
      [28.6400, 83.8100], // Base Camp
      [28.6373, 83.8153],
      [28.6318, 83.8160], // C1
      [28.6260, 83.8145],
      [28.6200, 83.8125], // C2
      [28.6155, 83.8135],
      [28.6100, 83.8113],
      [28.6060, 83.8140], // C3
      [28.6030, 83.8170], // C4, below the Sickle
      [28.6030, 83.8195], // C5
      [28.5988, 83.8200],
      [28.5961, 83.8203], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 4200, lat: 28.6400, lon: 83.8100, blurb: 'A moraine terrace above the Miristi Khola gorge, reached by a week’s walk through a valley that in 1950 nobody had mapped.' },
      { name: 'Camp 1', alt: 5100, lat: 28.6318, lon: 83.8160, blurb: 'On the glacier below the face. Everything above here is in the fall line of the Sickle.' },
      { name: 'Camp 2', alt: 5900, lat: 28.6200, lon: 83.8125, blurb: 'In the gully west of the rib, where the face steepens. Most teams cross the slopes above before dawn, when the ice is frozen.' },
      { name: 'Camp 3', alt: 6600, lat: 28.6060, lon: 83.8140, blurb: 'A snow shelf beneath the serac barrier; the Sickle hangs directly overhead.' },
      { name: 'Camp 4', alt: 7150, lat: 28.6030, lon: 83.8170, blurb: 'Below the Sickle, at the top of the gully. The 1950 summit party left from here, in canvas boots.' },
      { name: 'Camp 5', alt: 7400, lat: 28.6030, lon: 83.8195, blurb: 'A tent dug into the summit slopes. Herzog and Lachenal set out from here on 3 June 1950.' },
    ],
    hazards: ['sickle', 'north-face-avalanche', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'dutch',
    name: 'Dutch Rib',
    aka: 'North Face · the modern normal route',
    color: '#ffc14d',
    firstAscent: '13 October 1977, van Rijswick & Sonam Sherpa (Dutch expedition), seeking a line out of the Sickle’s fall line',
    share: 'Used by most commercial teams since the 2010s',
    difficulty: 'A rock and ice rib at 45-55° to about 7,000 m, then the French route’s upper slopes',
    verticalGain: '≈ 3,900 m from Base Camp',
    summary:
      'A prominent rib to the left (east) of the Sickle gully that keeps climbers out from under the worst of the serac until they rejoin the 1950 line below the summit slopes. Safer, but steeper and still exposed to the slopes above; the 1978 American women’s expedition lost two climbers here.',
    waypoints: [
      [28.6400, 83.8100], // Base Camp
      [28.6373, 83.8153],
      [28.6318, 83.8160], // C1
      [28.6250, 83.8168], // C2
      [28.6181, 83.8177],
      [28.6126, 83.8183], // C3
      [28.6098, 83.8186], // C4
      [28.6071, 83.8190], // C5
      [28.6030, 83.8195], // joins the French route at C5
    ],
    camps: [
      { name: 'Camp 2', alt: 5790, lat: 28.6250, lon: 83.8168, blurb: 'At the foot of the rib, east of the main avalanche funnel.' },
      { name: 'Camp 3', alt: 6500, lat: 28.6126, lon: 83.8183, blurb: 'On the crest of the rib, the hardest climbing of the route below it.' },
      { name: 'Camp 4', alt: 6850, lat: 28.6098, lon: 83.8186, blurb: 'High on the rib. Vera Watson and Alison Chadwick-Onyszkiewicz fell from near here in October 1978.' },
      { name: 'Camp 5', alt: 7350, lat: 28.6071, lon: 83.8190, blurb: 'Where the rib meets the Sickle Glacier and the slope eases.' },
    ],
    hazards: ['north-face-avalanche', 'sickle', 'death-zone'],
    joins: 'french',
  },
  {
    id: 'southface',
    name: 'South Face',
    aka: 'Bonington route · the 1970 British line',
    color: '#c77dff',
    firstAscent: '27 May 1970, Don Whillans & Dougal Haston (British expedition led by Chris Bonington)',
    share: 'A handful of ascents; among the hardest walls in the Himalaya',
    difficulty: 'Three kilometres of ice ridges, serac bands and a rock band at 7,000 m; the beginning of Himalayan big-wall climbing',
    verticalGain: '≈ 3,900 m from the Sanctuary',
    summary:
      'The wall that rises from the Annapurna Sanctuary is one of the biggest in the world. Bonington’s 1970 siege, up the ice ridge and through the rock band, was the first time such a face had been attempted on an 8,000 m peak; Ian Clough was killed by a falling serac on the way down.',
    waypoints: [
      [28.5306, 83.8781], // Sanctuary Base Camp
      [28.5493, 83.8616],
      [28.5587, 83.8533],
      [28.5680, 83.8451], // C1
      [28.5774, 83.8368], // C2
      [28.5829, 83.8288], // C3
      [28.5862, 83.8267], // C4
      [28.5880, 83.8255], // C5
      [28.5910, 83.8235], // C6
      [28.5935, 83.8220],
      [28.5961, 83.8203], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 4130, lat: 28.5306, lon: 83.8781, blurb: 'The Annapurna Sanctuary, a glacial amphitheatre ringed by ten peaks over 6,000 m and reached by trekkers in a few days from Pokhara.' },
      { name: 'Camp 1', alt: 4900, lat: 28.5680, lon: 83.8451, blurb: 'At the foot of the face on the South Annapurna Glacier.' },
      { name: 'Camp 2', alt: 5350, lat: 28.5774, lon: 83.8368, blurb: 'Below the ice ridge, in the path of serac fall from the whole face.' },
      { name: 'Camp 3', alt: 6050, lat: 28.5829, lon: 83.8288, blurb: 'On the ice ridge, a knife-edge of rotten snow that took the 1970 team weeks to fix.' },
      { name: 'Camp 4', alt: 6500, lat: 28.5862, lon: 83.8267, blurb: 'Above the ice ridge, below the rock band.' },
      { name: 'Camp 5', alt: 6800, lat: 28.5880, lon: 83.8255, blurb: 'At the foot of the rock band, the crux of the face.' },
      { name: 'Camp 6', alt: 7350, lat: 28.5910, lon: 83.8235, blurb: 'A single tent above the rock band, from which Whillans and Haston reached the summit in a storm.' },
    ],
    hazards: ['south-face', 'south-rock-band', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'nwface',
    name: 'Northwest Face',
    aka: 'Messner–Kammerlander route, 1985',
    color: '#7dffb3',
    firstAscent: '24 April 1985, Reinhold Messner & Hans Kammerlander (Italy), alpine style',
    share: 'Rarely repeated',
    difficulty: 'A 2,500 m ice and mixed face at 50-60°, climbed in a single push',
    verticalGain: '≈ 3,300 m from the glacier',
    summary:
      'Messner’s eleventh 8,000 m peak, climbed with Kammerlander in a few days up the steep north-west face that faces the Nilgiri peaks, with no fixed ropes and no camps stocked in advance.',
    waypoints: [
      [28.6150, 83.7750], // Glacier camp
      [28.6103, 83.7863],
      [28.6056, 83.7977], // C1
      [28.6024, 83.8052], // C2
      [28.5992, 83.8128], // C3
      [28.5977, 83.8165],
      [28.5961, 83.8203], // Summit
    ],
    camps: [
      { name: 'Glacier camp', alt: 4750, lat: 28.6150, lon: 83.7750, blurb: 'On the glacier below the north-west face, a day west of the 1950 base camp.' },
      { name: 'Camp 1', alt: 5800, lat: 28.6056, lon: 83.7977, blurb: 'A bivouac at the foot of the steep face.' },
      { name: 'Camp 2', alt: 6450, lat: 28.6024, lon: 83.8052, blurb: 'A snow ledge under the serac band, cut with an ice axe.' },
      { name: 'Camp 3', alt: 6900, lat: 28.5992, lon: 83.8128, blurb: 'The last bivouac before the summit slopes.' },
    ],
    hazards: ['nw-face-serac', 'summit-ridge', 'death-zone'],
  },
  {
    id: 'eastridge',
    name: 'East Ridge',
    aka: 'Loretan–Joos traverse, 1984',
    color: '#5fd3ff',
    firstAscent: '24 October 1984, Erhard Loretan & Norbert Joos (Switzerland), traversing over all three summits',
    share: 'A few ascents; repeated by Lafaille and Iñurrategi in 2002',
    difficulty: 'Kilometres of corniced ridge above 7,000 m, crossing Annapurna East and Central before the main summit',
    verticalGain: '≈ 3,800 m from the Sanctuary glacier',
    summary:
      'The long way: from the South Annapurna Glacier up to the col by Tarke Kang (Glacier Dome), then west along the crest over Roc Noir and the East and Central summits, a traverse Loretan and Joos completed in a single alpine push with igloos for shelter, and descended by the north face. Jean-Christophe Lafaille finally reached the summit this way in 2002, ten years after the face that nearly killed him.',
    waypoints: [
      [28.5306, 83.8781], // Sanctuary Base Camp
      [28.5355, 83.8778],
      [28.5404, 83.8776], // glacier base
      [28.5454, 83.8773],
      [28.5503, 83.8770],
      [28.5552, 83.8768],
      [28.5602, 83.8765],
      [28.5651, 83.8763],
      [28.5700, 83.8760],
      [28.5737, 83.8750],
      [28.5773, 83.8740],
      [28.5810, 83.8730],
      [28.5847, 83.8720],
      [28.5883, 83.8710],
      [28.5920, 83.8700], // C1
      [28.5955, 83.8770],
      [28.5990, 83.8840],
      [28.6020, 83.8900], // C2
      [28.6050, 83.8880], // C3
      [28.6070, 83.8870], // Tarke Kang
      [28.6090, 83.8825],
      [28.6110, 83.8780],
      [28.6130, 83.8720],
      [28.6125, 83.8680],
      [28.6120, 83.8640],
      [28.6110, 83.8600],
      [28.6100, 83.8560], // Roc Noir
      [28.6080, 83.8520], // igloo
      [28.6060, 83.8500],
      [28.6050, 83.8460],
      [28.6040, 83.8420],
      [28.6020, 83.8380],
      [28.6005, 83.8350],
      [28.5975, 83.8333], // Annapurna East
      [28.5975, 83.8300], // col bivouac
      [28.5970, 83.8270], // Annapurna Central
      [28.5965, 83.8237],
      [28.5961, 83.8203], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 4300, lat: 28.5404, lon: 83.8776, blurb: 'On the South Annapurna Glacier above the Sanctuary, shared with the south face expeditions.' },
      { name: 'Camp 1', alt: 5700, lat: 28.5920, lon: 83.8700, blurb: 'On the upper glacier under the col between Fluted Peak and Tarke Kang.' },
      { name: 'Camp 2', alt: 6500, lat: 28.6020, lon: 83.8900, blurb: 'On the slopes to the col, approached from the west.' },
      { name: 'Camp 3', alt: 7100, lat: 28.6050, lon: 83.8880, blurb: 'Below the summit of Tarke Kang, the last camp before the ridge.' },
      { name: 'Roc Noir', alt: 7485, lat: 28.6100, lon: 83.8560, blurb: 'Khangsar Kang, the black rock top on the ridge; Loretan and Joos slept in an igloo just beyond it at 7,490 m.' },
      { name: 'Annapurna East', alt: 8026, lat: 28.5975, lon: 83.8333, blurb: 'The first of three 8,000 m tops on the ridge; from here it is hours of cornices to the main summit.' },
      { name: 'Col bivouac', alt: 8020, lat: 28.5975, lon: 83.8300, blurb: 'An igloo on the col between the East and Central summits, the highest night of the traverse.' },
      { name: 'Annapurna Central', alt: 8051, lat: 28.5970, lon: 83.8270, blurb: 'The middle summit, a snow dome on the crest.' },
    ],
    hazards: ['east-ridge', 'summit-ridge', 'death-zone'],
  },
]

const hazards = [
  {
    id: 'sickle', name: 'The Sickle', lat: 28.6045, lon: 83.8130, alt: 6700, radius: 380, severity: 5,
    kind: 'Serac fall · ice avalanche',
    blurb: 'A hanging glacier the width of the north face, named for its curved lip. Every camp from Camp 1 to Camp 3 lies beneath it, and it has produced most of the avalanche deaths on the mountain.',
    incidents: ['1978, Vera Watson and Alison Chadwick-Onyszkiewicz fall to their deaths on the Dutch Rib', '2012 and 2015, avalanches sweep fixed lines between Camps 2 and 3'],
  },
  {
    id: 'north-face-avalanche', name: 'Lower slopes', lat: 28.6235, lon: 83.8170, alt: 5800, radius: 420, severity: 5,
    kind: 'Avalanche',
    blurb: 'A funnel for everything that falls off the face above. Teams cross between Camp 1 and Camp 3 in the coldest hours and never linger.',
    incidents: ['Most of Annapurna’s 70-odd deaths happened on these slopes, on the way down'],
  },
  {
    id: 'summit-ridge', name: 'Summit ridge', lat: 28.5961, lon: 83.8203, alt: 8000, radius: 200, severity: 4,
    kind: 'Whiteout · cornice',
    blurb: 'A long crest with three tops and huge cornices over the south face. In cloud, parties have descended the wrong side; Herzog dropped his gloves here in 1950.',
    incidents: ['3 Jun 1950, Herzog and Lachenal lose fingers and toes on the descent; Herzog both hands'],
  },
  {
    id: 'south-face', name: 'South Face', lat: 28.5829, lon: 83.8288, alt: 6000, radius: 420, severity: 5,
    kind: 'Avalanche · serac',
    blurb: 'Four thousand metres of ice cliffs and rock bands, swept continuously. Béghin, Boukreev, Steck: the face has taken many of the best.',
    incidents: ['25 Dec 1997, Anatoli Boukreev and Dimitri Sobolev killed by an avalanche near 5,700 m', '1992, Pierre Béghin falls when an anchor fails; Jean-Christophe Lafaille descends alone for five days with a broken arm', '1970, Ian Clough killed by a serac below Camp 2'],
  },
  {
    id: 'south-rock-band', name: 'Rock Band', lat: 28.5900, lon: 83.8240, alt: 7100, radius: 200, severity: 4,
    kind: 'Technical rock at 7,000 m',
    blurb: 'The cliff across the top of the 1970 route, climbed by Whillans and Haston through a gully choked with ice.',
    incidents: [],
  },
  {
    id: 'nw-face-serac', name: 'Northwest serac band', lat: 28.6024, lon: 83.8052, alt: 6400, radius: 300, severity: 4,
    kind: 'Serac · avalanche',
    blurb: 'A barrier of ice cliffs across the face, passed on its left in 1985.',
    incidents: [],
  },
  {
    id: 'east-ridge', name: 'The long ridge', lat: 28.6060, lon: 83.8500, alt: 7400, radius: 420, severity: 4,
    kind: 'Cornice · length · altitude',
    blurb: 'Kilometres of corniced crest with no quick way down, and three summits over 8,000 m to cross before the main top.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 28.5961, lon: 83.8203, alt: 8000, radius: 900, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Only the summit ridge lies above 8,000 m, but it is where every route ends, late in the day, with the whole avalanche-prone face still to descend.',
    incidents: [],
    band: true,
  },
]

const timeline = [
  { year: 1950, title: 'The first eight-thousander', text: 'Maurice Herzog and Louis Lachenal reach the summit on 3 June by the north face, the first 8,000 m peak ever climbed, three years before Everest. Both lose their toes; Herzog his fingers. His book, Annapurna, becomes the best-selling mountaineering book of all time.' },
  { year: 1970, title: 'The South Face', text: 'Chris Bonington’s expedition climbs the 3,000 m south face, the start of big-wall climbing in the Himalaya. Don Whillans and Dougal Haston summit on 27 May; Ian Clough is killed by a serac the next day.' },
  { year: 1977, title: 'The Dutch Rib', text: 'Van Rijswick and Sonam Sherpa reach the summit on 13 October by a rib east of the Sickle gully that avoids the worst of the serac. It becomes the modern normal route.' },
  { year: 1978, title: 'A Woman’s Place', text: 'Arlene Blum’s American Women’s Himalayan Expedition puts Irene Miller and Vera Komarkova on the summit on 15 October, the first Americans. Two days later Vera Watson and Alison Chadwick-Onyszkiewicz fall to their deaths.' },
  { year: 1984, title: 'The traverse', text: 'Erhard Loretan and Norbert Joos climb the entire east ridge over all three summits in alpine style and descend the north face.' },
  { year: 1985, title: 'Northwest Face', text: 'Reinhold Messner and Hans Kammerlander climb a new line on the north-west face in a few days without fixed ropes.' },
  { year: 1987, title: 'Winter', text: 'Jerzy Kukuczka and Artur Hajzer make the first winter ascent on 3 February, in the worst weather of the Polish winter campaigns.' },
  { year: 1992, title: 'Béghin and Lafaille', text: 'Pierre Béghin dies when an abseil anchor fails at 7,400 m on the south face. Jean-Christophe Lafaille, hit by rockfall that breaks his arm, descends alone for five days.' },
  { year: 1997, title: 'Boukreev', text: 'Anatoli Boukreev, hero of the 1996 Everest disaster, is killed with Dimitri Sobolev by an avalanche on the south face on Christmas Day.' },
  { year: 2002, title: 'Lafaille returns', text: 'Ten years after his escape, Lafaille reaches the summit with Alberto Iñurrategi by the east ridge.' },
  { year: 2013, title: 'Steck', text: 'Ueli Steck climbs the south face alone in 28 hours by the Béghin–Lafaille line and wins a Piolet d’Or. With no photographs or GPS track, the ascent is disputed to this day.' },
  { year: 2021, title: 'Commercial season', text: 'Fixed ropes and bottled oxygen bring a record season: more than sixty summits in a single spring, more than the previous decade combined.' },
  { year: 2023, title: 'Out of the crevasse', text: 'Anurag Maloo is pulled alive from a crevasse below Camp 3 three days after falling into it, one of the most remarkable rescues in the Himalaya. Two other climbers die on the mountain that week.' },
]

const stats = [
  { label: 'Height', value: '8,091 m', note: '10th highest on Earth' },
  { label: 'First ascent', value: '1950', note: 'first of the fourteen 8,000ers' },
  { label: 'Summits', value: '≈ 400', note: 'about a third of them since 2016' },
  { label: 'Deaths', value: '≈ 75', note: 'historically one for every three summits' },
  { label: 'Winter ascent', value: '1987', note: 'Kukuczka & Hajzer' },
  { label: 'South face', value: '3,000 m', note: 'one of the biggest walls in the Himalaya' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'annapurna', peak, routes, hazards, timeline, stats, sources }
