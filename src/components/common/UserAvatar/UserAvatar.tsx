import { Avatar, type AvatarProps } from '@mui/material';

function getInitials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

interface UserAvatarProps extends Omit<AvatarProps, 'children' | 'src'> {
  name?: string;
  photoURL?: string;
}

export function UserAvatar({ name, photoURL, sx, ...avatarProps }: UserAvatarProps) {
  return (
    <Avatar
      src={photoURL}
      alt={name ? `${name} profile photo` : 'Profile photo'}
      slotProps={{
        img: { referrerPolicy: 'no-referrer' },
      }}
      sx={{
        bgcolor: 'primary.main',
        fontWeight: 700,
        ...sx,
      }}
      {...avatarProps}
    >
      {getInitials(name)}
    </Avatar>
  );
}
