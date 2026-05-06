import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import storageManager from '../services/storageManager';
import downloadManager from '../services/downloadManager';

const COLORS = {
  primary: '#FB7299',
  background: '#18191C',
  card: '#2A2B2E',
  text: '#FFFFFF',
  textSecondary: '#9499A0',
  border: '#3A3B3E'
};

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await storageManager.getDownloadHistory();
    setHistory(data);
  };

  const handlePlay = async (item) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(item.filePath);
      if (fileInfo.exists) {
        await Sharing.shareAsync(item.filePath, {
          mimeType: 'video/mp4',
          dialogTitle: item.title
        });
      } else {
        Alert.alert('提示', '视频文件不存在');
      }
    } catch (error) {
      Alert.alert('错误', '无法播放视频');
    }
  };

  const handleShare = async (item) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(item.filePath);
      if (fileInfo.exists) {
        await Sharing.shareAsync(item.filePath, {
          mimeType: 'video/mp4',
          dialogTitle: item.title
        });
      } else {
        Alert.alert('提示', '视频文件不存在');
      }
    } catch (error) {
      Alert.alert('错误', '分享失败');
    }
  };

  const handleDelete = (item) => {
    Alert.alert(
      '确认删除',
      `确定要删除视频"${item.title}"吗？`,
      [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              if (item.filePath) {
                await downloadManager.deleteVideo(item.filePath);
              }
              await storageManager.removeFromHistory(item.id);
              loadHistory();
            } catch (error) {
              Alert.alert('错误', '删除失败');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.videoCard}>
      <Image source={{ uri: item.pic }} style={styles.thumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.videoMeta}>
          <Text style={styles.videoAuthor}>UP主: {item.author}</Text>
          <Text style={styles.videoQuality}>{item.quality}</Text>
        </View>
        <View style={styles.videoDetails}>
          {item.fileSize && (
            <Text style={styles.videoDetailsText}>
              {downloadManager.formatFileSize(item.fileSize)}
            </Text>
          )}
          <Text style={styles.videoDetailsText}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePlay(item)}
          >
            <Ionicons name="play-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>播放</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(item)}
          >
            <Ionicons name="share-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>分享</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF4444" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>删除</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>下载历史</Text>
        <View style={{ width: 44 }} />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={80} color={COLORS.textSecondary} />
          <Text style={styles.emptyStateText}>暂无下载历史</Text>
          <Text style={styles.emptyStateSubtext}>下载的视频会显示在这里</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
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
  backButton: {
    padding: 5
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text
  },
  list: {
    padding: 20
  },
  videoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row'
  },
  thumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8
  },
  videoInfo: {
    flex: 1,
    marginLeft: 12
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  videoAuthor: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  videoQuality: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500'
  },
  videoDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  videoDetailsText: {
    fontSize: 11,
    color: COLORS.textSecondary
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    gap: 4
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)'
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.primary
  },
  deleteButtonText: {
    color: '#FF4444'
  },
  emptyState: {
    flex: 1,
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
