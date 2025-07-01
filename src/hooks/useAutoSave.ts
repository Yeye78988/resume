import { useState, useCallback } from 'react';
import { message } from 'antd';
import type { ResumeConfig } from '@/components/types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useAutoSave() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const autoSaveChanges = useCallback((config: ResumeConfig) => {
    setSaveStatus('saving');
    fetch('http://localhost:3001/api/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
      .then(res => {
        if (!res.ok) throw new Error('Save failed');
        setSaveStatus('saved');
      })
      .catch(() => {
        setSaveStatus('error');
      })
      .finally(() => {
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      });
  }, []);

  return { saveStatus, autoSaveChanges };
}
