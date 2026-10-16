export const trekImagesByRegion = {
  Nepal: ['everest-base-camp.jpg', 'annapurna-circuit.jpg'],
  'Northern India': ['deoria-tal-india.jpg'],
  'Southern India': ['nilgiri-hills-india.jpg'],
  Japan: ['mount-fuji.jpg'],
  Vietnam: ['sapa-vietnam.jpg'],
  Kyrgyzstan: ['tian-shan-kyrgyzstan.jpg'],
  Bhutan: ['paro-taktsang-bhutan.jpg'],
  'Sri Lanka': ['kirigalpotta-sri-lanka.jpg'],
  China: ['great-wall-china.jpg']
};

export function getTrekImageFilename(region) {
  return trekImagesByRegion[region]?.[0] || trekImagesByRegion.Nepal[0];
}
