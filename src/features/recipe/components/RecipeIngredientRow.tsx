import { appRadius } from '@/constants/shape.ts';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { RecipeIngredientDraft } from '@/types/recipe.types.ts';
import type { UnitType } from '@/types/unit.types.ts';
import { getAvailableUnitsForFood } from '@/utils/convertUnit.ts';
import { bindNumberInputState } from '@/utils/bindNumberField.ts';
import type { Food } from '@/types/food.types.ts';

interface RecipeIngredientRowProps {
  ingredient: RecipeIngredientDraft;
  food?: Food;
  onChange: (ingredient: RecipeIngredientDraft) => void;
  onRemove: () => void;
}

export function RecipeIngredientRow({
  ingredient,
  food,
  onChange,
  onRemove,
}: RecipeIngredientRowProps) {
  const units = food ? getAvailableUnitsForFood(food) : [];

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: appRadius.sm,
        border: '1px solid',
        borderColor: 'divider',
        alignItems: { sm: 'center' },
      }}
    >
      <Typography variant="body2" sx={{ flex: 1, fontWeight: 600, minWidth: 0 }}>
        {ingredient.foodName}
      </Typography>

      <TextField
        size="small"
        label="Amount"
        {...bindNumberInputState(ingredient.quantity, (quantity) =>
          onChange({ ...ingredient, quantity }),
        )}
        slotProps={{ htmlInput: { min: 0.1, step: 0.5 } }}
        sx={{ width: { xs: '100%', sm: 110 } }}
      />

      <TextField
        select
        size="small"
        label="Unit"
        value={ingredient.unit}
        onChange={(event) =>
          onChange({ ...ingredient, unit: event.target.value as UnitType })
        }
        sx={{ width: { xs: '100%', sm: 130 } }}
      >
        {units.map((unit) => (
          <MenuItem key={unit.unit} value={unit.unit}>
            {unit.label ?? unit.unit}
          </MenuItem>
        ))}
      </TextField>

      <IconButton color="error" onClick={onRemove} aria-label="Remove ingredient">
        <DeleteOutlineOutlinedIcon />
      </IconButton>
    </Stack>
  );
}
