import { Link, useParams } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { Screen } from '@/components/layout';
import { InfoCard } from '@/components/ui';
import { PATHS, type PathKey } from '@/constants/paths';
import { SAMPLE_PARAMS, SCREENS, figmaNodeUrl } from '@/routes/screens';

/**
 * 아직 구현하지 않은 화면의 자리표시.
 * Figma 프레임 링크 · 기능명세 ID · 다음 화면 이동 버튼을 보여줘서 플로우를 끝까지 클릭해 볼 수 있습니다.
 * 화면을 구현하면 이 컴포넌트 사용을 지우고 screens.ts 의 status 를 'done' 으로 바꿔 주세요.
 */
export function ScreenPlaceholder({ screen }: { screen: PathKey }) {
  const meta = SCREENS[screen];
  const params = useParams();

  const fill = (pattern: string) =>
    pattern.replace(
      /:(\w+)/g,
      (_, key: string) => params[key] ?? SAMPLE_PARAMS[key as keyof typeof SAMPLE_PARAMS] ?? key,
    );

  return (
    <Screen header={{ title: meta?.figmaName ?? screen }}>
      <div className="flex flex-col gap-4 pt-4">
        <InfoCard eyebrow="구현 예정 화면" title={meta?.figmaName ?? screen}>
          <p>
            경로 <code className="text-caption">{PATHS[screen]}</code>
          </p>
          {meta?.specs.length ? <p>기능명세 {meta.specs.join(', ')}</p> : null}
        </InfoCard>

        {meta && (
          <section className="flex flex-col gap-2">
            <p className="text-label text-ink">Figma</p>
            {meta.figmaNodes.map((node) => (
              <a
                key={node}
                href={figmaNodeUrl(node)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-body text-primary underline"
              >
                node {node} <ExternalLink size={14} />
              </a>
            ))}
            {meta.sheets?.map((s) => (
              <a
                key={s.figmaNode}
                href={figmaNodeUrl(s.figmaNode)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-body text-primary underline"
              >
                바텀시트 · {s.figmaName} <ExternalLink size={14} />
              </a>
            ))}
          </section>
        )}

        {meta?.next?.length ? (
          <section className="flex flex-col gap-2">
            <p className="text-label text-ink">다음 화면</p>
            {meta.next.map((key) => (
              <Link
                key={key}
                to={fill(PATHS[key])}
                className="flex h-11 items-center rounded-md border border-border px-4 text-label text-ink"
              >
                {SCREENS[key]?.figmaName ?? key}
              </Link>
            ))}
          </section>
        ) : null}
      </div>
    </Screen>
  );
}
