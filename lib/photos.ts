import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Photos are copied into the app's own storage (so they survive even if the original is
 * deleted from the gallery). The database stores only the file NAME; the full path is
 * worked out here, because the app's storage folder can move when the app is updated.
 */

const isWeb = Platform.OS === 'web';

function photosDir() {
  const dir = new Directory(Paths.document, 'photos');
  dir.create({ idempotent: true });
  return dir;
}

/** Turns a stored name back into something an <Image> can show. */
export function photoUri(stored: string) {
  if (isWeb || stored.includes('://')) return stored;
  return new File(photosDir(), stored).uri;
}

async function saveAsset(asset: ImagePicker.ImagePickerAsset) {
  if (isWeb) return asset.uri; // Browser preview only; not kept after reload.
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  new File(asset.uri).copy(new File(photosDir(), name));
  return name;
}

async function pick(source: 'camera' | 'library') {
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
  if (source === 'camera') {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Camera blocked', 'Allow camera access in your phone settings to take photos.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync(options);
    return result.canceled ? null : result.assets[0];
  }
  const result = await ImagePicker.launchImageLibraryAsync(options);
  return result.canceled ? null : result.assets[0];
}

/**
 * Asks "Take photo" or "Choose from gallery", then saves the picked photo.
 * Resolves to the stored name, or null if the user cancelled.
 */
export function choosePhoto(): Promise<string | null> {
  const run = async (source: 'camera' | 'library') => {
    const asset = await pick(source);
    return asset ? saveAsset(asset) : null;
  };

  if (isWeb) return run('library');

  return new Promise((resolve) => {
    Alert.alert(
      'Add photo',
      'Bill, receipt, warranty card or prepaid voucher',
      [
        { text: 'Take photo', onPress: () => run('camera').then(resolve) },
        { text: 'Choose from gallery', onPress: () => run('library').then(resolve) },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
}

/** Removes stored photo files. Missing files are ignored. */
export function deletePhotoFiles(storedNames: string[]) {
  if (isWeb) return;
  for (const name of storedNames) {
    if (name.includes('://')) continue;
    try {
      const file = new File(photosDir(), name);
      if (file.exists) file.delete();
    } catch (e) {
      console.warn('Could not delete photo', name, e);
    }
  }
}
