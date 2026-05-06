import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import bilibiliParser from '../services/bilibiliParser';
import downloadManager from '../services/downloadManager';
import storageManager from '../services/storageManager';

const COLORS = {
  primary: '#FB7299',
  background: '#18191C',
  card: '#2A2B2E',
  text: '#FFFFFF',
  textSecondary: '#9499A0',
  border: '#3A3B3E'
};

export default function HomeScreen({ navigation }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setUrl(text);
    }
  };

  const handleParse = async () => {
    if (!url.trim()) {
      Alert.alert('提示', '请输入B站视频链接');
      return;
    }

    setLoading(true);
    try {
      const result = await bilibiliParser.parseAndGetDownloadInfo(url);
      if (result.success) {
        setVideoInfo(result.data);
        if (result.data.qualities.length > 0) {
          setSelectedQuality(result.data.qualities[0]);
        }
      } else {
        Alert.alert('错误', result.error || '解析视频失败');
      }
    } catch (error) {
      Alert.alert('错误', '解析视频时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo || !selectedQuality) {
      return;
    }

    setDownloading(true);
    setDownloadProgress({ percentage: 0, downloaded: 0, total: 0, speed: 0 });

    try {
      await downloadManager.downloadVideo(
        videoInfo,
        selectedQuality,
        (progress) => {
          setDownloadProgress(progress);
        },
        async (result) => {
          if (result.success) {
            await storageManager.saveDownloadHistory({
              ...videoInfo,
              quality: selectedQuality.name,
              filePath: result.filePath,
              fileSize: result.fileSize,
              fileName: result.fileName
            });
            Alert.alert('成功', '视频下载完成！');
            setDownloading(false);
            setDownloadProgress(null);
            setVideoInfo(null);
            setUrl('');
          }
        },
        (error) => {
          Alert.alert('错误', error);
          setDownloading(false);
          setDownloadProgress(null);
        }
      );
    } catch (error) {
      Alert.alert('错误', '下载失败');
      setDownloading(false);
      setDownloadProgress(null);
    }
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(v => v < 10 ? '0' + v : v).filter((v, i) => v !== '00' || i > 0).join(':');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>B站视频下载器</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
        >
          <Ionicons name="time-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>视频链接</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="粘贴B站视频链接..."
              placeholderTextColor={COLORS.textSecondary}
              value={url}
              onChangeText={setUrl}
              editable={!loading && !downloading}
            />
            <TouchableOpacity
              style={styles.pasteButton}
              onPress={handlePaste}
              disabled={loading || downloading}
            >
              <Ionicons name="clipboard-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.parseButton, (loading || downloading) && styles.disabledButton]}
            onPress={handleParse}
            disabled={loading || downloading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.parseButtonText}>解析视频</Text>
            )}
          </TouchableOpacity>
        </View>

        {videoInfo && (
          <View style={styles.videoCard}>
            <Image source={{ uri: videoInfo.pic }} style={styles.thumbnail} />
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {videoInfo.title}
              </Text>
              <View style={styles.videoMeta}>
                <Text style={styles.videoAuthor}>UP主: {videoInfo.author}</Text>
                <Text style={styles.videoDuration}>
                  时长: {formatDuration(videoInfo.duration)}
                </Text>
              </View>
            </View>

            <View style={styles.qualitySection}>
              <Text style={styles.sectionTitle}>选择画质</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.qualityList}
              >
                {videoInfo.qualities.map((quality, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.qualityButton,
                      selectedQuality?.qn === quality.qn && styles.qualityButtonSelected
                    ]}
                    onPress={() => setSelectedQuality(quality)}
                    disabled={downloading}
                  >
                    <Text
                      style={[
                        styles.qualityButtonText,
                        selectedQuality?.qn === quality.qn && styles.qualityButtonTextSelected
                      ]}
                    >
                      {quality.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {downloadProgress && (
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${downloadProgress.percentage}%` }]}
                  />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>{downloadProgress.percentage}%</Text>
                  <Text style={styles.progressText}>
                    {downloadManager.formatFileSize(downloadProgress.downloaded)} / {downloadManager.formatFileSize(downloadProgress.total)}
                  </Text>
                  <Text style={styles.progressText}>
                    {downloadManager.formatSpeed(downloadProgress.speed)}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.downloadButton,
                downloading && styles.disabledButton
              ]}
              onPress={handleDownload}
              disabled={downloading}
            >
              <Ionicons
                name={downloading ? "cloud-download-outline" : "download-outline"}
                size={20}
                color="#fff"
              />
              <Text style={styles.downloadButtonText}>
                {downloading ? '下载中...' : '下载视频'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!videoInfo && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="cloud-download-outline" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyStateText}>粘贴B站视频链接</Text>
            <Text style={styles.emptyStateSubtext}>开始下载您喜欢的视频</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text
  },
  historyButton: {
    padding: 5
  },
  content: {
    flex: 1,
    padding: 20
  },
  inputSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 10
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden'
  },
  input: {
    flex: 1,
    padding: 15,
    color: COLORS.text,
    fontSize: 16
  },
  pasteButton: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  parseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 15
  },
  parseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  disabledButton: {
    opacity: 0.5
  },
  videoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 15,
    marginBottom: 20
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15
  },
  videoInfo: {
    marginBottom: 20
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  videoAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary
  },
  videoDuration: {
    fontSize: 14,
    color: COLORS.textSecondary
  },
  qualitySection: {
    marginBottom: 20
  },
  qualityList: {
    flexDirection: 'row'
  },
  qualityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  qualityButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  qualityButtonText: {
    color: COLORS.text,
    fontSize: 14
  },
  qualityButtonTextSelected: {
    color: '#fff'
  },
  progressSection: {
    marginBottom: 20
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyStateText: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 20,
    fontWeight: '500'
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8
  }
});
