#!/bin/bash

# Find all TypeScript files
find ./app/api -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  # Replace Clerk imports with NextAuth
  sed -i '' 's/import { auth } from "@clerk\/nextjs";/import { getAuthSession } from "@\/lib\/auth-helper";/g' "$file"
  sed -i '' 's/import { auth, currentUser } from "@clerk\/nextjs";/import { getAuthSession } from "@\/lib\/auth-helper";/g' "$file"
  sed -i '' 's/const { userId } = await auth();/const { userId } = await getAuthSession();/g' "$file"
  sed -i '' 's/const user = await currentUser();/const { user } = await getAuthSession();/g' "$file"
done

# Find all TypeScript files in pages/api
find ./pages/api -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  # Replace Clerk imports with NextAuth
  sed -i '' 's/import { auth } from "@clerk\/nextjs";/import { getAuthSession } from "@\/lib\/auth-helper";/g' "$file"
  sed -i '' 's/import { auth, currentUser } from "@clerk\/nextjs";/import { getAuthSession } from "@\/lib\/auth-helper";/g' "$file"
  sed -i '' 's/const { userId } = await auth();/const { userId } = await getAuthSession();/g' "$file"
  sed -i '' 's/const user = await currentUser();/const { user } = await getAuthSession();/g' "$file"
done
