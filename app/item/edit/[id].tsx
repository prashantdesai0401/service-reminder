import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { ItemForm } from '@/components/item-form';
import { getItem, updateItem, type Item } from '@/db/items';

export default function EditItemScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    getItem(db, Number(id)).then(setItem);
  }, [db, id]);

  if (!item) return null;

  return (
    <ItemForm
      initial={{ name: item.name, category: item.category, notes: item.notes ?? '' }}
      submitLabel="Save changes"
      onSubmit={async (changes) => {
        await updateItem(db, item.id, changes);
        router.back();
      }}
    />
  );
}
