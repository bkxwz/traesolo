import axios from 'axios';

export class BilibiliParser {
  constructor() {
    this.baseUrl = 'https://api.bilibili.com';
  }

  extractVideoId(url) {
    const bvMatch = url.match(/BV[a-zA-Z0-9]+/);
    if (bvMatch) {
      return bvMatch[0];
    }
    const avidMatch = url.match(/av(\d+)/);
    if (avidMatch) {
      return `av${avidMatch[1]}`;
    }
    return null;
  }

  async getVideoInfo(videoId) {
    try {
      let url;
      if (videoId.startsWith('BV')) {
        url = `${this.baseUrl}/x/web-interface/view?bvid=${videoId}`;
      } else {
        const aid = videoId.replace('av', '');
        url = `${this.baseUrl}/x/web-interface/view?aid=${aid}`;
      }

      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.bilibili.com/'
        }
      });

      if (response.data.code === 0) {
        const data = response.data.data;
        return {
          success: true,
          data: {
            bvid: data.bvid,
            aid: data.aid,
            title: data.title,
            pic: data.pic,
            duration: data.duration,
            author: data.owner.name,
            authorFace: data.owner.face,
            views: data.stat.view,
            cid: data.cid
          }
        };
      }
      return { success: false, error: '获取视频信息失败' };
    } catch (error) {
      console.error('获取视频信息错误:', error);
      return { success: false, error: error.message };
    }
  }

  async getVideoPlayUrl(aid, cid) {
    try {
      const url = `${this.baseUrl}/x/player/playurl?aid=${aid}&cid=${cid}&qn=80&type=&otype=json`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.bilibili.com/'
        }
      });

      if (response.data.code === 0) {
        const data = response.data.data;
        const qualities = [];
        
        if (data.accept_quality && data.accept_description) {
          data.accept_quality.forEach((qn, index) => {
            qualities.push({
              qn: qn,
              name: data.accept_description[index]
            });
          });
        }

        let videoUrl = '';
        if (data.durl && data.durl.length > 0) {
          videoUrl = data.durl[0].url;
        }

        return {
          success: true,
          data: {
            qualities,
            videoUrl,
            duration: data.durl?.[0]?.length || 0,
            size: data.durl?.[0]?.size || 0
          }
        };
      }
      return { success: false, error: '获取播放地址失败' };
    } catch (error) {
      console.error('获取播放地址错误:', error);
      return { success: false, error: error.message };
    }
  }

  async parseAndGetDownloadInfo(url) {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      return { success: false, error: '无效的B站视频链接' };
    }

    const videoInfoResult = await this.getVideoInfo(videoId);
    if (!videoInfoResult.success) {
      return videoInfoResult;
    }

    const playUrlResult = await this.getVideoPlayUrl(
      videoInfoResult.data.aid,
      videoInfoResult.data.cid
    );

    if (!playUrlResult.success) {
      return playUrlResult;
    }

    return {
      success: true,
      data: {
        ...videoInfoResult.data,
        ...playUrlResult.data
      }
    };
  }
}

export default new BilibiliParser();
