/**
 * Dicionário PT -> EN para nomes de animais/itens, usado no miolo do livro
 * (mercado americano). Cobre os temas do portal. Chaves em minúsculas.
 */
export const PT_TO_EN = {
  // Selva / Safari
  'leão': 'Lion', 'leao': 'Lion', 'onça-pintada': 'Jaguar', 'onca-pintada': 'Jaguar',
  'elefante': 'Elephant', 'girafa': 'Giraffe', 'macaco': 'Monkey', 'tucano': 'Toucan',
  'preguiça': 'Sloth', 'preguica': 'Sloth', 'hipopótamo': 'Hippo', 'hipopotamo': 'Hippo',
  'zebra': 'Zebra', 'rinoceronte': 'Rhino', 'jacaré': 'Crocodile', 'jacare': 'Crocodile',
  'flamingo': 'Flamingo', 'papagaio': 'Parrot', 'tartaruga': 'Turtle', 'gorila': 'Gorilla',
  'capivara': 'Capybara', 'tamanduá': 'Anteater', 'tamandua': 'Anteater', 'tigre': 'Tiger',
  'cobra': 'Snake', 'pinguim': 'Penguin',
  // Oceano
  'tubarão': 'Shark', 'tubarao': 'Shark', 'golfinho': 'Dolphin', 'baleia': 'Whale',
  'peixe-palhaço': 'Clownfish', 'peixe-palhaco': 'Clownfish', 'água-viva': 'Jellyfish',
  'agua-viva': 'Jellyfish', 'polvo': 'Octopus', 'estrela-do-mar': 'Starfish',
  'cavalo-marinho': 'Seahorse', 'caranguejo': 'Crab', 'foca': 'Seal', 'baiacu': 'Pufferfish',
  // Fazenda
  'cordeiro': 'Lamb', 'ovelha': 'Sheep', 'vaca': 'Cow', 'bezerro': 'Calf', 'porco': 'Pig',
  'cavalo': 'Horse', 'galinha': 'Hen', 'pintinho': 'Chick', 'pato': 'Duck', 'coelho': 'Rabbit',
  'cabra': 'Goat', 'burro': 'Donkey', 'peru': 'Turkey', 'ganso': 'Goose',
  // Domésticos
  'cachorro': 'Dog', 'gato': 'Cat', 'hamster': 'Hamster', 'ouriço': 'Hedgehog',
  'ourico': 'Hedgehog', 'porquinho-da-índia': 'Guinea Pig', 'periquito': 'Parakeet',
  'peixe': 'Fish', 'filhote': 'Puppy',
  // Ártico / Floresta
  'urso-polar': 'Polar Bear', 'urso': 'Bear', 'raposa': 'Fox', 'lobo': 'Wolf',
  'alce': 'Moose', 'rena': 'Reindeer', 'coruja': 'Owl', 'esquilo': 'Squirrel',
  'castor': 'Beaver', 'guaxinim': 'Raccoon', 'búfalo': 'Buffalo', 'bufalo': 'Buffalo',
  'veado': 'Deer', 'leopardo-das-neves': 'Snow Leopard', 'passarinho': 'Bird', 'pássaro': 'Bird',
};

/** Capitaliza cada palavra. */
function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Resolve o melhor nome em inglês para um item do histórico.
 * Ordem: animal_en (se válido) -> dicionário PT -> título do PT -> vazio.
 * Retorna '' quando não consegue resolver (para o usuário preencher).
 */
export function resolveEnglishName(item) {
  const en = (item.animal_en || '').trim();
  // animal_en válido (não é placeholder de capa/untitled/id do drive)
  if (en && !/^untitled$/i.test(en) && !en.endsWith('-book-cover') && !en.startsWith('drive-')) {
    // remove sufixos tipo "baby lion cub" -> mantém legível
    return titleCase(en.replace(/[_-]+/g, ' ').trim());
  }
  const pt = (item.animal_pt || '').trim().toLowerCase();
  if (pt && PT_TO_EN[pt]) return PT_TO_EN[pt];
  // tenta sem acento
  const noAccent = pt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (noAccent && PT_TO_EN[noAccent]) return PT_TO_EN[noAccent];
  return '';
}
