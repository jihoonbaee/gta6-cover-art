const g = 0.012;
const box = (x, y, w, h) => ({ x, y, width: w, height: h });

// Every rectangle is normalized; the renderer scales the same geometry to its target.
const definitions = {
  square: {
    'Hero Left': [box(.025,.025,.605,.95),box(.65,.025,.325,.465),box(.65,.51,.325,.465)],
    'Hero Center': [box(.2,.025,.6,.95),box(.025,.025,.15,.95),box(.825,.025,.15,.95)],
    'Pop-Out Hero': [box(.055,.055,.62,.89),box(.71,.055,.235,.42),box(.71,.525,.235,.42)],
    'Strip': [box(.025,.025,.31,.95),box(.345,.025,.31,.95),box(.665,.025,.31,.95)],
    'Grid 2x2': [box(.025,.025,.465,.465),box(.51,.025,.465,.465),box(.025,.51,.465,.465),box(.51,.51,.465,.465)],
    'Full-Bleed + Insets': [box(0,0,1,1),box(.665,.055,.29,.29),box(.665,.385,.29,.29)]
  },
  portrait: {
    'Hero Left': [box(.025,.025,.605,.95),box(.65,.025,.325,.465),box(.65,.51,.325,.465)],
    'Hero Center': [box(.2,.025,.6,.95),box(.025,.025,.15,.95),box(.825,.025,.15,.95)],
    'Pop-Out Hero': [box(.055,.04,.62,.92),box(.71,.04,.235,.44),box(.71,.52,.235,.44)],
    'Strip': [box(.025,.025,.31,.95),box(.345,.025,.31,.95),box(.665,.025,.31,.95)],
    'Grid 2x2': [box(.025,.025,.465,.465),box(.51,.025,.465,.465),box(.025,.51,.465,.465),box(.51,.51,.465,.465)],
    'Full-Bleed + Insets': [box(0,0,1,1),box(.65,.055,.3,.25),box(.65,.34,.3,.25)]
  },
  landscape: {
    'Hero Left': [box(.025,.035,.61,.93),box(.655,.035,.32,.45),box(.655,.515,.32,.45)],
    'Hero Center': [box(.2,.035,.6,.93),box(.025,.035,.15,.93),box(.825,.035,.15,.93)],
    'Pop-Out Hero': [box(.035,.045,.62,.91),box(.69,.045,.275,.435),box(.69,.52,.275,.435)],
    'Strip': [box(.025,.035,.31,.93),box(.345,.035,.31,.93),box(.665,.035,.31,.93)],
    'Grid 2x2': [box(.025,.035,.465,.45),box(.51,.035,.465,.45),box(.025,.515,.465,.45),box(.51,.515,.465,.45)],
    'Full-Bleed + Insets': [box(0,0,1,1),box(.705,.055,.24,.3),box(.705,.395,.24,.3)]
  }
};

export function definePosterLayouts() {
  return Object.fromEntries(Object.entries(definitions).map(([ratio, layouts]) => [ratio, Object.fromEntries(Object.entries(layouts).map(([name, rects]) => [name, rects.map(rect => ({ ...rect }))]))]));
}

export function listLayoutNames() { return Object.keys(definitions.portrait); }
