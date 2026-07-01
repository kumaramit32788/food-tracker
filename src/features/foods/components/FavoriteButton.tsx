import StarIcon from '@mui/icons-material/Star';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';

interface FavoriteButtonProps {
  isFavorite: boolean;
  isLoading?: boolean;
  onToggle: () => void;
  size?: 'small' | 'medium';
}

export function FavoriteButton({
  isFavorite,
  isLoading = false,
  onToggle,
  size = 'small',
}: FavoriteButtonProps) {
  return (
    <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
      <span>
        <IconButton
          size={size}
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          disabled={isLoading}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          sx={{ color: isFavorite ? 'warning.main' : 'text.secondary' }}
        >
          {isLoading ? (
            <CircularProgress size={18} color="inherit" />
          ) : isFavorite ? (
            <StarIcon fontSize="small" />
          ) : (
            <StarBorderOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}
