import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { SearchInput } from '@/components/common/SearchInput';
import { CreateFoodDialog } from '@/features/foods/components/CreateFoodDialog.tsx';
import { useFoods } from '@/features/foods/hooks/useFoods.ts';
import type { Food } from '@/types/food.types.ts';
import type { CreateFoodInput } from '@/types/food.types.ts';
import type { UnitType } from '@/types/unit.types.ts';
import { getAvailableUnitsForFood } from '@/utils/convertUnit.ts';
import { searchFoods } from '@/utils/searchFoods.ts';

interface AddIngredientDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (food: Food, quantity: number, unit: UnitType) => void;
}

export function AddIngredientDialog({ open, onClose, onAdd }: AddIngredientDialogProps) {
  const { foods, createFood, isCreating } = useFoods();
  const [query, setQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<UnitType>('g');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const trimmedQuery = query.trim();
  const results = useMemo(() => searchFoods(foods, query, 12), [foods, query]);
  const showCreateFromSearch = trimmedQuery.length > 0 && results.length === 0;
  const availableUnits = selectedFood ? getAvailableUnitsForFood(selectedFood) : [];

  const handleClose = () => {
    setQuery('');
    setSelectedFood(null);
    setQuantity(1);
    setUnit('g');
    onClose();
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setUnit(food.defaultServing.unit);
    setQuantity(1);
  };

  const handleAdd = () => {
    if (!selectedFood || quantity <= 0) {
      return;
    }

    onAdd(selectedFood, quantity, unit);
    handleClose();
  };

  const handleCreateFood = async (input: CreateFoodInput) => {
    const food = await createFood(input);
    handleSelectFood(food);
    setCreateDialogOpen(false);
    return food;
  };

  return (
    <>
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add ingredient</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {!selectedFood ? (
            <>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search foods..."
                fullWidth
              />
              <List disablePadding sx={{ maxHeight: 320, overflow: 'auto' }}>
                {results.map((food) => (
                  <ListItemButton key={food.id} onClick={() => handleSelectFood(food)}>
                    <ListItemText primary={food.name} secondary={food.category} />
                  </ListItemButton>
                ))}
              </List>
              {showCreateFromSearch && (
                <Stack spacing={1.5} sx={{ py: 2, alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No foods found for &ldquo;{trimmedQuery}&rdquo;
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddOutlinedIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    Add &ldquo;{trimmedQuery}&rdquo;
                  </Button>
                </Stack>
              )}
            </>
          ) : (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                {selectedFood.name}
              </Typography>
              <Stack direction="row" spacing={1.5}>
                <TextField
                  type="number"
                  label="Amount"
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  slotProps={{ htmlInput: { min: 0.1, step: 0.5 } }}
                  fullWidth
                />
                <TextField
                  select
                  label="Unit"
                  value={unit}
                  onChange={(event) => setUnit(event.target.value as UnitType)}
                  fullWidth
                >
                  {availableUnits.map((item) => (
                    <MenuItem key={item.unit} value={item.unit}>
                      {item.label ?? item.unit}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Button size="small" sx={{ mt: 1 }} onClick={() => setSelectedFood(null)}>
                Choose different food
              </Button>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={handleAdd}
          disabled={!selectedFood || quantity <= 0}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>

    <CreateFoodDialog
      open={createDialogOpen}
      onClose={() => setCreateDialogOpen(false)}
      onSubmit={handleCreateFood}
      isSubmitting={isCreating}
      initialValues={{ name: trimmedQuery }}
    />
    </>
  );
}
