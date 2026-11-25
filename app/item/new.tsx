import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ItemForm } from '@/components/item-form';
import { createItem } from '@/db/items';

export default function NewItemScreen() {
  const db = useSQLiteContext();

  return (
    <ItemForm
      submitLabel="Save item"
      showTemplates
      onSubmit={async (item, templateId) => {
        const id = await createItem(db, item);
        // Swap this form for the new item's page, so "back" returns to the list.
        router.replace({ pathname: '/item/[id]', params: { id } });
        // Started from a template: go straight on to its ready-filled reminder.
        if (templateId) {
          router.push({ pathname: '/reminder/new', params: { itemId: id, template: templateId } });
        }
      }}
    />
  );
}
