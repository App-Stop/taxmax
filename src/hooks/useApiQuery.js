import { useEffect, useState, useCallback } from 'react';

// Runs `fetcher` whenever `key` changes. `key` must capture every input the
// request depends on. While a new request is in flight the previous data is
// kept (so tables don't flash empty between pages) and `loading` is true.
export default function useApiQuery(key, fetcher) {
  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });
  const requestKey = `${key}#${nonce}`;

  useEffect(() => {
    let active = true;
    fetcher().then(
      (data) => active && setResult({ key: requestKey, data, error: null }),
      (error) => active && setResult((prev) => ({ key: requestKey, data: prev.data, error })),
    );
    return () => {
      active = false;
    };
    // The request is fully described by requestKey; fetcher is a new closure every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const settled = result.key === requestKey;

  return {
    data: result.data,
    error: settled ? result.error : null,
    loading: !settled,
    reload,
  };
}
