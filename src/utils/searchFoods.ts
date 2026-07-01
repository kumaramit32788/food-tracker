import type { Food, FoodSearchResult } from '@/types/food.types.ts';

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function tokenize(text: string): string[] {
  return normalizeSearchText(text).split(/[^a-z0-9]+/).filter(Boolean);
}

/** True when query matches the start of text as its own term (egg → egg white, not eggplant). */
function startsWithWordPrefix(text: string, query: string): boolean {
  if (!text.startsWith(query)) {
    return false;
  }
  if (text.length === query.length) {
    return true;
  }
  return !/[a-z0-9]/.test(text[query.length] ?? '');
}

function scoreWordPrefix(word: string, query: string, baseScore: number): number {
  if (!word.startsWith(query)) {
    return 0;
  }
  if (word === query) {
    return baseScore;
  }
  return baseScore - (word.length - query.length) * 8;
}

function scoreTextTokens(tokens: string[], query: string, exactScore: number, prefixScore: number): number {
  let best = 0;

  for (const token of tokens) {
    if (token === query) {
      best = Math.max(best, exactScore);
    } else {
      best = Math.max(best, scoreWordPrefix(token, query, prefixScore));
    }
  }

  return best;
}

function getMatchScore(food: Food, query: string): number {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return 1;
  }

  const normalizedName = normalizeSearchText(food.name);
  const nameTokens = tokenize(food.name);

  if (normalizedName === normalizedQuery) {
    return 1000;
  }

  if (startsWithWordPrefix(normalizedName, normalizedQuery)) {
    return 950;
  }

  if (nameTokens[0] === normalizedQuery) {
    return 930;
  }

  const firstWordPrefixScore = nameTokens[0]
    ? scoreWordPrefix(nameTokens[0], normalizedQuery, 910)
    : 0;
  if (firstWordPrefixScore > 0) {
    return firstWordPrefixScore;
  }

  const nameWordScore = scoreTextTokens(nameTokens, normalizedQuery, 880, 860);
  if (nameWordScore > 0) {
    return nameWordScore;
  }

  for (const alias of food.aliases) {
    const normalizedAlias = normalizeSearchText(alias);
    const aliasTokens = tokenize(alias);

    if (normalizedAlias === normalizedQuery) {
      return 840;
    }

    if (startsWithWordPrefix(normalizedAlias, normalizedQuery)) {
      return 820;
    }

    const aliasWordScore = scoreTextTokens(aliasTokens, normalizedQuery, 800, 780);
    if (aliasWordScore > 0) {
      return aliasWordScore;
    }
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 650;
  }

  if (food.aliases.some((alias) => normalizeSearchText(alias).includes(normalizedQuery))) {
    return 620;
  }

  if (food.searchText.includes(normalizedQuery)) {
    return 580;
  }

  if (food.tags.some((tag) => normalizeSearchText(tag).includes(normalizedQuery))) {
    return 540;
  }

  const tokens = normalizedQuery.split(' ').filter(Boolean);

  if (tokens.every((token) => food.searchText.includes(token))) {
    return 500;
  }

  return 0;
}

export function buildSearchText(input: {
  name: string;
  aliases?: string[];
  tags?: string[];
  category?: string;
  subcategory?: string;
}): string {
  return normalizeSearchText(
    [input.name, ...(input.aliases ?? []), ...(input.tags ?? []), input.category, input.subcategory]
      .filter(Boolean)
      .join(' '),
  );
}

function compareSearchResults(a: FoodSearchResult, b: FoodSearchResult): number {
  if (b.matchScore !== a.matchScore) {
    return b.matchScore - a.matchScore;
  }

  const aTokens = tokenize(a.name).length;
  const bTokens = tokenize(b.name).length;
  if (aTokens !== bTokens) {
    return aTokens - bTokens;
  }

  const nameLengthDiff = a.name.length - b.name.length;
  if (nameLengthDiff !== 0) {
    return nameLengthDiff;
  }

  if (a.isFavorite !== b.isFavorite) {
    return a.isFavorite ? -1 : 1;
  }

  return a.name.localeCompare(b.name);
}

export function searchFoods(foods: Food[], query: string, limit = 50): FoodSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return foods
      .slice()
      .sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }

        const aTime = a.lastUsedAt ? Date.parse(a.lastUsedAt) : 0;
        const bTime = b.lastUsedAt ? Date.parse(b.lastUsedAt) : 0;
        return bTime - aTime;
      })
      .slice(0, limit)
      .map((food) => ({ ...food, matchScore: 1 }));
  }

  return foods
    .map((food) => ({
      ...food,
      matchScore: getMatchScore(food, normalizedQuery),
    }))
    .filter((food) => food.matchScore > 0)
    .sort(compareSearchResults)
    .slice(0, limit);
}

export function groupSearchResults(results: FoodSearchResult[]) {
  const favorites = results.filter((food) => food.isFavorite);
  const recent = results
    .filter((food) => !food.isFavorite && food.lastUsedAt)
    .sort((a, b) => Date.parse(b.lastUsedAt ?? '0') - Date.parse(a.lastUsedAt ?? '0'))
    .slice(0, 10);
  const recentIds = new Set(recent.map((food) => food.id));
  const favoriteIds = new Set(favorites.map((food) => food.id));
  const others = results.filter((food) => !favoriteIds.has(food.id) && !recentIds.has(food.id));

  return { favorites, recent, others };
}
