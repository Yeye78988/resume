import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Button, Affix, Upload, Spin, message, Alert, Modal } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/lib/upload';
import _ from 'lodash-es';
import qs from 'query-string';
import jsonUrl from 'json-url';
import { FormattedMessage, useIntl } from 'react-intl';
import { getLanguage } from '@/i18n';
import { useModeSwitcher } from '@/hooks/useModeSwitcher';
import { getDefaultTitleNameMap } from '@/data/constant';
import { getSearchObj } from '@/helpers/location';
import { customAssign } from '@/helpers/customAssign';
import { copyToClipboard } from '@/helpers/copy-to-board';
import { getDevice } from '@/helpers/detect-device';
import { exportDataToLocal } from '@/helpers/export-to-local';
import { getConfig, saveToLocalStorage } from '@/helpers/store-to-local';
import { fetchResume } from '@/helpers/fetch-resume';
import { Drawer } from './Drawer';
import { Resume } from './Resume';
import type { ResumeConfig, ThemeConfig } from './types';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useResumeData } from '@/hooks/useResumeData';

import './index.less';

const codec = jsonUrl('lzma');

export const Page: React.FC = () => {
  const lang = getLanguage();
  const intl = useIntl();
  const user = getSearchObj().user || 'visiky';

  const [, mode, changeMode] = useModeSwitcher({});

  const {
    loading,
    config,
    originalConfig,
    changeConfig,
    setConfig,
  } = useResumeData();
  const { saveStatus, autoSaveChanges } = useAutoSave();

  const query = getSearchObj();
  const [theme, setTheme] = useState<ThemeConfig>({
    color: '#2f5785',
    tagColor: '#8bc34a',
  });

  useEffect(() => {
    const {
      pathname,
      hash: currentHash,
      search: currentSearch,
    } = window.location;
    const hash = currentHash === '#/' ? '' : currentHash;
    const searchObj = qs.parse(currentSearch);
    if (!searchObj.template) {
      const search = qs.stringify({
        template: config?.template || 'template1',
        ...qs.parse(currentSearch),
      });
      window.location.href = `${pathname}?${search}${hash}`;
    }
  }, [config]);

  const updateTemplate = (value: string) => {
    const {
      pathname,
      hash: currentHash,
      search: currentSearch,
    } = window.location;
    const hash = currentHash === '#/' ? '' : currentHash;
    const search = qs.stringify({
      ...qs.parse(currentSearch),
      template: value,
    });

    window.location.href = `${pathname}?${search}${hash}`;
  };

  const onConfigChange = useCallback(
    (v: Partial<ResumeConfig>) => {
      const newConfig = _.assign({}, config, v);
      changeConfig(newConfig);
      saveToLocalStorage(query.user as string, newConfig);
      autoSaveChanges(newConfig);
    },
    [config, query.user, changeConfig, autoSaveChanges]
  );

  const onThemeChange = useCallback(
    (v: Partial<ThemeConfig>) => {
      setTheme(_.assign({}, theme, v));
    },
    [theme]
  );

  useEffect(() => {
    if (getDevice() === 'mobile') {
      message.info(
        intl.formatMessage({ id: '移动端只提供查看功能，在线制作请前往 PC 端' })
      );
    }
  }, []);

  const [box, setBox] = useState({ width: 0, height: 0, left: 0 });

  useEffect(() => {
    const targetNode = document.querySelector('.resume-content');
    if (!targetNode) return;

    const observer = new MutationObserver(() => {
      setBox(targetNode.getBoundingClientRect());
    });
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // 再加一个定时器，监控下变化
    const interval = setInterval(() => {
      setBox(targetNode.getBoundingClientRect());
    }, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  const importConfig = (file: RcFile) => {
    if (window.FileReader) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          if (reader.result) {
            // @ts-ignore
            const newConfig: ConfigProps = JSON.parse(reader.result);
            onThemeChange(newConfig.theme);
            onConfigChange(_.omit(newConfig, 'theme'));
          }
          message.success(intl.formatMessage({ id: '上传配置已应用' }));
        } catch (err) {
          message.error(intl.formatMessage({ id: '上传文件有误，请重新上传' }));
        }
      };
      reader.readAsText(file);
    } else {
      message.error(
        intl.formatMessage({
          id: '您当前浏览器不支持 FileReader，建议使用谷歌浏览器',
        })
      );
    }
    return false;
  };

  function getConfigJson() {
    let fullConfig = config;
    if (lang !== 'zh-CN') {
      fullConfig = customAssign({}, originalConfig?.current, {
        locales: { [lang]: config },
      });
    }
    return JSON.stringify({ ...fullConfig, theme });
  }

  const copyConfig = () => {
    copyToClipboard(getConfigJson());
  };

  const exportConfig = () => {
    exportDataToLocal(getConfigJson(), `${user}'s resume info`);
  };

  const handleSharing = () => {
    // ... (此处省略，可以后续也拆成 hook)
  };

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
            <Spin size="small" style={{ marginRight: '8px' }} />
            正在保存...
          </span>
        );
      case 'saved':
        return (
          <span style={{ color: '#52c41a' }}>
            <CheckCircleOutlined style={{ marginRight: '8px' }} />
            已保存
          </span>
        );
      case 'error':
        return (
          <span style={{ color: '#f5222d' }}>
            <CloseCircleOutlined style={{ marginRight: '8px' }} />
            保存失败
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <Spin spinning={loading}>
        <div className="page">
          {config && (
            <Resume
              value={config}
              theme={theme}
              template={query.template || 'template1'}
            />
          )}
          {mode === 'edit' && (
            <React.Fragment>
              <Affix offsetTop={0}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    paddingLeft: 12,
                    borderBottom: '1px solid #f0f0f0',
                  }}
                >
                  <Button.Group className="btn-group">
                    <Drawer
                      value={config}
                      onValueChange={onConfigChange}
                      theme={theme}
                      onThemeChange={onThemeChange}
                      template={(query.template as string) || 'template1'}
                      onTemplateChange={updateTemplate}
                    />
                    <Button type="primary" onClick={copyConfig}>
                      <FormattedMessage id="复制配置" />
                    </Button>
                    <Button type="primary" onClick={exportConfig}>
                      <FormattedMessage id="保存简历" />
                    </Button>
                    <Upload
                      accept=".json"
                      showUploadList={false}
                      beforeUpload={importConfig}
                    >
                      <Button className="btn-upload">
                        <FormattedMessage id="导入配置" />
                      </Button>
                    </Upload>
                    <Button type="primary" onClick={() => window.print()}>
                      <FormattedMessage id="下载 PDF" />
                    </Button>
                    <Button type="primary" onClick={handleSharing}>
                      <FormattedMessage id="分享" />
                    </Button>
                  </Button.Group>
                  <div style={{ marginLeft: 24, minWidth: 120 }}>
                    {renderSaveStatus()}
                  </div>
                </div>
              </Affix>
              <div
                className="box-size-info"
                style={{
                  top: `${box.height + 4}px`,
                  left: `${box.width + box.left}px`,
                }}
              >
                ({box.width}, {box.height})
              </div>
            </React.Fragment>
          )}
        </div>
      </Spin>
    </React.Fragment>
  );
};

export default Page;
