/**
 * This file re-exports Firebase instances from the config file
 * to maintain compatibility with imports from '@/lib/firebase'
 */

import { auth, db, storage } from './config';

export { auth, db, storage }; 