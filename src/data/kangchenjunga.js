// Kangchenjunga routes, camps and hazards.
// Coordinates are approximate, derived from published route descriptions and
// checked against the Copernicus GLO-30 elevation model so camp altitudes match
// documented values. Not for navigation.

const peak = {
  lat: 27.7025, lon: 88.1475, elevation: 8586, name: 'Kangchenjunga', aka: 'Kangchendzönga · the Five Treasures of the Great Snow',
  range: 'Himalaya, Kangchenjunga Himal', countries: 'Nepal / India (Sikkim)',
  tagline: 'The third highest mountain on Earth, and the only one whose climbers stop, by tradition, a few steps short of the top.',
  summitText: 'The sacred summit. Since 1955 climbers have stopped a few metres below the highest point out of respect for the people of Sikkim. From here the ridge runs on to three more 8,000 m tops; the Yalung Glacier is 3,000 m below. The descent of the Gangway in the dark is where this mountain kills.',
  summitBlurb: 'Third highest point on Earth, on the Nepal–Sikkim border, first climbed in 1955. About 600 ascents and 60 deaths; nearly all commercial teams climb it in a single long push from the Great Shelf.',
  figuresLead: 'A mountain of five summits that is climbed by a few dozen people a year, most of them in one narrow window in May.',
  otherLines: 'Lines climbed but not modelled here: Pierre Béghin’s 1983 solo variation on the south-west face, the 1986 Polish winter line, and the 1991 Slovenian south ridge to Kangchenjunga South.',
  historyTitle: 'A hundred and seventy-five years',
  historyLead: 'From Hooker’s survey to the summit that nobody stands on.',
}

const routes = [
  {
    id: 'swface',
    name: 'Southwest Face',
    aka: 'Yalung Face · the 1955 route · the normal route',
    color: '#ff6a3d',
    firstAscent: '25 May 1955, Joe Brown & George Band (British expedition led by Charles Evans); Norman Hardie and Tony Streather the next day',
    share: '≈ 90% of all ascents',
    difficulty: 'Long glacier approach, an icefall, the sloping Great Shelf, then the Gangway couloir and a rock band at 8,400 m',
    verticalGain: '≈ 3,200 m from Base Camp',
    summary:
      'Up the Yalung Glacier past the site of Crowley’s 1905 disaster, through the lower icefall to the Great Shelf, a vast tilted snowfield at 7,200 m, then the Gangway to the summit ridge. The 1955 team climbed it without knowing where the Shelf led; today it carries almost all traffic, with a 15-hour summit day from Camp 4.',
    waypoints: [
      [27.6600, 88.1000], // Base Camp
      [27.6680, 88.1089],
      [27.6733, 88.1148],
      [27.6786, 88.1208], // C1
      [27.6850, 88.1280], // C2
      [27.6892, 88.1327],
      [27.6919, 88.1356], // C3, Great Shelf
      [27.6945, 88.1386],
      [27.6972, 88.1416], // C4
      [27.6998, 88.1445], // Gangway
      [27.7025, 88.1475], // Summit
    ],
    camps: [
      { name: 'Base Camp', alt: 5400, lat: 27.6600, lon: 88.1000, blurb: 'On the Yalung Glacier at the foot of the face, ten days’ walk from the nearest road at Taplejung.' },
      { name: 'Camp 1', alt: 6000, lat: 27.6786, lon: 88.1208, blurb: 'Above the lower icefall, on a glacier shelf below the Hump.' },
      { name: 'Camp 2', alt: 6450, lat: 27.6850, lon: 88.1280, blurb: 'At the top of the icefall, under the ice cliffs that guard the Great Shelf.' },
      { name: 'Camp 3', alt: 7150, lat: 27.6919, lon: 88.1356, blurb: 'On the Great Shelf, a snowfield the size of a small town tilted at 30°, where the 1955 team pitched their fourth camp.' },
      { name: 'Camp 4', alt: 7750, lat: 27.6972, lon: 88.1416, blurb: 'At the top of the Shelf below the Gangway. Summit pushes leave at 10 pm and return, at best, twenty hours later.' },
    ],
    hazards: ['lower-icefall', 'great-shelf', 'gangway', 'sacred-summit', 'death-zone'],
  },
  {
    id: 'north',
    name: 'North Ridge',
    aka: 'North Col route · the 1979 line',
    color: '#5fd3ff',
    firstAscent: '16 May 1979, Doug Scott, Peter Boardman & Joe Tasker (UK), without oxygen or Sherpa support',
    share: 'A few ascents; the second route on the mountain',
    difficulty: 'Serac-threatened slopes to the North Col, then a long exposed ridge with rock steps at 7,900 m',
    verticalGain: '≈ 3,400 m from Pangpema',
    summary:
      'From Pangpema at the head of the Kangchenjunga Glacier, up to the North Col and along the north ridge that the Germans tried in the 1930s. Scott, Boardman and Tasker climbed it in 1979 as a four-person team with no oxygen, a new standard for the great peaks; Boardman and Tasker died on Everest three years later.',
    waypoints: [
      [27.7580, 88.1180], // Pangpema
      [27.7530, 88.1198],
      [27.7500, 88.1209],
      [27.7470, 88.1220], // Kangchenjunga Glacier
      [27.7443, 88.1252],
      [27.7415, 88.1285],
      [27.7388, 88.1318],
      [27.7360, 88.1350], // C1, below the Twins
      [27.7352, 88.1395],
      [27.7345, 88.1440], // C2, foot of the wall
      [27.7335, 88.1500], // on the wall
      [27.7320, 88.1550], // North Col
      [27.7270, 88.1540],
      [27.7240, 88.1550],
      [27.7215, 88.1545], // C3, the 7,475 m snow cave
      [27.7180, 88.1550], // rocky plateau, 7,775 m
      [27.7150, 88.1520],
      [27.7125, 88.1520], // C4, bivouac cave in the summit cone
      [27.7090, 88.1500],
      [27.7060, 88.1470], // toward the west-ridge notch
      [27.7025, 88.1475], // Summit
    ],
    camps: [
      { name: 'Pangpema', alt: 5140, lat: 27.7580, lon: 88.1180, blurb: 'The north base camp, on the moraine above the Kangchenjunga Glacier, facing the whole north face.' },
      { name: 'Camp 1', alt: 5700, lat: 27.7360, lon: 88.1350, blurb: 'On the glacier below the Twins, out of the worst of the serac fall.' },
      { name: 'Camp 2', alt: 5800, lat: 27.7345, lon: 88.1440, blurb: 'In the cirque at the foot of the 900 m wall that leads to the North Col.' },
      { name: 'North Col', alt: 6900, lat: 27.7320, lon: 88.1550, blurb: 'The saddle between Kangchenjunga and the Twins, reached in 1979 up a serac-threatened ice wall.' },
      { name: 'Camp 3', alt: 7475, lat: 27.7215, lon: 88.1545, blurb: 'A snow cave where the ridge steepens into the rock step the 1979 team called the Castle. The summit push began here.' },
      { name: 'Camp 4', alt: 7900, lat: 27.7125, lon: 88.1520, blurb: 'The bivouac cave in the summit cone where the 1979 team sat out a storm, 600 m of easier ground below the notch on the west ridge.' },
    ],
    hazards: ['north-col-slopes', 'north-ridge', 'sacred-summit', 'death-zone'],
  },
  {
    id: 'northface',
    name: 'North Face',
    aka: 'Japanese direct, 1980',
    color: '#c77dff',
    firstAscent: '14 May 1980, a Japanese expedition led by Masatsugu Konishi, with oxygen; Kangchenjunga’s first direct face route',
    share: 'Rarely repeated',
    difficulty: 'A 3,000 m face of serac bands and 50-60° ice, siege-climbed with fixed rope',
    verticalGain: '≈ 3,400 m from Pangpema',
    summary:
      'Straight up the north face between the 1979 ridge and the north-west spur, through the serac barriers that threaten everything below them. The 1980 Japanese siege used kilometres of fixed rope and put several climbers on the summit.',
    waypoints: [
      [27.7580, 88.1180], // Pangpema
      [27.7452, 88.1130],
      [27.7386, 88.1183], // C1
      [27.7320, 88.1236],
      [27.7255, 88.1289], // C2
      [27.7189, 88.1342],
      [27.7156, 88.1369], // C3
      [27.7123, 88.1395],
      [27.7091, 88.1422], // C4
      [27.7058, 88.1448],
      [27.7025, 88.1475], // Summit
    ],
    camps: [
      { name: 'Camp 1', alt: 5850, lat: 27.7386, lon: 88.1183, blurb: 'On the glacier at the foot of the face.' },
      { name: 'Camp 2', alt: 6350, lat: 27.7255, lon: 88.1289, blurb: 'Under the first serac band.' },
      { name: 'Camp 3', alt: 7100, lat: 27.7156, lon: 88.1369, blurb: 'A ledge cut into the ice above the second barrier.' },
      { name: 'Camp 4', alt: 7850, lat: 27.7091, lon: 88.1422, blurb: 'Below the summit headwall.' },
    ],
    hazards: ['north-face-serac', 'sacred-summit', 'death-zone'],
  },
  {
    id: 'nespur',
    name: 'Northeast Spur',
    aka: 'Zemu side · the Bauer route, Sikkim',
    color: '#ffc14d',
    firstAscent: '31 May 1977, Prem Chand & Nima Dorje Sherpa (Indian Army expedition led by Col. Narendra Kumar)',
    share: 'Two ascents; Sikkim has been closed to climbers since 2000',
    difficulty: 'A corniced ice spur to the north ridge at 7,700 m, tunnelled through by the Germans in 1929 and 1931',
    verticalGain: '≈ 3,200 m from the Zemu Glacier',
    summary:
      'The spur that Paul Bauer’s Bavarian expeditions attacked in 1929 and 1931, cutting ice caves along its crest and turning back at 7,700 m. The Indian Army finished it in 1977, the mountain’s second ascent. Sikkim, holding the peak sacred, no longer allows climbing from this side.',
    waypoints: [
      [27.7100, 88.2100], // Zemu Glacier
      [27.7079, 88.1921],
      [27.7068, 88.1832], // C1
      [27.7046, 88.1654], // C2
      [27.7092, 88.1609], // C3
      [27.7138, 88.1565],
      [27.7161, 88.1542], // C4
      [27.7184, 88.1520],
      [27.7180, 88.1550], // joins the north ridge on the crest
    ],
    camps: [
      { name: 'Zemu base', alt: 5400, lat: 27.7100, lon: 88.2100, blurb: 'On the Zemu Glacier in Sikkim, below the east face, where Bauer’s teams camped in 1929.' },
      { name: 'Camp 1', alt: 5900, lat: 27.7068, lon: 88.1832, blurb: 'At the foot of the spur.' },
      { name: 'Camp 2', alt: 6200, lat: 27.7046, lon: 88.1654, blurb: 'Where the spur steepens into a crest of ice towers.' },
      { name: 'Camp 3', alt: 6950, lat: 27.7092, lon: 88.1609, blurb: 'An ice cave on the crest, in the style of the 1931 expedition.' },
      { name: 'Camp 4', alt: 7550, lat: 27.7161, lon: 88.1542, blurb: 'Below the junction with the north ridge.' },
    ],
    hazards: ['ne-spur', 'north-ridge', 'death-zone'],
    joins: 'north',
  },
  {
    id: 'traverse',
    name: 'Four-summit traverse',
    aka: 'Soviet traverse, 1989',
    color: '#7dffb3',
    firstAscent: 'April–May 1989, Soviet expedition led by Eduard Myslovsky: all four 8,000 m summits crossed in both directions',
    share: 'Once, in full',
    difficulty: 'Days above 8,000 m along a corniced ridge, from Yalung Kang over the Main, Central and South summits',
    verticalGain: '≈ 1,400 m of ridge above the Great Shelf',
    summary:
      'The ridge of Kangchenjunga carries four 8,000 m tops in three kilometres. In 1989 a Soviet expedition of over thirty climbers fixed the south-west face to the Shelf and then traversed the entire crest, some members in both directions, the longest sustained climbing above 8,000 m ever done.',
    waypoints: [
      [27.6919, 88.1356], // Great Shelf
      [27.6990, 88.1370],
      [27.7040, 88.1400], // col below Yalung Kang
      [27.7053, 88.1372], // Yalung Kang
      [27.7040, 88.1400],
      [27.7025, 88.1475], // Main summit
      [27.6995, 88.1495],
      [27.6964, 88.1510], // Central
      [27.6917, 88.1542], // South
    ],
    camps: [
      { name: 'Great Shelf', alt: 7150, lat: 27.6919, lon: 88.1356, blurb: 'The staging camp for the traverse, shared with the normal route.' },
      { name: 'Yalung Kang', alt: 8505, lat: 27.7053, lon: 88.1372, blurb: 'The west summit, an 8,000 m peak in its own right, first climbed in 1973.' },
      { name: 'Kangchenjunga Central', alt: 8482, lat: 27.6964, lon: 88.1510, blurb: 'The middle summit, first climbed in 1978 by a Polish team.' },
      { name: 'Kangchenjunga South', alt: 8476, lat: 27.6917, lon: 88.1542, blurb: 'The southern top, also first climbed by the Poles in 1978.' },
    ],
    hazards: ['ridge-traverse', 'sacred-summit', 'death-zone'],
    finish: { title: 'Kangchenjunga South', alt: 8476, body: 'The fourth summit of the traverse. From here the 1989 team descended back across the ridge to the Shelf, having spent longer above 8,000 m than anyone before or since.' },
  },
]

const hazards = [
  {
    id: 'lower-icefall', name: 'Lower icefall', lat: 27.6786, lon: 88.1208, alt: 6000, radius: 400, severity: 4,
    kind: 'Crevasses · serac',
    blurb: 'The broken glacier between Base Camp and the Shelf, threaded between ice cliffs. Crowley’s 1905 party was avalanched here on the retreat.',
    incidents: ['1 Sep 1905, an avalanche kills Alexis Pache and three porters on the first attempt'],
  },
  {
    id: 'great-shelf', name: 'The Great Shelf', lat: 27.6919, lon: 88.1356, alt: 7200, radius: 380, severity: 4,
    kind: 'Avalanche · exposure',
    blurb: 'A tilted snowfield of several square kilometres, loaded by every storm and swept by slab avalanches from the headwall above.',
    incidents: ['2014, Chhanda Gayen and two Sherpas lost in an avalanche while attempting Yalung Kang from the Shelf'],
  },
  {
    id: 'gangway', name: 'The Gangway', lat: 27.6998, lon: 88.1445, alt: 8100, radius: 220, severity: 5,
    kind: 'Rockfall · exhaustion · late descents',
    blurb: 'The couloir and rock band that lead from the Shelf to the summit ridge: twenty hours round trip from Camp 4 for most climbers, with the dangerous part in the dark on the way down.',
    incidents: ['May 2019, four climbers die of exhaustion and altitude sickness descending from the summit', '1992, Wanda Rutkiewicz last seen at 8,300 m, attempting her ninth 8,000 m peak'],
  },
  {
    id: 'sacred-summit', name: 'The false summit', lat: 27.7025, lon: 88.1475, alt: 8550, radius: 160, severity: 3,
    kind: 'Whiteout · tradition',
    blurb: 'By agreement with Sikkim, climbers since 1955 stop a few steps short of the top. In recent years many “summits” were shown to have stopped on a rock bump lower down the ridge; Nepal now checks photographs.',
    incidents: ['2023, dozens of claimed ascents disputed after drone footage of the ridge'],
  },
  {
    id: 'north-col-slopes', name: 'North Col slopes', lat: 27.7335, lon: 88.1500, alt: 6300, radius: 350, severity: 5,
    kind: 'Serac · avalanche',
    blurb: 'The 900 m ice wall west of the North Col is overhung by seracs that calve without warning.',
    incidents: ['1931, Hermann Schaller and Pasang Sherpa killed on the spur above'],
  },
  {
    id: 'north-ridge', name: 'North ridge', lat: 27.7180, lon: 88.1550, alt: 7700, radius: 320, severity: 4,
    kind: 'Wind · exposure · rock steps',
    blurb: 'A long crest above 7,000 m in the full force of the wind off the Tibetan plateau, with rock steps at 7,900 m that the 1979 team climbed without ropes.',
    incidents: [],
  },
  {
    id: 'north-face-serac', name: 'North face serac bands', lat: 27.7189, lon: 88.1342, alt: 6800, radius: 380, severity: 5,
    kind: 'Serac fall',
    blurb: 'Two barriers of hanging ice across the face; the 1980 route threads the gaps between them.',
    incidents: [],
  },
  {
    id: 'ne-spur', name: 'Northeast spur', lat: 27.7092, lon: 88.1609, alt: 6900, radius: 380, severity: 4,
    kind: 'Cornice · ice towers',
    blurb: 'A crest of ice towers and cornices that the Germans tunnelled through in 1929; parts of it collapse every season.',
    incidents: ['1931, Schaller and Pasang fall to their deaths from the crest'],
  },
  {
    id: 'ridge-traverse', name: 'The summit ridge', lat: 27.6990, lon: 88.1500, alt: 8450, radius: 500, severity: 5,
    kind: 'Altitude · cornice · no retreat',
    blurb: 'Three kilometres of crest above 8,000 m linking the four summits, with cornices over the Zemu side and no easy descent between them.',
    incidents: [],
  },
  {
    id: 'death-zone', name: 'The Death Zone', lat: 27.7025, lon: 88.1475, alt: 8000, radius: 1000, severity: 5,
    kind: 'Altitude · cold · wind',
    blurb: 'Above 8,000 m the body can no longer acclimatise. On Kangchenjunga the summit day from Camp 4 climbs 800 m into it and, for most, back down in the dark.',
    incidents: ['Most deaths on the mountain occur on the descent from the summit ridge'],
    band: true,
  },
]

const timeline = [
  { year: 1849, title: 'Hooker', text: 'The botanist Joseph Hooker travels through Sikkim and sketches the massif; for a few years it is thought to be the highest mountain in the world.' },
  { year: 1899, title: 'The circuit', text: 'Douglas Freshfield walks around the whole mountain with the photographer Vittorio Sella, producing the first map of the massif.' },
  { year: 1905, title: 'Crowley', text: 'Aleister Crowley leads the first attempt, up the Yalung side. After a quarrel he stays in his tent while an avalanche kills Alexis Pache and three porters.' },
  { year: 1931, title: 'Bauer', text: 'Paul Bauer’s Bavarian team, tunnelling ice caves up the north-east spur, reaches 7,700 m on their second attempt. Hermann Schaller and Pasang Sherpa die in a fall.' },
  { year: 1955, title: 'First ascent', text: 'Joe Brown and George Band reach the summit on 25 May, followed by Norman Hardie and Tony Streather the next day. Honouring a promise to the Chogyal of Sikkim, they stop a few feet below the sacred top.' },
  { year: 1977, title: 'From Sikkim', text: 'An Indian Army expedition completes Bauer’s spur; Prem Chand and Nima Dorje make the second ascent of the mountain.' },
  { year: 1979, title: 'Lightweight', text: 'Doug Scott, Peter Boardman and Joe Tasker climb the north ridge as a team of four with no oxygen and no Sherpas, a turning point in Himalayan style.' },
  { year: 1986, title: 'Winter', text: 'Krzysztof Wielicki and Jerzy Kukuczka make the first winter ascent on 11 January. Andrzej Czok dies of pulmonary oedema on the descent.' },
  { year: 1989, title: 'The traverse', text: 'A Soviet expedition crosses all four 8,000 m summits along the ridge, several climbers in both directions.' },
  { year: 1992, title: 'Rutkiewicz', text: 'Wanda Rutkiewicz, the first woman to climb K2, disappears above 8,200 m on 13 May while attempting her ninth 8,000 m peak.' },
  { year: 1998, title: 'First woman', text: 'Ginette Harrison reaches the summit on 18 May, the last of the 8,000 m peaks to be climbed by a woman.' },
  { year: 2019, title: 'Deadliest season', text: 'Four climbers die descending from the summit in one week, exhausted in the Gangway; the mountain’s worst year.' },
  { year: 2023, title: 'Where is the top?', text: 'Drone footage shows that many recent “summits” stopped at a rock bump below the true summit. Nepal begins verifying summit claims with photographs.' },
]

const stats = [
  { label: 'Height', value: '8,586 m', note: '3rd highest on Earth' },
  { label: 'First ascent', value: '1955', note: 'Brown & Band' },
  { label: 'Summits', value: '≈ 600', note: 'the least climbed of the top three' },
  { label: 'Deaths', value: '≈ 60', note: 'about one for every ten summits' },
  { label: 'Summits over 8,000 m', value: '4', note: 'Main, Yalung Kang, Central, South' },
  { label: 'Winter ascent', value: '1986', note: 'Wielicki & Kukuczka' },
]

const sources = [
  'Elevation: Copernicus DEM GLO-30 (© DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018, provided under COPERNICUS by the European Union and ESA)',
  'Imagery: Esri World Imagery (Clarity), Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  'Route and camp positions are approximate, reconstructed from published expedition accounts and fitted to the terrain model',
]

export default { id: 'kangchenjunga', peak, routes, hazards, timeline, stats, sources }
