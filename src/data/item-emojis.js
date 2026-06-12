/**
 * Mapa de emoji específico para cada item dos 16 temas.
 * Quando o emoji exato não existe, usamos o mais próximo possível.
 */
export const ITEM_EMOJIS = {
  // ─── Selva ───
  lion: '🦁', jaguar: '🐆', elephant: '🐘', giraffe: '🦒', monkey: '🐒',
  toucan: '🦜', sloth: '🦥', hippopotamus: '🦛', zebra: '🦓', rhinoceros: '🦏',
  crocodile: '🐊', flamingo: '🦩', parrot: '🦜', turtle: '🐢', gorilla: '🦍',
  capybara: '🦫', anteater: '🐜', tiger: '🐅', snake: '🐍', penguin: '🐧',

  // ─── Fazenda ───
  cow: '🐄', pig: '🐷', chicken: '🐔', sheep: '🐑', horse: '🐴',
  goat: '🐐', duck: '🦆', rabbit: '🐰', dog: '🐶', cat: '🐱',
  rooster: '🐓', turkey: '🦃', donkey: '🫏', bull: '🐂', goose: '🪿',
  lamb: '🐑', piglet: '🐷', calf: '🐄', chick: '🐥', llama: '🦙',

  // ─── Oceano ───
  dolphin: '🐬', shark: '🦈', whale: '🐳', octopus: '🐙', crab: '🦀',
  clownfish: '🐠', seahorse: '🐡', jellyfish: '🪼', lobster: '🦞', starfish: '⭐',
  seal: '🦭', otter: '🦦', pufferfish: '🐡', 'manta ray': '🐟', narwhal: '🐳',
  'beluga whale': '🐳', 'sea lion': '🦭', shrimp: '🦐', anglerfish: '🐟', 'sea turtle': '🐢',

  // ─── Floresta ───
  deer: '🦌', bear: '🐻', wolf: '🐺', fox: '🦊', owl: '🦉',
  squirrel: '🐿️', raccoon: '🦝', hedgehog: '🦔', moose: '🫎', beaver: '🦫',
  woodpecker: '🐦', skunk: '🦨', lynx: '🐈‍⬛', 'wild boar': '🐗', badger: '🦡',
  hummingbird: '🐦', butterfly: '🦋', frog: '🐸', robin: '🐦', 'black bear': '🐻',

  // ─── Ártico ───
  'polar bear': '🐻‍❄️', walrus: '🦭', 'arctic fox': '🦊', 'snowy owl': '🦉',
  reindeer: '🦌', orca: '🐳', 'snow leopard': '🐆', 'arctic hare': '🐇',
  puffin: '🐧', wolverine: '🐺', 'musk ox': '🐂', 'arctic wolf': '🐺',
  ermine: '🦫', 'harp seal': '🦭', lemming: '🐹', ptarmigan: '🦅',

  // ─── Domésticos ───
  goldfish: '🐠', hamster: '🐹', 'guinea pig': '🐹', canary: '🐦',
  budgerigar: '🦜', gecko: '🦎', chinchilla: '🐭', ferret: '🦡',
  axolotl: '🦎', 'mini pig': '🐷', parakeet: '🦜', cockatoo: '🦜',
  iguana: '🦎', 'bearded dragon': '🦎',


  // ─── Personagens Originais ───
  'brave cowboy toy': '🤠',
  'friendly space ranger toy': '🚀',
  'toy dinosaur': '🦕',
  'toy piggy bank': '🐷',
  'toy robot': '🤖',
  'little piglet in rain boots': '🐷',
  'daddy pig with glasses': '🐷',
  'bunny in overalls': '🐰',
  'tiny fairy with flower wings': '🧚',
  'little mermaid with starfish crown': '🧜',
  'little alien with antenna': '👽',
  'baby astronaut floating': '👨‍🚀',
  'friendly planet with face': '🪐',
  'tiny fire breathing dragon': '🐉',
  'baby unicorn foal': '🦄',
  'little wizard with big hat': '🧙',
  'cute monster with hearts': '👾',
  'little superhero kid with cape': '🦸',
  'tiny robot hero': '🤖',
  'baby ninja kitten': '🐱',
  // ─── Dinossauros ───
  'T-Rex': '🦖', triceratops: '🦕', brachiosaurus: '🦕', stegosaurus: '🦕',
  velociraptor: '🦖', pterodactyl: '🦅', ankylosaurus: '🦕', diplodocus: '🦕',
  spinosaurus: '🦖', parasaurolophus: '🦕', iguanodon: '🦕', allosaurus: '🦖',
  carnotaurus: '🦖', mosasaurus: '🦈', dimetrodon: '🦎', dilophosaurus: '🦖',
  pachycephalosaurus: '🦕', therizinosaurus: '🦕', oviraptor: '🦖', argentinosaurus: '🦕',

  // ─── Profissões ───
  doctor: '👨‍⚕️', firefighter: '👨‍🚒', teacher: '👨‍🏫', chef: '👨‍🍳',
  'police officer': '👮', astronaut: '👨‍🚀', nurse: '👩‍⚕️', engineer: '👨‍🔧',
  pilot: '👨‍✈️', artist: '👨‍🎨', farmer: '👨‍🌾', dentist: '🦷',
  veterinarian: '👨‍⚕️', scientist: '👨‍🔬', builder: '👷', baker: '👨‍🍳',
  sailor: '⛵', librarian: '📚', musician: '🎵', gardener: '👨‍🌾',

  // ─── Veículos ───
  car: '🚗', truck: '🚚', motorcycle: '🏍️', bicycle: '🚲',
  airplane: '✈️', helicopter: '🚁', ship: '🚢', sailboat: '⛵',
  submarine: '🚤', train: '🚂', 'racing car': '🏎️', tractor: '🚜',
  ambulance: '🚑', 'fire truck': '🚒', 'school bus': '🚌', 'police car': '🚓',
  'hot air balloon': '🎈', rocket: '🚀', 'monster truck': '🚙', bulldozer: '🚜',

  // ─── Esportes ───
  soccer: '⚽', basketball: '🏀', swimming: '🏊', gymnastics: '🤸',
  tennis: '🎾', surfing: '🏄', skateboarding: '🛹', volleyball: '🏐',
  cycling: '🚴', karate: '🥋', judo: '🥋', baseball: '⚾',
  golf: '⛳', archery: '🏹', skiing: '⛷️', 'ice skating': '⛸️',
  'rock climbing': '🧗', boxing: '🥊', yoga: '🧘', dancing: '💃',

  // ─── Frutas/Vegetais ───
  apple: '🍎', banana: '🍌', strawberry: '🍓', watermelon: '🍉',
  orange: '🍊', pineapple: '🍍', grape: '🍇', cherry: '🍒',
  mango: '🥭', coconut: '🥥', carrot: '🥕', broccoli: '🥦',
  corn: '🌽', tomato: '🍅', pumpkin: '🎃', pear: '🍐',
  lemon: '🍋', avocado: '🥑', kiwi: '🥝', blueberry: '🫐',

  // ─── Espaço ───
  moon: '🌙', sun: '☀️', alien: '👽', UFO: '🛸',
  Saturn: '🪐', Mars: '🔴', Jupiter: '🪐', comet: '☄️',
  satellite: '🛰️', 'space station': '🛰️', 'Mars rover': '🤖',
  telescope: '🔭', meteor: '☄️', 'black hole': '⚫', galaxy: '🌌',
  'space suit': '👨‍🚀', star: '⭐', 'planet Earth': '🌍',

  // ─── Princesas/Fadas ───
  princess: '👸', fairy: '🧚', unicorn: '🦄', mermaid: '🧜‍♀️',
  castle: '🏰', crown: '👑', 'magic wand': '🪄', dragon: '🐉',
  knight: '🛡️', 'fairy godmother': '🧚', 'magic mirror': '🪞',
  carriage: '🛞', 'enchanted rose': '🌹', 'magic lamp': '🪔',
  'flying carpet': '🧞', 'crystal ball': '🔮', rainbow: '🌈',
  'butterfly wings': '🦋', 'treasure chest': '💎', 'magic book': '📖',

  // ─── Natal ───
  'Santa Claus': '🎅', 'Christmas tree': '🎄', elf: '🧝',
  snowman: '⛄', ornament: '🎁', gift: '🎁', 'candy cane': '🍬',
  wreath: '🎄', stocking: '🧦', 'Christmas star': '⭐', gingerbread: '🍪',
  sleigh: '🛷', bells: '🔔', snowflake: '❄️', 'Christmas lights': '💡',
  nutcracker: '🥜', 'Christmas cookie': '🍪', chimney: '🏠',

  // ─── Páscoa ───
  'Easter bunny': '🐰', 'Easter egg': '🥚', basket: '🧺',
  flowers: '🌸', nest: '🥚', tulip: '🌷', lily: '🌼', sunflower: '🌻',
  'spring bird': '🐦', honeybee: '🐝', caterpillar: '🐛', cocoon: '🐛',
  garden: '🌿', 'watering can': '🪣',

  // ─── Halloween ───
  ghost: '👻', witch: '🧙‍♀️', bat: '🦇', spider: '🕷️',
  skeleton: '💀', vampire: '🧛', werewolf: '🐺', 'black cat': '🐈‍⬛',
  'haunted house': '🏚️', cauldron: '🍲', zombie: '🧟', mummy: '🧟',
  'full moon': '🌕', candy: '🍬', scarecrow: '🌾', 'spider web': '🕸️',
  grave: '🪦', potion: '🧪',
};

/**
 * Retorna o emoji do item ou um fallback (emoji do tema).
 */
export function getItemEmoji(itemEn, themeEmoji = '✨') {
  return ITEM_EMOJIS[itemEn] || themeEmoji;
}
