import fetch from 'cross-fetch';
import _ from 'lodash-es';
import type { ResumeConfig } from '@/components/types';
import { customAssign } from './customAssign';

// 将数据保存到本地后端
function saveToLocalApi(data: ResumeConfig) {
  fetch('http://localhost:3001/api/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(err => {
    console.error('Failed to save initial data to local API:', err);
  });
}

// 指向你自己仓库中的 resume.json 模板文件
const GITHUB_URL =
  'https://raw.githubusercontent.com/Yeye78988/resume/main/resume.json';

export function fetchResume(lang: string): Promise<ResumeConfig> {
  return fetch('http://localhost:3001/api/resume')
    .then(async res => {
      if (!res.ok) {
        throw new Error('Local API request failed');
      }
      const data = await res.json();
      // 如果本地数据库为空对象，也认为需要从远端初始化
      if (_.isEmpty(data)) {
        throw new Error('Local API is empty, fetch from remote');
      }
      return data;
    })
    .catch(() => {
      // 如果本地API请求失败或数据为空，则从 GitHub 获取模板
      return fetch(GITHUB_URL)
        .then(res => {
          if (!res.ok) {
            throw new Error('GitHub fetch failed');
          }
          return res.json();
        })
        .then(githubData => {
          // 将从 GitHub 获取的数据保存到本地后端，完成初始化
          saveToLocalApi(githubData);
          return githubData;
        });
    })
    .then(data => {
      // 统一处理国际化数据，将对应语言的数据合并到顶层
      return _.omit(customAssign({}, data, _.get(data, ['locales', lang])), [
        'locales',
      ]);
    });
}
