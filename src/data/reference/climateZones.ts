export interface ClimateZone {
  id: string;
  city: string;
  state: string;
  designOutdoorTemp: number; // °C
}

export const climateZones: ClimateZone[] = [
  { id: 'aachen', city: 'Aachen', state: 'NRW', designOutdoorTemp: -10.0 },
  { id: 'augsburg', city: 'Augsburg', state: 'Bayern', designOutdoorTemp: -14.0 },
  { id: 'berlin', city: 'Berlin', state: 'Berlin', designOutdoorTemp: -13.0 },
  { id: 'bielefeld', city: 'Bielefeld', state: 'NRW', designOutdoorTemp: -12.0 },
  { id: 'bonn', city: 'Bonn', state: 'NRW', designOutdoorTemp: -10.0 },
  { id: 'braunschweig', city: 'Braunschweig', state: 'Niedersachsen', designOutdoorTemp: -14.0 },
  { id: 'bremen', city: 'Bremen', state: 'Bremen', designOutdoorTemp: -12.0 },
  { id: 'chemnitz', city: 'Chemnitz', state: 'Sachsen', designOutdoorTemp: -15.0 },
  { id: 'darmstadt', city: 'Darmstadt', state: 'Hessen', designOutdoorTemp: -11.0 },
  { id: 'dortmund', city: 'Dortmund', state: 'NRW', designOutdoorTemp: -12.0 },
  { id: 'dresden', city: 'Dresden', state: 'Sachsen', designOutdoorTemp: -15.0 },
  { id: 'duesseldorf', city: 'Düsseldorf', state: 'NRW', designOutdoorTemp: -10.0 },
  { id: 'erfurt', city: 'Erfurt', state: 'Thüringen', designOutdoorTemp: -14.0 },
  { id: 'essen', city: 'Essen', state: 'NRW', designOutdoorTemp: -10.0 },
  { id: 'frankfurt', city: 'Frankfurt am Main', state: 'Hessen', designOutdoorTemp: -12.0 },
  { id: 'freiburg', city: 'Freiburg', state: 'Baden-Württemberg', designOutdoorTemp: -12.0 },
  { id: 'goettingen', city: 'Göttingen', state: 'Niedersachsen', designOutdoorTemp: -14.0 },
  { id: 'halle', city: 'Halle (Saale)', state: 'Sachsen-Anhalt', designOutdoorTemp: -14.0 },
  { id: 'hamburg', city: 'Hamburg', state: 'Hamburg', designOutdoorTemp: -12.0 },
  { id: 'hannover', city: 'Hannover', state: 'Niedersachsen', designOutdoorTemp: -12.0 },
  { id: 'heidelberg', city: 'Heidelberg', state: 'Baden-Württemberg', designOutdoorTemp: -11.0 },
  { id: 'kaiserslautern', city: 'Kaiserslautern', state: 'Rheinland-Pfalz', designOutdoorTemp: -13.0 },
  { id: 'karlsruhe', city: 'Karlsruhe', state: 'Baden-Württemberg', designOutdoorTemp: -12.0 },
  { id: 'kassel', city: 'Kassel', state: 'Hessen', designOutdoorTemp: -13.0 },
  { id: 'kiel', city: 'Kiel', state: 'Schleswig-Holstein', designOutdoorTemp: -12.0 },
  { id: 'koeln', city: 'Köln', state: 'NRW', designOutdoorTemp: -10.0 },
  { id: 'leipzig', city: 'Leipzig', state: 'Sachsen', designOutdoorTemp: -14.0 },
  { id: 'luebeck', city: 'Lübeck', state: 'Schleswig-Holstein', designOutdoorTemp: -12.0 },
  { id: 'magdeburg', city: 'Magdeburg', state: 'Sachsen-Anhalt', designOutdoorTemp: -14.0 },
  { id: 'mainz', city: 'Mainz', state: 'Rheinland-Pfalz', designOutdoorTemp: -11.0 },
  { id: 'mannheim', city: 'Mannheim', state: 'Baden-Württemberg', designOutdoorTemp: -11.0 },
  { id: 'muenchen', city: 'München', state: 'Bayern', designOutdoorTemp: -14.0 },
  { id: 'muenster', city: 'Münster', state: 'NRW', designOutdoorTemp: -12.0 },
  { id: 'nuernberg', city: 'Nürnberg', state: 'Bayern', designOutdoorTemp: -14.0 },
  { id: 'oldenburg', city: 'Oldenburg', state: 'Niedersachsen', designOutdoorTemp: -12.0 },
  { id: 'osnabrueck', city: 'Osnabrück', state: 'Niedersachsen', designOutdoorTemp: -12.0 },
  { id: 'potsdam', city: 'Potsdam', state: 'Brandenburg', designOutdoorTemp: -13.0 },
  { id: 'regensburg', city: 'Regensburg', state: 'Bayern', designOutdoorTemp: -16.0 },
  { id: 'rostock', city: 'Rostock', state: 'Mecklenburg-Vorpommern', designOutdoorTemp: -12.0 },
  { id: 'saarbruecken', city: 'Saarbrücken', state: 'Saarland', designOutdoorTemp: -12.0 },
  { id: 'schwerin', city: 'Schwerin', state: 'Mecklenburg-Vorpommern', designOutdoorTemp: -12.0 },
  { id: 'stuttgart', city: 'Stuttgart', state: 'Baden-Württemberg', designOutdoorTemp: -12.0 },
  { id: 'trier', city: 'Trier', state: 'Rheinland-Pfalz', designOutdoorTemp: -12.0 },
  { id: 'ulm', city: 'Ulm', state: 'Baden-Württemberg', designOutdoorTemp: -14.0 },
  { id: 'wiesbaden', city: 'Wiesbaden', state: 'Hessen', designOutdoorTemp: -11.0 },
  { id: 'wuerzburg', city: 'Würzburg', state: 'Bayern', designOutdoorTemp: -13.0 },
];

export function findClimateZone(id: string): ClimateZone | undefined {
  return climateZones.find((z) => z.id === id);
}
