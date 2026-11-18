import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { DEFAULT_PLANS } from '../data/plans';

/** Programmes (merged with the backend list when reachable) and the public Web3Forms key. */
export function usePlans(enabled = true) {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [web3formsKey, setWeb3formsKey] = useState('');

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    fetch('/api/public/config')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.web3formsKey) setWeb3formsKey(data.web3formsKey);
        if (data.status === 'success' && data.plans && data.plans.length > 0) {
          setPlans(
            data.plans.map((p) => {
              const match = DEFAULT_PLANS.find((d) => d.id === p.id);
              return {
                ...match,
                ...p,
                accentColor: match ? match.accentColor : '#7C3AED',
                icon: match ? match.icon : Users,
                deliverables: match ? match.deliverables : 'All Deliverables',
              };
            }),
          );
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [enabled]);

  return { plans, web3formsKey };
}
