import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

export class DownloadManager {
  constructor() {
    this.activeDownloads = new Map();
  }

  async requestPermissions() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  sanitizeFileName(fileName) {
    return fileName.replace(/[<>:"/\\|?*]+/g, '_');
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatSpeed(bytesPerSecond) {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async downloadVideo(videoInfo, quality, onProgress, onComplete, onError) {
    const downloadId = videoInfo.bvid;
    const downloadStartTime = Date.now();
    
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        onError && onError('需要存储权限才能下载视频');
        return;
      }

      const fileName = this.sanitizeFileName(`${videoInfo.title}_${quality.name}.mp4`);
      const directory = FileSystem.documentDirectory + 'downloads/';
      const dirInfo = await FileSystem.getInfoAsync(directory);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      const fileUri = directory + fileName;

      const downloadResumable = FileSystem.createDownloadResumable(
        videoInfo.videoUrl,
        fileUri,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.bilibili.com/'
          }
        },
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          const percentage = Math.round(progress * 100);
          
          const elapsedSeconds = (Date.now() - downloadStartTime) / 1000;
          const speed = elapsedSeconds > 0 ? downloadProgress.totalBytesWritten / elapsedSeconds : 0;
          
          onProgress && onProgress({
            percentage,
            downloaded: downloadProgress.totalBytesWritten,
            total: downloadProgress.totalBytesExpectedToWrite,
            speed: Math.round(speed)
          });
        }
      );

      this.activeDownloads.set(downloadId, downloadResumable);

      const result = await downloadResumable.downloadAsync();
      
      this.activeDownloads.delete(downloadId);

      if (result && result.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(result.uri);
        const album = await MediaLibrary.getAlbumAsync('B站视频');
        
        if (album === null) {
          await MediaLibrary.createAlbumAsync('B站视频', asset, false);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }

        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        
        onComplete && onComplete({
          success: true,
          filePath: result.uri,
          fileName,
          fileSize: fileInfo.size || videoInfo.size,
          videoInfo: {
            ...videoInfo,
            quality: quality.name,
            downloadDate: Date.now()
          }
        });
      } else {
        onError && onError('下载失败');
      }
    } catch (error) {
      this.activeDownloads.delete(downloadId);
      console.error('下载错误:', error);
      onError && onError(error.message || '下载过程中发生错误');
    }
  }

  cancelDownload(downloadId) {
    const download = this.activeDownloads.get(downloadId);
    if (download) {
      download.cancelAsync();
      this.activeDownloads.delete(downloadId);
      return true;
    }
    return false;
  }

  async getDownloadHistory() {
    try {
      const directory = FileSystem.documentDirectory + 'downloads/';
      const dirInfo = await FileSystem.getInfoAsync(directory);
      
      if (!dirInfo.exists) {
        return [];
      }

      const files = await FileSystem.readDirectoryAsync(directory);
      const videoFiles = files.filter(file => file.endsWith('.mp4'));
      
      return videoFiles.map(file => ({
        name: file,
        path: directory + file
      }));
    } catch (error) {
      console.error('获取下载历史错误:', error);
      return [];
    }
  }

  async deleteVideo(filePath) {
    try {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
      return true;
    } catch (error) {
      console.error('删除视频错误:', error);
      return false;
    }
  }
}

export default new DownloadManager();
