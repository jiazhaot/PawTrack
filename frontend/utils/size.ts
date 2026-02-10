// >=25 kg big dog
const LARGE_WEIGHT_KG = 25;
const MEDIUM_WEIGHT_KG = 15;

const LARGE_BREEDS = new Set([
  "labrador_retriever",
  "german_shepherd_dog",
  "golden_retriever",
  "rottweiler",
  "german_shorthaired_pointer",
  "siberian_husky",
  "great_dane",
  "boxer",
  "australian_shepherd",
  "doberman_pinscher",
  "bernese_mountain_dog",
  "english_springer_spaniel",
  "mastiff",
  "vizsla",
  "weimaraner",
  "belgian_malinois",
  "newfoundland",
  "collie",
  "rhodesian_ridgeback",
  "bloodhound",
  "akita",
  "saint_bernard",
  "airedale_terrier"
]);

export function computeDogSize(breed?: string, weight?: number): 'small' | 'medium' | 'big' {
  if (typeof weight === "number" && !Number.isNaN(weight)) {
    if (weight >= LARGE_WEIGHT_KG) return "big";
    if (weight >= MEDIUM_WEIGHT_KG) return "medium";
    if (weight > 0) return "small";
  }

  if (breed && LARGE_BREEDS.has(breed)) return "big";

  return "small";
}