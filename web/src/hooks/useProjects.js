import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
export function useProjects() {
  const [state, setState] = useState({ status: 'loading', data: [], error: null });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState(prev => ({ ...prev, status: 'loading', error: null }));
    api.projects.list({}, { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setState({ status: 'success', data, error: null }); })
      .catch(error => { if (!controller.signal.aborted) setState({ status: 'error', data: [], error }); })
      .finally(() => {
        if (!controller.signal.aborted) requestAnimationFrame(() => {
          if (!controller.signal.aborted) window.dispatchEvent(new Event('page-content-ready'));
        });
      });
    return () => controller.abort();
  }, [tick]);
  useEffect(() => {
    window.addEventListener('projects-updated', reload);
    return () => window.removeEventListener('projects-updated', reload);
  }, [reload]);
  return { ...state, reload };
}
