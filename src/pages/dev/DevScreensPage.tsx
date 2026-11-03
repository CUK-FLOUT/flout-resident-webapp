import { generatePath, Link } from 'react-router';
import { Screen } from '@/components/layout';
import { StatusText } from '@/components/ui';
import { PATHS } from '@/constants/paths';
import { DESIGN_SCREENS } from '@/routes/designScreens';
import { SCREENS, figmaNodeUrl, samplePath } from '@/routes/screens';

const groups = [
  ['00', '진입·인증'],
  ['01', '홈·주소'],
  ['02', '취약도·예방 가이드'],
  ['03', '현장점검하기'],
  ['04', '지원하기'],
  ['05', '시공하기'],
  ['06', '내 신청'],
  ['07', '알림'],
] as const;

/** 최신 Figma 프레임별 목록. 관련 경로는 해당 상태의 구현 완료를 뜻하지 않는다. */
export default function DevScreensPage() {
  const linked = DESIGN_SCREENS.filter((screen) => screen.route).length;

  return (
    <Screen header={{ title: '화면 목록 (dev)', onBack: false }}>
      <p className="text-caption text-muted pt-2 pb-4">
        Figma 기준 2026.11.02 · 화면·상태 {DESIGN_SCREENS.length}개 · 직접 연결 {linked}개
        <br />
        상태는 기존 페이지 구현 기준이며 최신 디자인 검수 완료를 뜻하지 않습니다. 관련 경로에서는
        해당 상태가 바로 표시되지 않을 수 있습니다.
      </p>
      {groups.map(([prefix, title]) => (
        <section key={prefix} className="mb-6">
          <h2 className="text-section text-ink mb-2">{title}</h2>
          <ul className="divide-border/60 flex flex-col divide-y">
            {DESIGN_SCREENS.filter((screen) =>
              prefix === '00' ? !/^0[1-7]/.test(screen.name) : screen.name.startsWith(prefix),
            ).map((screen) => {
              const route = screen.route ?? screen.relatedRoute;
              const status =
                screen.status ?? (screen.route ? SCREENS[screen.route]?.status : undefined);
              const target = screen.preview
                ? generatePath(PATHS.devScreenPreview, { screen: screen.preview })
                : route
                  ? screen.sampleApplicationId
                    ? PATHS[route].replace(':applicationId', screen.sampleApplicationId)
                    : samplePath(PATHS[route])
                  : undefined;
              return (
                <li key={screen.nodeId} className="flex flex-col gap-2 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-label text-ink min-w-0 break-words">{screen.name}</span>
                    <StatusText
                      tone={status === 'done' ? 'success' : status === 'wip' ? 'warning' : 'muted'}
                      indicator="dot"
                      className="shrink-0"
                    >
                      {status === 'done' ? '구현됨' : status === 'wip' ? '작업 중' : '구현 예정'}
                    </StatusText>
                  </div>
                  {target ? (
                    <Link to={target} className="text-caption text-primary break-all underline">
                      화면 열기 · {target}
                    </Link>
                  ) : (
                    <span className="text-caption text-muted">경로 미연결</span>
                  )}
                  <a
                    href={figmaNodeUrl(screen.nodeId)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-caption text-primary w-fit underline"
                  >
                    Figma 디자인 ↗
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Screen>
  );
}
