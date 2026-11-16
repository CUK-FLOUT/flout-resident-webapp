import { useEffect } from 'react';
import { env } from '@/lib/env';
import { inspectionFormFields, saveInspectionProgress } from '@/lib/inspectionForm';
import { useInspectionDraft, type Draft } from '@/stores/inspectionDraft';

export function useInspectionAutosave(
  draft: Draft,
  enabled: boolean,
  setError: (message: string) => void,
) {
  const snapshot = JSON.stringify(inspectionFormFields(draft));
  useEffect(() => {
    if (!enabled || env.useMock || draft.submitting) return;
    const isCurrent = () => {
      const current = useInspectionDraft.getState();
      return (
        current.context === draft.context &&
        JSON.stringify(inspectionFormFields(current)) === snapshot
      );
    };
    const timer = window.setTimeout(() => {
      void saveInspectionProgress()
        .then(() => {
          const current = useInspectionDraft.getState();
          if (
            isCurrent() &&
            (current.formSnapshot === snapshot || current.savedPayload === snapshot)
          )
            setError('');
        })
        .catch((failure: unknown) => {
          if (isCurrent())
            setError(
              failure instanceof Error ? failure.message : '신청서를 임시 저장하지 못했어요.',
            );
        });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [snapshot, enabled, draft.context, draft.submitting, setError]);
  useEffect(() => {
    const context = draft.context;
    if (!enabled || env.useMock || !context) return;
    return () => {
      const current = useInspectionDraft.getState();
      if (current.context === context && !current.submitting)
        void saveInspectionProgress().catch(() => undefined);
    };
  }, [draft.context, enabled]);
}
