import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { appRadius } from '@/constants/shape.ts';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { AddIngredientDialog } from '@/features/recipe/components/AddIngredientDialog.tsx';
import { RecipeIngredientRow } from '@/features/recipe/components/RecipeIngredientRow.tsx';
import { useFoods } from '@/features/foods/hooks/useFoods.ts';
import type { RecipeIngredientDraft } from '@/types/recipe.types.ts';
import type { Food } from '@/types/food.types.ts';
import type { UnitType } from '@/types/unit.types.ts';

interface IngredientBuilderSectionProps {
  ingredients: RecipeIngredientDraft[];
  onIngredientsChange: (ingredients: RecipeIngredientDraft[]) => void;
}

export function IngredientBuilderSection({
  ingredients,
  onIngredientsChange,
}: IngredientBuilderSectionProps) {
  const { getFoodById } = useFoods();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleAdd = (food: Food, quantity: number, unit: UnitType) => {
    onIngredientsChange([
      ...ingredients,
      {
        id: crypto.randomUUID(),
        foodId: food.id,
        foodName: food.name,
        quantity,
        unit,
      },
    ]);
  };

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Ingredients ({ingredients.length})
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add ingredient
        </Button>
      </Stack>

      {ingredients.length === 0 ? (
        <Box
          sx={{
            py: 3,
            px: 2,
            textAlign: 'center',
            borderRadius: appRadius.sm,
            border: 1,
            borderColor: 'divider',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add foods from your database. Nutrition is calculated automatically.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add first ingredient
          </Button>
        </Box>
      ) : (
        <Stack spacing={1}>
          {ingredients.map((ingredient) => (
            <RecipeIngredientRow
              key={ingredient.id}
              ingredient={ingredient}
              food={getFoodById(ingredient.foodId) ?? undefined}
              onChange={(updated) =>
                onIngredientsChange(
                  ingredients.map((item) => (item.id === updated.id ? updated : item)),
                )
              }
              onRemove={() =>
                onIngredientsChange(ingredients.filter((item) => item.id !== ingredient.id))
              }
            />
          ))}
        </Stack>
      )}

      <AddIngredientDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}
