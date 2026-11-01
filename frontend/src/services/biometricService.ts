import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: 'fingerprint' | 'facial' | 'iris';
}

class BiometricService {
  // Check if biometric authentication is available
  async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  // Get supported biometric types
  async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported types:', error);
      return [];
    }
  }

  // Get biometric type name
  getBiometricTypeName(type: LocalAuthentication.AuthenticationType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Vân tay';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Khuôn mặt';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Mống mắt';
      default:
        return 'Sinh trắc học';
    }
  }

  // Get all supported biometric types
  getSupportedBiometricTypes(supportedTypes: LocalAuthentication.AuthenticationType[]): string[] {
    return supportedTypes.map(type => this.getBiometricTypeName(type));
  }

  // Get primary biometric type (first available)
  getPrimaryBiometricType(supportedTypes: LocalAuthentication.AuthenticationType[]): string {
    if (supportedTypes.length === 0) return 'Sinh trắc học';
    
    // Priority: Face ID > Fingerprint > Iris
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Khuôn mặt';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Vân tay';
    }
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Mống mắt';
    }
    
    return this.getBiometricTypeName(supportedTypes[0]);
  }

  // Authenticate with biometric
  async authenticate(reason: string = 'Xác thực danh tính của bạn'): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Thiết bị không hỗ trợ sinh trắc học hoặc chưa được thiết lập'
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Hủy',
        fallbackLabel: 'Sử dụng mật khẩu',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const supportedTypes = await this.getSupportedTypes();
        const biometricType = supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) 
          ? 'fingerprint' 
          : supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) 
          ? 'facial' 
          : 'iris';

        return {
          success: true,
          biometricType: biometricType as 'fingerprint' | 'facial' | 'iris'
        };
      } else {
        return {
          success: false,
          error: result.error || 'Xác thực thất bại'
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Lỗi xác thực sinh trắc học'
      };
    }
  }

  // Save biometric preference
  async saveBiometricPreference(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('biometric_enabled', JSON.stringify(enabled));
    } catch (error) {
      console.error('Error saving biometric preference:', error);
    }
  }

  // Get biometric preference
  async getBiometricPreference(): Promise<boolean> {
    try {
      const preference = await AsyncStorage.getItem('biometric_enabled');
      return preference ? JSON.parse(preference) : false;
    } catch (error) {
      console.error('Error getting biometric preference:', error);
      return false;
    }
  }

  // Save biometric credentials (encrypted)
  async saveBiometricCredentials(userId: string, email: string): Promise<void> {
    try {
      const credentials = {
        userId,
        email,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem('biometric_credentials', JSON.stringify(credentials));
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
    }
  }

  // Get biometric credentials
  async getBiometricCredentials(): Promise<{ userId: string; email: string; timestamp: number } | null> {
    try {
      const credentials = await AsyncStorage.getItem('biometric_credentials');
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('Error getting biometric credentials:', error);
      return null;
    }
  }

  // Clear biometric credentials
  async clearBiometricCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem('biometric_credentials');
    } catch (error) {
      console.error('Error clearing biometric credentials:', error);
    }
  }
}

export const biometricService = new BiometricService();
