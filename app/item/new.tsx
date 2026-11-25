import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ItemForm } from '@/components/item-form';
import { createItem } from '@/db/items';

export default function NewItemScreen() {
  const db = useSQLiteContext();

  return (
    <ItemForm
      submitLabel="Save item"
      onSubmit={async (item) => {
        const id = await createItem(db, item);
        // Swap this form for the new item's page, so "back" returns to the list.
        router.replace(`/item/${id}`);
      }}
    />
  );
}
