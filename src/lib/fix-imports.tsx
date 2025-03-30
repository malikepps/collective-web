// Test file to verify imports
import { db } from '@/lib/firebase/config';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

// This file is just for testing imports
export default function TestImports() {
  console.log("Firebase imports working!");
  return <div>Import test</div>
} 