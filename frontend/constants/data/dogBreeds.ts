export type DogBreed = 
  | 'labrador_retriever'
  | 'german_shepherd_dog'
  | 'golden_retriever'
  | 'french_bulldog'
  | 'bulldog'
  | 'beagle'
  | 'poodle'
  | 'rottweiler'
  | 'german_shorthaired_pointer'
  | 'yorkshire_terrier'
  | 'dachshund'
  | 'siberian_husky'
  | 'great_dane'
  | 'pomeranian'
  | 'boston_terrier'
  | 'shih_tzu'
  | 'cocker_spaniel'
  | 'border_collie'
  | 'pug'
  | 'chihuahua'
  | 'boxer'
  | 'australian_shepherd'
  | 'cavalier_king_charles_spaniel'
  | 'maltese'
  | 'doberman_pinscher'
  | 'pembroke_welsh_corgi'
  | 'shetland_sheepdog'
  | 'havanese'
  | 'bernese_mountain_dog'
  | 'brittany'
  | 'english_springer_spaniel'
  | 'mastiff'
  | 'vizsla'
  | 'weimaraner'
  | 'miniature_schnauzer'
  | 'basset_hound'
  | 'belgian_malinois'
  | 'newfoundland'
  | 'collie'
  | 'rhodesian_ridgeback'
  | 'shiba_inu'
  | 'west_highland_white_terrier'
  | 'bichon_frise'
  | 'bloodhound'
  | 'akita'
  | 'portuguese_water_dog'
  | 'papillon'
  | 'saint_bernard'
  | 'bull_terrier'
  | 'soft_coated_wheaten_terrier'
  | 'airedale_terrier'
  | 'unknown'
  | 'other';


export interface BreedOption {
  value: DogBreed;
  label: string;
}

export const DOG_BREEDS: BreedOption[] = [
  { value: 'labrador_retriever', label: 'Labrador Retriever' },
  { value: 'german_shepherd_dog', label: 'German Shepherd Dog' },
  { value: 'golden_retriever', label: 'Golden Retriever' },
  { value: 'french_bulldog', label: 'French Bulldog' },
  { value: 'bulldog', label: 'Bulldog' },
  { value: 'beagle', label: 'Beagle' },
  { value: 'poodle', label: 'Poodle' },
  { value: 'rottweiler', label: 'Rottweiler' },
  { value: 'german_shorthaired_pointer', label: 'German Shorthaired Pointer' },
  { value: 'yorkshire_terrier', label: 'Yorkshire Terrier' },
  { value: 'dachshund', label: 'Dachshund' },
  { value: 'siberian_husky', label: 'Siberian Husky' },
  { value: 'great_dane', label: 'Great Dane' },
  { value: 'pomeranian', label: 'Pomeranian' },
  { value: 'boston_terrier', label: 'Boston Terrier' },
  { value: 'shih_tzu', label: 'Shih Tzu' },
  { value: 'cocker_spaniel', label: 'Cocker Spaniel' },
  { value: 'border_collie', label: 'Border Collie' },
  { value: 'pug', label: 'Pug' },
  { value: 'chihuahua', label: 'Chihuahua' },
  { value: 'boxer', label: 'Boxer' },
  { value: 'australian_shepherd', label: 'Australian Shepherd' },
  { value: 'cavalier_king_charles_spaniel', label: 'Cavalier King Charles Spaniel' },
  { value: 'maltese', label: 'Maltese' },
  { value: 'doberman_pinscher', label: 'Doberman Pinscher' },
  { value: 'pembroke_welsh_corgi', label: 'Pembroke Welsh Corgi' },
  { value: 'shetland_sheepdog', label: 'Shetland Sheepdog' },
  { value: 'havanese', label: 'Havanese' },
  { value: 'bernese_mountain_dog', label: 'Bernese Mountain Dog' },
  { value: 'brittany', label: 'Brittany' },
  { value: 'english_springer_spaniel', label: 'English Springer Spaniel' },
  { value: 'mastiff', label: 'Mastiff' },
  { value: 'vizsla', label: 'Vizsla' },
  { value: 'weimaraner', label: 'Weimaraner' },
  { value: 'miniature_schnauzer', label: 'Miniature Schnauzer' },
  { value: 'basset_hound', label: 'Basset Hound' },
  { value: 'belgian_malinois', label: 'Belgian Malinois' },
  { value: 'newfoundland', label: 'Newfoundland' },
  { value: 'collie', label: 'Collie' },
  { value: 'rhodesian_ridgeback', label: 'Rhodesian Ridgeback' },
  { value: 'shiba_inu', label: 'Shiba Inu' },
  { value: 'west_highland_white_terrier', label: 'West Highland White Terrier' },
  { value: 'bichon_frise', label: 'Bichon Frise' },
  { value: 'bloodhound', label: 'Bloodhound' },
  { value: 'akita', label: 'Akita' },
  { value: 'portuguese_water_dog', label: 'Portuguese Water Dog' },
  { value: 'papillon', label: 'Papillon' },
  { value: 'saint_bernard', label: 'Saint Bernard' },
  { value: 'bull_terrier', label: 'Bull Terrier' },
  { value: 'soft_coated_wheaten_terrier', label: 'Soft Coated Wheaten Terrier' },
  { value: 'airedale_terrier', label: 'Airedale Terrier' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'other', label: 'Other (Custom)' },
];

export const searchBreeds = (query: string): BreedOption[] => {
  if (!query) return DOG_BREEDS;
  
  const lowerQuery = query.toLowerCase();
  return DOG_BREEDS.filter(breed =>
    breed.label.toLowerCase().includes(lowerQuery)
  );
};