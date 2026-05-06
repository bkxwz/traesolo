import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  DOWNLOAD_HISTORY: '@bilibili_downloader:history',
  SETTINGS: '@bilibili_downloader:settings'
};

export class StorageManager {
  async saveDownloadHistory(videoData) {
    try {
      const history = await this.getDownloadHistory();
      const existingIndex = history.findIndex(item => item.bvid === videoData.bvid);
      
      const newHistoryItem = {
        ...videoData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        history[existingIndex] = newHistoryItem;
      } else {
        history.unshift(newHistoryItem);
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.DOWNLOAD_HISTORY,
        JSON.stringify(history)
      );

      return true;
    } catch (error) {
      console.error('保存下载历史错误:', error);
      return false;
    }
  }

  async getDownloadHistory() {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.DOWNLOAD_HISTORY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
      console.error('获取下载历史错误:', error);
      return [];
    }
  }

  async removeFromHistory(id) {
    try {
      const history = await this.getDownloadHistory();
      const filteredHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(
        STORAGE_KEYS.DOWNLOAD_HISTORY,
        JSON.stringify(filteredHistory)
      );
      return true;
    } catch (error) {
      console.error('删除历史记录错误:', error);
      return false;
    }
  }

  async clearHistory() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.DOWNLOAD_HISTORY);
      return true;
    } catch (error) {
      console.error('清除历史记录错误:', error);
      return false;
    }
  }

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );
      return true;
    } catch (error) {
      console.error('保存设置错误:', error);
      return false;
    }
  }

  async getSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : {
        defaultQuality: '1080P',
        autoDownload: false,
        notifications: true
      };
    } catch (error) {
      console.error('获取设置错误:', error);
      return {
        defaultQuality: '1080P',
        autoDownload: false,
        notifications: true
      };
    }
  }
}

export default new StorageManager();
