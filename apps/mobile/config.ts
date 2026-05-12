import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extraApiUrl = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
const fallbackApiUrl = Platform.OS === 'web'
  ? 'http://localhost:8000/api'
  : 'http://10.0.2.2:8000/api';

export const API_URL = extraApiUrl || fallbackApiUrl;
