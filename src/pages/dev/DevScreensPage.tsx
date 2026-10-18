import { Link } from 'react-router';
import { Screen } from '@/components/layout';
import { StatusText } from '@/components/ui';
import { PATHS, type PathKey } from '@/constants/paths';
import { SCREENS, samplePath, type ScreenMeta } from '@/routes/screens';

/**
 * 개발용 전체 화면 목록 (/__screens). dev 서버에서만 라우트가 등록됩니다.
 * 팀원이 어떤 화면이 구현됐는지 / 어디로 가는지 한눈에 보기 위한 페이지.
 */
export default function DevScreensPage() {
  const entries = Object.entries(SCREENS) as [PathKey, ScreenMeta][];
  const groups = [...new Set(entries.map(([, m]) => m.group))];
  const done = entries.filter(([, m]) => m.status === 'done').length;

  return (
    <Screen header={{ title: '화면 목록 (dev)', onBack: false }}>
      <p className="pt-2 pb-4 text-caption text-muted">
        구현 {done} / {entries.length} · 목업 데이터 기준 샘플 경로로 이동합니다.
      </p>
      {groups.map((group) => (
        <section key={group} className="mb-6">
          <h2 className="mb-2 text-section text-ink">{group}</h2>
          <ul className="flex flex-col divide-y divide-border/60">
            {entries
              .filter(([, m]) => m.group === group)
              .map(([key, m]) => (
                <li key={key}>
                  <Link
                    to={samplePath(PATHS[key])}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-label text-ink">{m.figmaName}</span>
                      <span className="text-caption text-muted">{PATHS[key]}</span>
                    </span>
                    <StatusText
                      tone={
                        m.status === 'done' ? 'success' : m.status === 'wip' ? 'warning' : 'muted'
                      }
                      indicator="dot"
                    >
                      {m.status}
                    </StatusText>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </Screen>
  );
}
