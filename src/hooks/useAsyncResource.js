import {useCallback, useEffect, useRef, useState} from 'react';

const useAsyncResource = (loader, dependencies = []) => {
  const loaderRef = useRef(loader);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const load = useCallback(
    async (options = {}) => {
      const isRefresh = Boolean(options.forceRefresh);
      console.log('useAsyncResource: load called. forceRefresh:', isRefresh);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await loaderRef.current(options);
        console.log('useAsyncResource: load succeeded. Result:', result ? 'has data' : 'empty');
        setData(result);
        return result;
      } catch (loadError) {
        console.error('useAsyncResource: load failed. Error:', loadError);
        setError(loadError.message || 'Unable to load data');
        return null;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies,
  );

  useEffect(() => {
    console.log('useAsyncResource: useEffect triggering load');
    load();
  }, [load]);

  const refresh = useCallback(() => {
    console.log('useAsyncResource: refresh called');
    return load({forceRefresh: true});
  }, [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    reload: load,
    refresh,
  };
};

export default useAsyncResource;
