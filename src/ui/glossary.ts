// Plain-language definitions for terms and abbreviations used in the app.

export interface GlossaryEntry {
  term: string;
  /** Other names or abbreviations, searched too. */
  aka?: string;
  definition: string;
}

export interface GlossarySection {
  title: string;
  entries: GlossaryEntry[];
}

export const GLOSSARY: GlossarySection[] = [
  {
    title: 'Reading the tables',
    entries: [
      {
        term: 'Path',
        definition:
          'How far the bullet is above (+) or below (−) your crosshair at a given range, in inches. A path of −7.9″ at 300 yd means the bullet lands 7.9″ low if you aim dead on.',
      },
      {
        term: 'Line of sight',
        aka: 'LOS',
        definition:
          'The straight line from your eye through the scope to the target. The bullet starts below it (by the sight height), rises across it, and falls back through it.',
      },
      {
        term: 'Bore',
        definition:
          'The inside of the barrel. The bore points slightly upward relative to the scope so the bullet arcs up to meet the line of sight at your zero.',
      },
      {
        term: 'Sight height',
        aka: 'SH',
        definition:
          'Distance from the center of the barrel to the center of the scope, in inches. Measure from the middle of the bolt or barrel to the middle of the scope tube. About 1.5″ on a typical hunting rifle and 2.6″ on most AR-15s. It mainly affects close-range numbers.',
      },
      {
        term: 'Velocity',
        aka: 'Vel, fps',
        definition: 'Bullet speed in feet per second (fps). It drops steadily as the bullet flies.',
      },
      {
        term: 'Muzzle velocity',
        aka: 'MV',
        definition:
          'Speed as the bullet leaves the barrel. Box numbers come from a test barrel (often 24″); shorter barrels are usually slower, roughly 25–50 fps per inch.',
      },
      {
        term: 'Energy',
        aka: 'ft-lb, ft-lbs',
        definition:
          'Foot-pounds of kinetic energy, from bullet weight and velocity. A common rule of thumb for deer is 1,000 ft-lb, but shot placement and bullet construction matter more.',
      },
      {
        term: 'Time of flight',
        aka: 'Time, TOF',
        definition: 'Seconds from the muzzle to that range. Longer flight means more drop and more wind drift.',
      },
      {
        term: 'Struck-through values',
        definition:
          'On the Zeros tab, a value with a line through it means the bullet is outside your target radius at that range with a center hold.',
      },
    ],
  },
  {
    title: 'Angles, clicks and holds',
    entries: [
      {
        term: 'MOA',
        aka: 'minute of angle',
        definition:
          '1/60 of a degree. Covers about 1″ at 100 yd, 2″ at 200 yd, 3″ at 300 yd (exactly 1.047″ per 100 yd). Many scopes adjust in ¼ MOA clicks.',
      },
      {
        term: 'MIL',
        aka: 'mrad, milliradian',
        definition:
          '1/1000 of the range: 3.6″ at 100 yd, 7.2″ at 200 yd. Mil scopes usually adjust in 0.1 MIL clicks (0.36″ at 100 yd).',
      },
      {
        term: 'Click',
        definition:
          'One detent of the scope turret. Set ¼ MOA or 0.1 MIL to match your scope; it’s usually marked on the turret cap.',
      },
      {
        term: 'U / D',
        aka: 'up, down',
        definition: 'Clicks to dial on the elevation turret. “U 10” means turn 10 clicks in the “Up” direction.',
      },
      {
        term: 'L / R',
        aka: 'left, right',
        definition:
          'For wind drift, which way the bullet moves (“2.1 L” = 2.1″ left). For windage clicks, which way to dial to correct it.',
      },
      {
        term: 'Holdover',
        aka: 'hold',
        definition:
          'Aiming higher or lower instead of dialing. The holdover card says where to put the crosshair: “7.9″ high” means aim 7.9″ above where you want to hit.',
      },
      {
        term: 'Dialing',
        definition: 'Turning the scope turret so you can hold dead on at a range other than your zero.',
      },
      {
        term: 'Point of aim / point of impact',
        aka: 'POA, POI',
        definition: 'Where the crosshair is versus where the bullet actually lands.',
      },
      {
        term: 'Point-of-impact shift',
        aka: 'POI shift',
        definition:
          'Two loads zeroed the same can still hit in different places because each one makes the barrel vibrate differently. That’s why the Switch loads view says to confirm on paper.',
      },
    ],
  },
  {
    title: 'Zeros and point-blank',
    entries: [
      {
        term: 'Zero',
        aka: 'zero range',
        definition:
          'The range where the bullet hits exactly at the crosshair. A “200 yd zero” means the scope is adjusted so shots land dead on at 200 yd.',
      },
      {
        term: 'Near zero / far zero',
        aka: 'crosses crosshair',
        definition:
          'The bullet crosses the line of sight twice: once on the way up (near zero, often 20–40 yd) and once on the way down (far zero, the range you call your zero).',
      },
      {
        term: 'Peak',
        aka: 'apex, mid-range height',
        definition: 'The highest point of the bullet above the line of sight, usually a bit past halfway to the far zero.',
      },
      {
        term: 'Target radius',
        definition:
          'How far from your aim point a hit is still good. Deer vitals are about an 8″ circle, so a 4″ radius; a neck or spine shot is about 1.25″.',
      },
      {
        term: 'Max point-blank range',
        aka: 'MPBR, point-blank range',
        definition:
          'The farthest you can hold dead center and still stay within the target radius, with the zero chosen to stretch it as far as possible. Beyond it, hold over or dial.',
      },
      {
        term: 'Shot window',
        definition: 'The closest and farthest ranges you expect to shoot, e.g. 50–250 yd.',
      },
      {
        term: 'Best zero',
        aka: 'optimal zero',
        definition:
          'The zero that makes the biggest miss anywhere in your shot window as small as possible. It balances the peak against the drop at the far end.',
      },
      {
        term: 'Worst-case miss',
        definition:
          'The largest distance above or below the crosshair anywhere in the shot window with a center hold.',
      },
      {
        term: 'Switch loads',
        definition:
          'Shows where a different load hits if you keep the scope set from zeroing another load. Useful if you sight in with cheap ammo and hunt with something else.',
      },
    ],
  },
  {
    title: 'Bullets and drag',
    entries: [
      {
        term: 'Ballistic coefficient',
        aka: 'BC',
        definition:
          'How well a bullet keeps its speed through the air; higher is better. It only means something with its drag model: G1 0.625 and G7 0.315 describe the same bullet. Use the number printed on the box for your chosen model.',
      },
      {
        term: 'Drag model',
        aka: 'G1, G7',
        definition:
          'The reference bullet shape the BC is measured against. G1 is a flat-based, old-style shape and is what most boxes list. G7 is a long, boat-tail shape that fits modern long-range bullets better. Use whichever the box gives; if it gives both, G7 tends to be more accurate past 300 yd for sleek bullets.',
      },
      {
        term: 'Grain',
        aka: 'gr',
        definition: 'Unit of bullet weight. 7,000 grains = 1 pound. A 150 gr bullet weighs about 1/3 oz.',
      },
      {
        term: 'Mach / speed of sound',
        definition:
          'About 1,116 fps at 59 °F, faster in warm air. Drag changes sharply as a bullet slows toward the speed of sound (transonic), and accuracy can suffer.',
      },
      {
        term: 'Point-mass solver',
        aka: 'RK4',
        definition:
          'How the app calculates: it treats the bullet as a point acted on by gravity and air drag, stepping forward every half-millisecond (RK4 is the step method). It doesn’t model spin drift or Coriolis, which only matter at long range.',
      },
      { term: 'FMJ', aka: 'full metal jacket', definition: 'Non-expanding range bullet. Many states don’t allow it for deer; check your regulations.' },
      { term: 'PSP', aka: 'pointed soft point', definition: 'Hunting bullet with exposed lead at a pointed tip so it expands on impact.' },
      { term: 'Core-Lokt / Power-Point', definition: 'Remington and Winchester names for their traditional soft-point hunting bullets.' },
      { term: 'ELD-X', definition: 'Hornady’s long-range hunting bullet with a polymer tip; very high BC.' },
      {
        term: 'FTX / LEVERevolution',
        definition:
          'Hornady’s soft rubbery tip that is safe in lever-action tube magazines, so 30-30s can use a pointed, higher-BC bullet.',
      },
      {
        term: 'Box BC marker',
        aka: '●',
        definition: 'A dot next to BC means the preset’s value came from published data; check it against your box.',
      },
    ],
  },
  {
    title: 'Weather and wind',
    entries: [
      {
        term: 'Air density',
        definition:
          'Thinner air (high altitude, heat, low pressure) means less drag, so bullets drop less and drift less. Cold, dense air does the opposite.',
      },
      {
        term: 'Standard conditions',
        aka: 'ICAO, standard atmosphere',
        definition:
          '59 °F, 29.92 inHg, sea level. Box BCs and factory trajectory tables are based on these conditions.',
      },
      {
        term: 'inHg',
        aka: 'inches of mercury',
        definition: 'Unit of air pressure. Sea level is about 29.92 inHg.',
      },
      {
        term: 'Barometric vs station pressure',
        definition:
          'Weather reports give barometric pressure corrected to sea level (always near 30 inHg). Station pressure is the actual pressure where you stand, lower at altitude. Leave the box unticked for weather-report numbers and enter your altitude; tick it if your device reads actual pressure.',
      },
      {
        term: 'Kestrel',
        definition:
          'A handheld weather meter many shooters use. It reads station (actual) pressure, so tick “Station pressure” when entering its reading.',
      },
      {
        term: 'Wind from (angle)',
        definition:
          'Direction the wind comes from, measured clockwise from the target: 90° = from your right (3 o’clock), 270° = from your left (9 o’clock), 0° = in your face, 180° = at your back. 45° is from about 1:30.',
      },
      {
        term: 'Full value wind',
        definition: 'Wind straight across the line of fire (90° or 270°). It pushes the bullet the most.',
      },
      {
        term: 'Wind drift',
        aka: 'windage',
        definition:
          'How far crosswind pushes the bullet sideways. A wind at an angle pushes less: a 45° wind gives about 70% of full-value drift.',
      },
      {
        term: 'Headwind / tailwind',
        definition: 'Wind along the line of fire. It changes drop very slightly and causes almost no sideways drift.',
      },
    ],
  },
  {
    title: 'The app',
    entries: [
      {
        term: 'Profile / preset',
        definition:
          'A saved rifle and load: velocity, BC, weight, sight height and zero. Presets are built in; edits can be saved over them and reset later. Profiles are stored on this device only.',
      },
      {
        term: 'PWA / Add to Home Screen',
        definition:
          'The app can be installed from your phone’s browser menu. After the first visit it works offline, with no signal needed at the range.',
      },
    ],
  },
];
