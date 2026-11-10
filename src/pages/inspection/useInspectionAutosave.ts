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
    const timer = window.setTimeout(() => {
  const savedSnapshot = snapshot;

  void saveInspectionProgress()
    .then(() => {
      const current = useInspectionDraft.getState();

      if (
        JSON.stringify(inspectionFormFields(current)) === savedSnapshot &&
        (current.formSnapshot === savedSnapshot ||
          current.savedPayload === savedSnapshot)
      ) {
        setError('');
      }
    })
    .catch((failure: unknown) => {
      setError(
        failure instanceof Error ? failure.message : '신청서를 임시 저장하지 못했어요.',
      );
    });
}, 650);
    return () => window.clearTimeout(timer);
  }, [snapshot, enabled, draft.submitting, setError]);
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
