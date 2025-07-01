import { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import qs from 'query-string';
import _ from 'lodash-es';
import { useIntl } from 'react-intl';
import { getSearchObj } from '@/helpers/location';
import { fetchResume } from '@/helpers/fetch-resume';
import { getConfig } from '@/helpers/store-to-local';
import { customAssign } from '@/helpers/customAssign';
import { getDefaultTitleNameMap } from '@/data/constant';
import type { ResumeConfig } from '@/components/types';

export function useResumeData() {
  const intl = useIntl();
  const query = getSearchObj();
  const lang = intl.locale;

  const [config, setConfig] = useState<ResumeConfig>();
  const [loading, setLoading] = useState<boolean>(true);
  const originalConfig = useRef<ResumeConfig>();

  const changeConfig = (v: Partial<ResumeConfig>) => {
    setConfig(
      _.assign({}, { titleNameMap: getDefaultTitleNameMap({ intl }) }, v)
    );
  };

  useEffect(() => {
    const user = (query.user || '') as string;
    const branch = (query.branch || 'master') as string;
    const mode = query.mode;

    function store(data) {
      originalConfig.current = data;
      changeConfig(
        _.omit(customAssign({}, data, _.get(data, ['locales', lang])), [
          'locales',
        ])
      );
      setLoading(false);
    }

    if (query.shareId) {
      setLoading(true);
      fetch(`http://localhost:3001/api/share/${query.shareId}`)
        .then(res =>
          res.ok
            ? res.json()
            : Promise.reject(new Error('分享链接无效或已过期'))
        )
        .then(store)
        .catch(err => {
          message.error(err.message);
          setLoading(false);
        });
      return;
    }

    if (!mode) {
      const link = `https://github.com/${user}/${user}/tree/${branch}`;
      fetchResume(lang, branch, user)
        .then(store)
        .catch(() => {
          // ... (此处保留原有的错误处理Modal)
        });
    } else {
      getConfig(lang, branch, user).then(store);
    }
  }, [lang, query.user, query.branch, query.shareId]);

  return { loading, config, originalConfig, changeConfig, setConfig };
}
