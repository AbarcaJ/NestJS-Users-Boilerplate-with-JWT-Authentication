import { SetMetadata } from '@nestjs/common';

export const META_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(META_PUBLIC_KEY, true);
