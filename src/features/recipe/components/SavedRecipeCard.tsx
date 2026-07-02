import { appRadius } from '@/constants/shape.ts';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RamenDiningOutlinedIcon from '@mui/icons-material/RamenDiningOutlined';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { Recipe } from '@/types/recipe.types.ts';
import { formatCalories } from '@/utils/formatNutrition.ts';

interface SavedRecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export function SavedRecipeCard({ recipe, onSelect, onDelete }: SavedRecipeCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={() => onSelect(recipe)} sx={{ height: '100%' }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: appRadius.sm,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                }}
              >
                <RamenDiningOutlinedIcon fontSize="small" />
              </Box>
              <IconButton
                size="small"
                color="error"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(recipe);
                }}
                aria-label="Delete recipe"
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {recipe.name}
            </Typography>

            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              <Chip label={recipe.category} size="small" variant="outlined" />
              <Chip label={`${recipe.servings} servings`} size="small" variant="outlined" />
              <Chip label={`${recipe.ingredients.length} items`} size="small" variant="outlined" />
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {formatCalories(recipe.nutritionPerServing.calories)} per serving
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
